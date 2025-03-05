"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Define the Market interface
interface Market {
  id: string;
  title: string;
  question?: string;
  volume: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  category: string;
  outcomePrices?: number[] | Record<string, number>;
  outcomes?: string[];
  image?: string;
  icon?: string;
  slug?: string;
  conditionId?: string;
  description?: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
  featured?: boolean;
  restricted?: boolean;
  questionID?: string;
  volume24hr?: number;
  spread?: number;
  bestBid?: number;
  bestAsk?: number;
  lastTradePrice?: number;
  nestedMarkets?: NestedMarket[];
}

// Define a separate interface for nested markets
interface NestedMarket {
  id: string;
  question?: string;
  conditionId?: string;
  outcomes?: string[];
  outcomePrices?: number[] | Record<string, number>;
  endDate?: string;
  liquidity?: number;
  groupItemTitle?: string;
  image?: string;
  icon?: string;
}

// Define the response type
interface MarketsResponse {
  success: boolean;
  markets: Market[];
  message: string;
  totalMarkets: number;
}

// Modal component for displaying outcomes
function OutcomesModal({
  isOpen,
  onClose,
  market,
}: {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
}) {
  if (!isOpen) return null;

  // Helper function to format outcome price
  const formatOutcomePrice = (price: number): string => {
    return `${(price * 100).toFixed(1)}%`;
  };

  // Helper function to determine text color based on price
  const getPriceColorClass = (price: number): string => {
    if (price > 0.5) return "text-green-600";
    if (price > 0.2) return "text-amber-600";
    if (price > 0.05) return "text-orange-600";
    return "text-red-600";
  };

  // Handle click on the backdrop to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click was directly on the backdrop, not on its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Process nested markets for display
  const getProcessedOutcomes = () => {
    if (market.nestedMarkets && market.nestedMarkets.length > 0) {
      return market.nestedMarkets
        .map((nestedMarket) => {
          if (!nestedMarket.outcomes || !nestedMarket.outcomePrices)
            return null;

          // Parse outcomes if needed
          let outcomes = [];
          if (Array.isArray(nestedMarket.outcomes)) {
            outcomes = nestedMarket.outcomes;
          } else if (typeof nestedMarket.outcomes === "string") {
            try {
              outcomes = JSON.parse(nestedMarket.outcomes);
            } catch (e) {
              outcomes = [];
            }
          }

          // Parse prices if needed
          let prices = {};
          if (Array.isArray(nestedMarket.outcomePrices)) {
            prices = nestedMarket.outcomePrices;
          } else if (typeof nestedMarket.outcomePrices === "string") {
            try {
              prices = JSON.parse(nestedMarket.outcomePrices);
            } catch (e) {
              prices = {};
            }
          } else if (nestedMarket.outcomePrices) {
            prices = nestedMarket.outcomePrices;
          }

          // Get the "Yes" price
          let yesPrice = 0;
          if (typeof prices === "object" && !Array.isArray(prices)) {
            const pricesObj = prices as Record<string, number>;
            yesPrice =
              pricesObj["Yes"] ||
              pricesObj["YES"] ||
              Object.values(pricesObj)[0] ||
              0;
          } else if (Array.isArray(prices) && prices.length > 0) {
            yesPrice =
              typeof prices[0] === "string" ? parseFloat(prices[0]) : prices[0];
          }

          if (yesPrice === undefined) return null;

          // Get the title
          const title =
            nestedMarket.groupItemTitle ||
            (nestedMarket.question
              ? nestedMarket.question.replace("?", "")
              : "Option");

          return {
            id: nestedMarket.id || String(Math.random()),
            title,
            yesPrice,
          };
        })
        .filter((item) => item !== null)
        .sort((a, b) => {
          if (!a || !b) return 0;
          return b.yesPrice - a.yesPrice;
        });
    } else if (
      market.outcomes &&
      market.outcomePrices &&
      Array.isArray(market.outcomes)
    ) {
      return market.outcomes
        .map((outcome, index) => {
          const price = Array.isArray(market.outcomePrices)
            ? market.outcomePrices[index]
            : market.outcomePrices?.[outcome];

          if (price === undefined) return null;

          return { id: String(index), title: outcome, yesPrice: price };
        })
        .filter((item) => item !== null);
    }

    return [];
  };

  const processedOutcomes = getProcessedOutcomes();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {market.title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Market Outcomes
            </h4>
            {processedOutcomes.length > 0 ? (
              <div className="space-y-2">
                {processedOutcomes.map((item) => {
                  if (!item) return null;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {item.title}
                      </span>
                      <span
                        className={`text-sm font-bold ${getPriceColorClass(
                          item.yesPrice
                        )}`}
                      >
                        {formatOutcomePrice(item.yesPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No outcomes available
              </p>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
            <a
              href={`https://polymarket.com/event/${market.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              View on Polymarket
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [visibleMarkets, setVisibleMarkets] = useState<number>(24); // Show 24 markets initially (8 rows of 3)
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Only fetch markets on initial load
    fetchMarkets(false);
  }, []); // Empty dependency array to ensure it only runs once on mount

  async function fetchMarkets(isLoadingMore = false) {
    try {
      if (!isLoadingMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch("/api/markets");

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }

      const data: MarketsResponse = await response.json();

      if (data.success && data.markets) {
        setMarkets(data.markets);
        const currentVisibleCount = isLoadingMore ? visibleMarkets : 24;
        setHasMore(data.markets.length > currentVisibleCount);
      } else {
        setError(data.message || "Failed to fetch markets");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching markets:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const loadMore = () => {
    if (loadingMore) return; // Prevent multiple clicks

    const newVisibleCount = visibleMarkets + 24;
    setVisibleMarkets(newVisibleCount);
    // Check if we need to fetch more markets or just show more from what we already have
    if (markets.length > newVisibleCount) {
      // We already have more markets loaded, just update hasMore
      setHasMore(markets.length > newVisibleCount);
    } else {
      // We need to fetch more markets
      fetchMarkets(true);
    }
  };

  // Format volume as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(0)}%`;
  };

  // Helper function to determine text color based on price
  const getPriceColorClass = (price: number): string => {
    if (price > 0.5) return "text-green-600";
    if (price > 0.2) return "text-amber-600";
    if (price > 0.05) return "text-orange-600";
    return "text-red-600";
  };

  // Toggle expanded market
  const toggleExpandedMarket = (marketId: string) => {
    if (expandedMarket === marketId) {
      setExpandedMarket(null);
    } else {
      setExpandedMarket(marketId);
    }
  };

  // Map category to emoji
  const categoryIcons: Record<string, string> = {
    Politics: "🗳️",
    Crypto: "💰",
    Sports: "🏆",
    New: "🆕",
    Economy: "📈",
    Uncategorized: "❓",
  };

  // Default images by category
  const defaultImages: Record<string, string> = {
    Politics: "https://via.placeholder.com/64x64/4299e1/ffffff?text=P",
    Crypto: "https://via.placeholder.com/64x64/805ad5/ffffff?text=C",
    Sports: "https://via.placeholder.com/64x64/38a169/ffffff?text=S",
    Economy: "https://via.placeholder.com/64x64/dd6b20/ffffff?text=E",
    Uncategorized: "https://via.placeholder.com/64x64/718096/ffffff?text=?",
  };

  // Filter markets based on search query
  const filteredMarkets = markets.filter(
    (market) =>
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (market.question &&
        market.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (market.description &&
        market.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Update hasMore based on filtered markets
  useEffect(() => {
    setHasMore(filteredMarkets.length > visibleMarkets);
  }, [filteredMarkets, visibleMarkets]);

  // Get current markets to display
  const currentMarkets = filteredMarkets.slice(0, visibleMarkets);

  // Function to open the outcomes modal
  const openOutcomesModal = (market: Market) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  // Function to close the outcomes modal
  const closeOutcomesModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search markets"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="relative">
          {loading && !loadingMore ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : markets.length > 0 ? (
            <>
              {filteredMarkets.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {currentMarkets.map((market) => (
                    <div
                      key={market.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="p-5">
                        {/* Market Header */}
                        <div className="flex items-start mb-4">
                          {market.image && (
                            <div className="flex-shrink-0 mr-3">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                <Image
                                  src={market.image}
                                  alt={market.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              {market.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {market.category === "Sports" ? "🏆" : "📊"}{" "}
                                  {market.category}
                                </span>
                              )}
                              {market.isNew && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  New
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {market.title}
                            </h3>
                          </div>
                        </div>

                        {/* Market Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-xs text-blue-700 font-medium">
                              Volume
                            </p>
                            <p className="text-sm font-bold text-blue-900">
                              {formatCurrency(market.volume)}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2">
                            <p className="text-xs text-purple-700 font-medium">
                              Liquidity
                            </p>
                            <p className="text-sm font-bold text-purple-900">
                              {formatCurrency(market.liquidity)}
                            </p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2">
                            <p className="text-xs text-amber-700 font-medium">
                              24h Volume
                            </p>
                            <p className="text-sm font-bold text-amber-900">
                              {market.volume24hr
                                ? formatCurrency(market.volume24hr)
                                : "N/A"}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-xs text-green-700 font-medium">
                              End Date
                            </p>
                            <p className="text-sm font-bold text-green-900">
                              {formatDate(market.endDate)}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <button
                            onClick={() => openOutcomesModal(market)}
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            See Outcomes
                          </button>
                          <Link
                            href={`https://polymarket.com/event/${market.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                          >
                            View on Polymarket
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {loadingMore && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}

                  {!loadingMore &&
                    hasMore &&
                    filteredMarkets.length > visibleMarkets && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-8">
                        <button
                          onClick={loadMore}
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-600">
                    No markets found matching "{searchQuery}"
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">No markets available</p>
            </div>
          )}
        </div>
      )}

      {/* Outcomes Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMarket && (
          <OutcomesModal
            isOpen={isModalOpen}
            onClose={closeOutcomesModal}
            market={selectedMarket}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
