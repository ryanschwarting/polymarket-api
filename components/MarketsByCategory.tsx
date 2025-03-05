"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
interface MarketsByCategoryResponse {
  success: boolean;
  markets: Market[];
  message: string;
  totalMarkets: number;
}

export default function MarketsByCategory() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  // Define the target categories
  const targetCategories = ["Crypto", "Politics", "Sports", "New", "Economy"];

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        const response = await fetch("/api/markets");

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data: MarketsByCategoryResponse = await response.json();

        if (data.success && data.markets) {
          setMarkets(data.markets);

          // Set the first available category as selected by default
          const categories = Array.from(
            new Set(data.markets.map((market) => market.category))
          );
          if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
          }
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
      }
    }

    fetchMarkets();
  }, [selectedCategory]);

  // Format volume as currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (dateString === "N/A") return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Get the markets to display based on the selected category
  const getMarketsToDisplay = (): Market[] => {
    if (!selectedCategory) {
      return [];
    }

    // Filter markets by the selected category
    return markets
      .filter((market) => market.category === selectedCategory)
      .slice(0, 10); // Return top 10 markets (they're already sorted by volume)
  };

  // Get available categories from the markets
  const getAvailableCategories = () => {
    const categories = Array.from(
      new Set(markets.map((market) => market.category))
    );
    return categories.filter((category) => targetCategories.includes(category));
  };

  // Toggle expanded market
  const toggleExpandedMarket = (marketId: string) => {
    if (expandedMarket === marketId) {
      setExpandedMarket(null);
    } else {
      setExpandedMarket(marketId);
    }
  };

  const availableCategories = getAvailableCategories();
  const marketsToDisplay = getMarketsToDisplay();

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    Crypto: "💰",
    Politics: "🗳️",
    Sports: "🏆",
    New: "🆕",
    Economy: "📈",
  };

  return (
    <div className="markets-by-category">
      <h1 className="text-2xl font-bold mb-6">
        Polymarket Top Markets by Category
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-6 text-lg text-gray-600">Loading markets data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <p className="font-medium">Error: {error}</p>
          <p className="mt-2 text-sm">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      ) : (
        <div>
          {/* Category tabs */}
          <div className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {availableCategories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-xl shadow-sm transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="text-2xl mb-2">
                    {categoryIcons[category]}
                  </span>
                  <span className="font-medium">{category}</span>
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-b-xl"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Markets display */}
          {selectedCategory && marketsToDisplay.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">{categoryIcons[selectedCategory]}</span>
                {selectedCategory}: Top Markets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketsToDisplay.map((market, index) => (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row">
                        {/* Market image */}
                        {market.image && (
                          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                            <div className="relative h-24 w-24 rounded-lg overflow-hidden shadow-sm">
                              <img
                                src={market.image}
                                alt={market.title}
                                className="object-cover h-full w-full"
                                width={96}
                                height={96}
                              />
                              {market.isNew && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-md font-medium">
                                  NEW
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Market details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {market.title}
                          </h3>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-xs text-blue-700 font-medium mb-1">
                                Volume
                              </div>
                              <div className="text-lg font-bold text-blue-900">
                                {formatCurrency(market.volume)}
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="text-xs text-purple-700 font-medium mb-1">
                                Liquidity
                              </div>
                              <div className="text-lg font-bold text-purple-900">
                                {formatCurrency(market.liquidity)}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-700 font-medium mb-1">
                                End Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(market.endDate)}
                              </div>
                            </div>
                            {market.volume24hr && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-xs text-green-700 font-medium mb-1">
                                  24h Volume
                                </div>
                                <div className="text-sm font-medium text-green-900">
                                  {formatCurrency(market.volume24hr)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Outcome prices */}
                          {market.outcomes && market.outcomePrices && (
                            <div className="mt-4">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Outcomes
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {Array.isArray(market.outcomes) &&
                                  Array.isArray(market.outcomePrices) &&
                                  market.outcomes.map((outcome, index) => {
                                    const price =
                                      market.outcomePrices &&
                                      Array.isArray(market.outcomePrices)
                                        ? market.outcomePrices[index]
                                        : 0;

                                    return (
                                      <div
                                        key={index}
                                        className={`px-3 py-2 rounded-md ${
                                          price > 0.5
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-red-50 border border-red-200"
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium truncate mr-1">
                                            {outcome}
                                          </span>
                                          <span
                                            className={`text-sm font-bold ${
                                              price > 0.5
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            {formatPercentage(price)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Market actions */}
                          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                            <button
                              onClick={() => toggleExpandedMarket(market.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
                              {expandedMarket === market.id ? (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
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
                                  Hide details
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
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
                                  Show details
                                </>
                              )}
                            </button>
                            <a
                              href={`https://polymarket.com/${
                                market.slug || `markets/${market.id}`
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4 flex items-center"
                            >
                              View on Polymarket
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
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

                          {/* Expanded details */}
                          {expandedMarket === market.id &&
                            market.description && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-gray-100"
                              >
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  Description
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                                  {market.description}
                                </p>

                                {/* Additional market details */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  {market.spread !== undefined && (
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Spread
                                      </div>
                                      <div className="text-sm text-gray-900">
                                        {market.spread}
                                      </div>
                                    </div>
                                  )}
                                  {market.bestBid !== undefined && (
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Best Bid
                                      </div>
                                      <div className="text-sm text-gray-900">
                                        {market.bestBid}
                                      </div>
                                    </div>
                                  )}
                                  {market.bestAsk !== undefined && (
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Best Ask
                                      </div>
                                      <div className="text-sm text-gray-900">
                                        {market.bestAsk}
                                      </div>
                                    </div>
                                  )}
                                  {market.lastTradePrice !== undefined && (
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Last Trade Price
                                      </div>
                                      <div className="text-sm text-gray-900">
                                        {market.lastTradePrice}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : selectedCategory ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No markets found
              </h3>
              <p className="text-gray-500">
                No markets found for the {selectedCategory} category.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
