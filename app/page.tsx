import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import PolymarketOrderForm with SSR disabled
const PolymarketOrderForm = dynamic(
  () => import("@/components/polymarket-order-form"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Polymarket Order Placement
        </h1>

        <div className="mb-8">
          <p className="text-center text-lg mb-4">
            Place orders on Polymarket prediction markets using the form below.
          </p>
          <p className="text-center text-sm text-gray-500">
            This application demonstrates integration with the Polymarket API
            for placing GTC, GTD, and FOK orders.
          </p>
          <div className="flex justify-center mt-4">
            <Link
              href="/markets?view=by-category"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Markets by Category
            </Link>
          </div>
        </div>

        <PolymarketOrderForm />

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">About Polymarket</h2>
          <p className="mb-4">
            Polymarket is a decentralized prediction market platform that allows
            users to trade on the outcome of events. It uses blockchain
            technology to create a transparent and trustless environment for
            betting on real-world events.
          </p>
          <p>
            <a
              href="https://docs.polymarket.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Learn more about the Polymarket API →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
