import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { ethers } from "ethers";
import env, { fallbackEnv } from "./env";

// Define TypeScript interfaces for order parameters
export interface OrderParams {
  tokenID: string; // Market outcome token ID (e.g., YES or NO)
  price: number; // Price per share in USDC
  side: Side; // BUY or SELL
  size: number; // Number of shares
  feeRateBps: number; // Fee in basis points (e.g., 100 = 1%)
  nonce: number; // Unique order identifier
}

// Additional parameters for GTD orders
export interface GTDOrderParams extends OrderParams {
  expiration: number; // Unix timestamp for order expiration
}

// Response type from Polymarket
export interface OrderResponse {
  orderID: string;
  status: string;
  filled: number;
  message?: string;
  error?: string;
}

// Error types for better error handling
export enum PolymarketErrorType {
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_TOKEN_ID = "INVALID_TOKEN_ID",
  NETWORK_ERROR = "NETWORK_ERROR",
  MISSING_CREDENTIALS = "MISSING_CREDENTIALS",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Custom error class for Polymarket errors
export class PolymarketError extends Error {
  type: PolymarketErrorType;

  constructor(message: string, type: PolymarketErrorType) {
    super(message);
    this.type = type;
    this.name = "PolymarketError";
  }
}

// Polymarket client class
export class PolymarketClient {
  private clobClient: ClobClient | null = null;
  private host = "https://clob.polymarket.com"; // Polymarket API endpoint
  private chainId = 137; // Polygon Mainnet
  private initialized = false;

  constructor() {
    // Don't try to initialize during build time
    if (
      typeof window === "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      console.log("Skipping Polymarket client initialization during build");
      return;
    }

    try {
      // Check if required environment variables are available
      if (
        !env.PRIVATE_KEY ||
        env.PRIVATE_KEY === fallbackEnv.PRIVATE_KEY ||
        !env.API_KEY ||
        env.API_KEY === fallbackEnv.API_KEY ||
        !env.API_SECRET ||
        env.API_SECRET === fallbackEnv.API_SECRET ||
        !env.PASSPHRASE ||
        env.PASSPHRASE === fallbackEnv.PASSPHRASE
      ) {
        console.warn(
          "Missing Polymarket API credentials. Trading functionality will be disabled."
        );
        return;
      }

      // Create a wallet from the private key
      const wallet = new ethers.Wallet(env.PRIVATE_KEY);

      // Create API credentials
      const creds = {
        key: env.API_KEY,
        secret: env.API_SECRET,
        passphrase: env.PASSPHRASE,
      };

      // Initialize the ClobClient with the wallet
      this.clobClient = new ClobClient(this.host, this.chainId, wallet, creds);
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize PolymarketClient:", error);
      // Don't throw during initialization - we'll check before operations
    }
  }

  // Check if client is properly initialized before operations
  private checkInitialized(): void {
    if (!this.initialized || !this.clobClient) {
      throw new PolymarketError(
        "Polymarket client not properly initialized. Please check your API credentials and private key.",
        PolymarketErrorType.MISSING_CREDENTIALS
      );
    }
  }

  // Create and place a GTC (Good-Til-Canceled) order
  async placeGTCOrder(params: OrderParams): Promise<OrderResponse> {
    try {
      this.checkInitialized();

      // Create the order
      const order = await this.clobClient!.createOrder({
        tokenID: params.tokenID,
        price: params.price,
        side: params.side,
        size: params.size,
        feeRateBps: params.feeRateBps,
        nonce: params.nonce,
      });

      // Submit the order as GTC
      const response = await this.clobClient!.postOrder(order, OrderType.GTC);
      return response as OrderResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create and place a GTD (Good-Til-Date) order
  async placeGTDOrder(params: GTDOrderParams): Promise<OrderResponse> {
    try {
      this.checkInitialized();

      // Create the order with expiration included
      const order = await this.clobClient!.createOrder({
        tokenID: params.tokenID,
        price: params.price,
        side: params.side,
        size: params.size,
        feeRateBps: params.feeRateBps,
        nonce: params.nonce,
        expiration: params.expiration, // Include expiration in the order creation
      });

      // Submit the order as GTD
      const response = await this.clobClient!.postOrder(order, OrderType.GTD);
      return response as OrderResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create and place a FOK (Fill-Or-Kill) order
  async placeFOKOrder(params: OrderParams): Promise<OrderResponse> {
    try {
      this.checkInitialized();

      // Create the order
      const order = await this.clobClient!.createOrder({
        tokenID: params.tokenID,
        price: params.price,
        side: params.side,
        size: params.size,
        feeRateBps: params.feeRateBps,
        nonce: params.nonce,
      });

      // Submit the order as FOK
      const response = await this.clobClient!.postOrder(order, OrderType.FOK);
      return response as OrderResponse;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Helper method to handle errors
  private handleError(error: Error | unknown): never {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Check for specific error types
    if (
      errorMessage.includes("insufficient funds") ||
      errorMessage.includes("balance")
    ) {
      throw new PolymarketError(
        "Insufficient funds to place order",
        PolymarketErrorType.INSUFFICIENT_FUNDS
      );
    } else if (
      errorMessage.includes("invalid token") ||
      errorMessage.includes("tokenID")
    ) {
      throw new PolymarketError(
        "Invalid token ID provided",
        PolymarketErrorType.INVALID_TOKEN_ID
      );
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      throw new PolymarketError(
        `Network error: ${errorMessage}`,
        PolymarketErrorType.NETWORK_ERROR
      );
    } else if (
      errorMessage.includes("not properly initialized") ||
      errorMessage.includes("credentials")
    ) {
      throw new PolymarketError(
        errorMessage,
        PolymarketErrorType.MISSING_CREDENTIALS
      );
    } else {
      throw new PolymarketError(
        `Failed to place order: ${errorMessage}`,
        PolymarketErrorType.UNKNOWN_ERROR
      );
    }
  }
}

// Singleton instance
let polymarketClientInstance: PolymarketClient | null = null;

// Export a function to get the client instance
export const getPolymarketClient = (): PolymarketClient => {
  // Create the instance if it doesn't exist
  if (!polymarketClientInstance) {
    polymarketClientInstance = new PolymarketClient();
  }

  return polymarketClientInstance;
};

// Export a pre-initialized instance for convenience
export const polymarket = getPolymarketClient();
