"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { KalshiMarket } from "@/app/api/kalshi/markets/route";

// Define the response type
interface KalshiMarketsResponse {
  success: boolean;
  markets: KalshiMarket[];
  message: string;
  totalMarkets: number;
  categories: string[];
}

// Group markets by event_ticker
interface EventGroup {
  eventTitle: string;
  markets: KalshiMarket[];
  category: string;
}

// Modal component for displaying outcomes
function OutcomesModal({
  isOpen,
  onClose,
  market,
}: {
  isOpen: boolean;
  onClose: () => void;
  market: KalshiMarket;
}) {
  if (!isOpen) return null;

  // Helper function to format outcome price
  const formatOutcomePrice = (price: number): string => {
    return `${price ? price.toFixed(1) : "0"}%`;
  };

  // Helper function to determine text color based on price
  const getPriceColorClass = (price: number): string => {
    if (price > 50) return "text-green-600";
    if (price > 20) return "text-amber-600";
    if (price > 5) return "text-orange-600";
    return "text-red-600";
  };

  // Handle click on the backdrop to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click was directly on the backdrop, not on its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Market Outcomes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{market.title}</h3>
          {market.option_name && (
            <p className="text-sm font-medium text-gray-700 mt-1">
              Option: {market.option_name}
            </p>
          )}
          {market.rules_primary && (
            <p className="text-sm text-gray-600 mt-1">{market.rules_primary}</p>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3">
            <h4 className="text-md font-medium text-gray-700">Outcomes</h4>
          </div>
          <ul className="divide-y divide-gray-200">
            {market.outcomes?.map((outcome, index) => (
              <li
                key={index}
                className="px-4 py-3 flex justify-between items-center"
              >
                <span className="text-sm font-medium text-gray-800">
                  {outcome}
                </span>
                <span
                  className={`text-sm font-medium ${getPriceColorClass(
                    market.outcomePrices?.[index] || 0
                  )}`}
                >
                  {formatOutcomePrice(market.outcomePrices?.[index] || 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Volume:</span>
              <span className="font-medium">
                ${market.volume.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Liquidity:</span>
              <span className="font-medium">
                ${market.liquidity.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>24h Volume:</span>
              <span className="font-medium">
                ${market.volume_24h.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function KalshiMarkets() {
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<KalshiMarket | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [sortOption, setSortOption] = useState<"volume" | "liquidity">(
    "volume"
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const LIMIT = 20;

  // Function to load more markets
  const loadMore = () => {
    setOffset((prevOffset) => prevOffset + LIMIT);
  };

  // Function to format currency
  const formatCurrency = (value: number): string => {
    if (value === 0) return "$0";

    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }

    return `$${value.toFixed(2)}`;
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Expired";
    }

    if (diffDays === 0) {
      return "Today";
    }

    if (diffDays === 1) {
      return "Tomorrow";
    }

    return `${diffDays} days`;
  };

  // Function to format start date
  const formatStartDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Function to fetch markets
  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
        sort: sortOption,
      });

      if (selectedCategories.length === 1) {
        params.append("category", selectedCategories[0]);
      }

      const response = await fetch(`/api/kalshi/markets?${params.toString()}`);
      const data: KalshiMarketsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // If this is the first fetch or a refresh, replace markets
      // Otherwise, append new markets
      if (offset === 0) {
        setMarkets(data.markets);
        setCategories(data.categories || []);
      } else {
        setMarkets((prevMarkets) => [...prevMarkets, ...data.markets]);
      }

      // Check if there are more markets to load
      setHasMore(data.markets.length === LIMIT);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [offset, sortOption, selectedCategories]);

  // Fetch markets when component mounts or dependencies change
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Function to open the outcomes modal
  const openOutcomesModal = (market: KalshiMarket) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  // Function to close the outcomes modal
  const closeOutcomesModal = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  // Function to toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setOffset(0); // Reset pagination when changing filters
  };

  // Function to clear all selected categories
  const clearCategories = () => {
    setSelectedCategories([]);
    setOffset(0); // Reset pagination when clearing filters
  };

  // Function to toggle filter dropdown
  const toggleFilter = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // Function to handle sort change
  const handleSortChange = (option: "volume" | "liquidity") => {
    setSortOption(option);
    setOffset(0); // Reset pagination when changing sort
  };

  // Function to handle click outside the filter dropdown
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".filter-dropdown")) {
      setIsFilterExpanded(false);
    }
  };

  // Setup click outside handler
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Group markets by event_ticker
  const groupMarketsByEvent = (markets: KalshiMarket[]): EventGroup[] => {
    const eventMap = new Map<string, EventGroup>();

    markets.forEach((market) => {
      if (!market.event_ticker) return;

      if (!eventMap.has(market.event_ticker)) {
        eventMap.set(market.event_ticker, {
          eventTitle: market.event_title || "Unknown Event",
          markets: [],
          category: market.category || "Uncategorized",
        });
      }

      eventMap.get(market.event_ticker)?.markets.push(market);
    });

    // Convert map to array and sort by number of markets
    return Array.from(eventMap.values()).sort(
      (a, b) => b.markets.length - a.markets.length
    );
  };

  // Filter markets based on search query and selected categories
  const filteredMarkets = markets.filter((market) => {
    // If there's a search query, filter by it
    if (
      searchQuery &&
      !market.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(
        market.event_title &&
        market.event_title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }

    // If there are selected categories, filter by them
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(market.category || "Uncategorized")
    ) {
      return false;
    }

    return true;
  });

  // Group filtered markets by event
  const eventGroups = groupMarketsByEvent(filteredMarkets);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search markets or events..."
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
          <div className="flex items-center space-x-4">
            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() =>
                  handleSortChange(
                    sortOption === "volume" ? "liquidity" : "volume"
                  )
                }
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sort order"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
                <span className="text-gray-700">
                  Sort: {sortOption === "volume" ? "Volume" : "Liquidity"}
                </span>
              </button>
            </div>
            <button
              onClick={toggleFilter}
              className="filter-dropdown inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="text-gray-700">Filter</span>
              {selectedCategories.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full ml-1">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {isFilterExpanded && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Filter by Category
              </h3>
              <button
                onClick={clearCategories}
                className="text-xs text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isLoading && offset === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>Error: {error}</p>
            <button
              onClick={() => {
                setOffset(0);
                fetchMarkets();
              }}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        ) : eventGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No markets found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearCategories}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Display markets grouped by event */}
            <div className="space-y-8">
              {eventGroups.map((eventGroup) => (
                <div
                  key={eventGroup.eventTitle}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  {/* Event Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {eventGroup.eventTitle}
                        </h2>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {eventGroup.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {eventGroup.markets.length} markets
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Markets in this event */}
                  <div className="divide-y divide-gray-200">
                    {eventGroup.markets.map((market) => (
                      <div
                        key={market.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openOutcomesModal(market)}
                      >
                        <div className="flex items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900">
                              {market.title}
                            </h3>

                            {/* Display option name if available */}
                            {market.option_name && (
                              <p className="text-sm text-gray-600 mt-1">
                                {market.option_name}
                              </p>
                            )}

                            {/* Market Stats */}
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div>
                                <p className="text-xs text-gray-500">Volume</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(market.volume)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Liquidity
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(market.liquidity)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Expires</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(market.expiration_time)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Yes/No Prices */}
                          <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <div className="bg-green-50 rounded-md px-3 py-2 text-center min-w-[70px]">
                              <p className="text-xs text-green-700">Yes</p>
                              <p className="text-sm font-semibold text-green-800">
                                {market.yes_bid
                                  ? `$${market.yes_bid.toFixed(2)}`
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="bg-red-50 rounded-md px-3 py-2 text-center min-w-[70px]">
                              <p className="text-xs text-red-700">No</p>
                              <p className="text-sm font-semibold text-red-800">
                                {market.no_bid
                                  ? `$${market.no_bid.toFixed(2)}`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
