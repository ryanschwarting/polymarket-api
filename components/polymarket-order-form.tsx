"use client";

import { useState } from "react";
import { z } from "zod";
import { PlaceOrderRequest } from "@/app/api/place-order/route";

// Form validation schema (matches the API schema)
const formSchema = z.object({
  tokenID: z.string().min(1, "Token ID is required"),
  price: z
    .number()
    .positive("Price must be positive")
    .or(
      z
        .string()
        .regex(/^\d*\.?\d+$/)
        .transform(Number)
    ),
  side: z.enum(["BUY", "SELL"]),
  size: z
    .number()
    .positive("Size must be positive")
    .or(
      z
        .string()
        .regex(/^\d*\.?\d+$/)
        .transform(Number)
    ),
  orderType: z.enum(["GTC", "GTD", "FOK"]),
  expiration: z
    .number()
    .optional()
    .or(z.string().regex(/^\d+$/).transform(Number).optional()),
  feeRateBps: z
    .number()
    .default(100)
    .or(z.string().regex(/^\d+$/).transform(Number)),
});

type FormData = z.infer<typeof formSchema>;

// Initial form state
const initialFormState: FormData = {
  tokenID: "",
  price: 0,
  side: "BUY",
  size: 0,
  orderType: "GTC",
  feeRateBps: 100,
};

export default function PolymarketOrderForm() {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    orderId: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (!validateForm()) {
      return;
    }

    // Check if GTD order has expiration
    if (formData.orderType === "GTD" && !formData.expiration) {
      setErrors((prev) => ({
        ...prev,
        expiration: "Expiration timestamp is required for GTD orders",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to API request format
      const requestData: PlaceOrderRequest = {
        tokenID: formData.tokenID,
        price: Number(formData.price),
        side: formData.side as "BUY" | "SELL",
        size: Number(formData.size),
        orderType: formData.orderType as "GTC" | "GTD" | "FOK",
        feeRateBps: Number(formData.feeRateBps),
      };

      // Add expiration for GTD orders
      if (formData.orderType === "GTD" && formData.expiration) {
        requestData.expiration = Number(formData.expiration);
      }

      // Send request to API
      const response = await fetch("/api/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setResponse(data);
      // Reset form on success
      setFormData(initialFormState);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Place Polymarket Order
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token ID */}
        <div>
          <label
            htmlFor="tokenID"
            className="block text-sm font-medium text-gray-700"
          >
            Token ID
          </label>
          <input
            type="text"
            id="tokenID"
            name="tokenID"
            value={formData.tokenID}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.tokenID ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            placeholder="e.g., 7132107..."
          />
          {errors.tokenID && (
            <p className="mt-1 text-sm text-red-600">{errors.tokenID}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price (USDC)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.price ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            placeholder="0.5"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Side (BUY/SELL) */}
        <div>
          <label
            htmlFor="side"
            className="block text-sm font-medium text-gray-700"
          >
            Side
          </label>
          <select
            id="side"
            name="side"
            value={formData.side}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.side ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          {errors.side && (
            <p className="mt-1 text-sm text-red-600">{errors.side}</p>
          )}
        </div>

        {/* Size */}
        <div>
          <label
            htmlFor="size"
            className="block text-sm font-medium text-gray-700"
          >
            Size (Shares)
          </label>
          <input
            type="number"
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            min="1"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.size ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            placeholder="10"
          />
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size}</p>
          )}
        </div>

        {/* Order Type */}
        <div>
          <label
            htmlFor="orderType"
            className="block text-sm font-medium text-gray-700"
          >
            Order Type
          </label>
          <select
            id="orderType"
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.orderType ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="GTC">Good-Til-Canceled (GTC)</option>
            <option value="GTD">Good-Til-Date (GTD)</option>
            <option value="FOK">Fill-Or-Kill (FOK)</option>
          </select>
          {errors.orderType && (
            <p className="mt-1 text-sm text-red-600">{errors.orderType}</p>
          )}
        </div>

        {/* Expiration (only for GTD orders) */}
        {formData.orderType === "GTD" && (
          <div>
            <label
              htmlFor="expiration"
              className="block text-sm font-medium text-gray-700"
            >
              Expiration (Unix Timestamp)
            </label>
            <input
              type="number"
              id="expiration"
              name="expiration"
              value={formData.expiration || ""}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.expiration ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="1672531200"
            />
            <p className="mt-1 text-xs text-gray-500">
              Unix timestamp when the order expires (required for GTD orders)
            </p>
            {errors.expiration && (
              <p className="mt-1 text-sm text-red-600">{errors.expiration}</p>
            )}
          </div>
        )}

        {/* Fee Rate */}
        <div>
          <label
            htmlFor="feeRateBps"
            className="block text-sm font-medium text-gray-700"
          >
            Fee Rate (basis points)
          </label>
          <input
            type="number"
            id="feeRateBps"
            name="feeRateBps"
            value={formData.feeRateBps}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.feeRateBps ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            placeholder="100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Fee in basis points (100 = 1%)
          </p>
          {errors.feeRateBps && (
            <p className="mt-1 text-sm text-red-600">{errors.feeRateBps}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">
            Order Placed Successfully
          </h3>
          <pre className="mt-2 text-sm text-green-700 overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Sample Order Example */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium text-gray-800">Sample Order</h3>
        <p className="mt-2 text-sm text-gray-600">Try with these values:</p>
        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
          <li>Token ID: 7132107...</li>
          <li>Price: 0.5</li>
          <li>Side: BUY</li>
          <li>Size: 10</li>
          <li>Order Type: GTC</li>
          <li>Fee Rate: 100</li>
        </ul>
        <button
          onClick={() => {
            setFormData({
              tokenID: "7132107...",
              price: 0.5,
              side: "BUY",
              size: 10,
              orderType: "GTC",
              feeRateBps: 100,
            });
          }}
          className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Fill with Sample Data
        </button>
      </div>
    </div>
  );
}
