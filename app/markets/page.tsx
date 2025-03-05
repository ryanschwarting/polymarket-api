"use client";

import AllMarkets from "@/components/AllMarkets";

export default function MarketsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Polymarket Top Markets
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore all markets sorted by volume
          </p>
        </div>

        <AllMarkets />
      </div>
    </main>
  );
}
