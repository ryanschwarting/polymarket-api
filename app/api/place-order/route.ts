import { NextRequest, NextResponse } from "next/server";
import { PolymarketError, PolymarketErrorType } from "@/lib/polymarket";
import { Side } from "@polymarket/clob-client";
import { z } from "zod";

// Define validation schema for request body
const orderSchema = z.object({
  tokenID: z.string().min(1, "Token ID is required"),
  price: z.number().positive("Price must be positive"),
  side: z.enum(["BUY", "SELL"], {
    errorMap: () => ({ message: "Side must be either BUY or SELL" }),
  }),
  size: z.number().positive("Size must be positive"),
  orderType: z
    .enum(["GTC", "GTD", "FOK"], {
      errorMap: () => ({ message: "Order type must be GTC, GTD, or FOK" }),
    })
    .default("GTC"),
  expiration: z.number().optional(), // Required for GTD orders
  feeRateBps: z.number().default(100), // Default fee rate
});

// Request body type
export type PlaceOrderRequest = z.infer<typeof orderSchema>;

// Ensure the route isn't statically cached
export const dynamic = "force-dynamic";

// POST handler for placing an order
export async function POST(req: NextRequest) {
  try {
    // Dynamically import the polymarket client
    const { polymarket } = await import("@/lib/polymarket");

    // Parse and validate request body
    const body = await req.json();
    const validationResult = orderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const orderData = validationResult.data;

    // Map string side to enum
    const side = orderData.side === "BUY" ? Side.BUY : Side.SELL;

    // Check if GTD order has expiration
    if (orderData.orderType === "GTD" && !orderData.expiration) {
      return NextResponse.json(
        {
          success: false,
          error: "Expiration timestamp is required for GTD orders",
        },
        { status: 400 }
      );
    }

    // Generate a unique nonce
    const nonce = Date.now();

    // Place the order based on order type
    let response;

    switch (orderData.orderType) {
      case "GTC":
        response = await polymarket.placeGTCOrder({
          tokenID: orderData.tokenID,
          price: orderData.price,
          side,
          size: orderData.size,
          feeRateBps: orderData.feeRateBps,
          nonce,
        });
        break;

      case "GTD":
        response = await polymarket.placeGTDOrder({
          tokenID: orderData.tokenID,
          price: orderData.price,
          side,
          size: orderData.size,
          feeRateBps: orderData.feeRateBps,
          nonce,
          expiration: orderData.expiration!,
        });
        break;

      case "FOK":
        response = await polymarket.placeFOKOrder({
          tokenID: orderData.tokenID,
          price: orderData.price,
          side,
          size: orderData.size,
          feeRateBps: orderData.feeRateBps,
          nonce,
        });
        break;
    }

    return NextResponse.json({
      success: true,
      order: response,
    });
  } catch (error) {
    // Handle specific Polymarket errors
    if (error instanceof PolymarketError) {
      const statusCode =
        error.type === PolymarketErrorType.INVALID_TOKEN_ID ||
        error.type === PolymarketErrorType.INSUFFICIENT_FUNDS
          ? 400
          : error.type === PolymarketErrorType.MISSING_CREDENTIALS
          ? 401
          : 500;

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorType: error.type,
        },
        { status: statusCode }
      );
    }

    // Handle generic errors
    console.error("Order placement error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
