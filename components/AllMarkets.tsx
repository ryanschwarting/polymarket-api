"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Define the Market interface
interface Market {
  id: string;
  title: string;
  question: string;
  volume: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  category: string;
  outcomePrices?: number[] | Record<string, number>;
  tokens?: Array<{
    outcome: string;
    token_id: string;
  }>;
  image?: string;
  icon?: string;
  slug?: string;
  conditionId?: string;
  description?: string;
  outcomes?: string[];
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
}

// Define the response type
interface MarketsResponse {
  success: boolean;
  markets: Market[];
  message: string;
  totalMarkets: number;
}

export default function AllMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);
  const [visibleMarkets, setVisibleMarkets] = useState<number>(24); // Show 24 markets initially (8 rows of 3)
  const [hasMore, setHasMore] = useState<boolean>(true);

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

  // Get current markets to display
  const currentMarkets = markets.slice(0, visibleMarkets);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          {markets.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {currentMarkets.length} of {markets.length} markets
                </p>
              </div>

              {/* Markets Grid - 3 per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMarkets.map((market) => (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
                  >
                    <div className="p-5">
                      {/* Header with image and title */}
                      <div className="flex mb-4">
                        {/* Market Image - Small Square */}
                        <div className="flex-shrink-0 mr-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={
                                market.image ||
                                defaultImages[market.category] ||
                                defaultImages.Uncategorized
                              }
                              alt={market.title}
                              className="w-full h-full object-cover"
                              width={64}
                              height={64}
                              onError={(e) => {
                                // If the image fails to load, use the default image for the category
                                e.currentTarget.src =
                                  defaultImages[market.category] ||
                                  defaultImages.Uncategorized;
                              }}
                            />
                            {market.isNew && (
                              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl-md font-medium text-[10px]">
                                NEW
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Market Details */}
                        <div className="flex-1 min-w-0">
                          {/* Category Badge */}
                          <div className="flex items-center mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {categoryIcons[market.category] || "❓"}{" "}
                              {market.category}
                            </span>
                            {market.isNew && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                          </div>

                          {/* Market Title */}
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
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
                        <div className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-green-700 font-medium">
                            End Date
                          </p>
                          <p className="text-sm font-bold text-green-900">
                            {formatDate(market.endDate)}
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
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center pt-3 border-t border-gray-100">
                        <button
                          onClick={() => toggleExpandedMarket(market.id)}
                          className="text-gray-600 hover:text-gray-900 text-xs font-medium flex items-center"
                          aria-expanded={expandedMarket === market.id}
                        >
                          {expandedMarket === market.id ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                              Less
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                              More
                            </>
                          )}
                        </button>

                        <a
                          href={`https://polymarket.com/event/${
                            market.slug || market.id
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center ml-auto"
                        >
                          View on Polymarket
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>

                      {/* Expanded content */}
                      {expandedMarket === market.id && market.description && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-3 border-t border-gray-100"
                        >
                          <p className="text-xs text-gray-600">
                            {market.description}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Show More Button - Updated with loading state */}
              {hasMore && (
                <div className="flex justify-center mt-10 mb-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center disabled:bg-blue-400"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Loading More...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        Show More Markets
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">No markets available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
