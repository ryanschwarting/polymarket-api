"use client";

import dynamic from "next/dynamic";

// Dynamically import PolymarketOrderForm with SSR disabled
const PolymarketOrderForm = dynamic(
  () => import("@/components/polymarket-order-form"),
  { ssr: false }
);

export default function OrderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Order Form Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <PolymarketOrderForm />
        </div>
      </div>
    </main>
  );
}
