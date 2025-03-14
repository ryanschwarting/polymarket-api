"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  totalVolume: number;
  totalLiquidity: number;
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
    return `${price ? Math.round(price) : "0"}¢`;
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

  // Process outcomes for display
  const getProcessedOutcomes = () => {
    if (
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg bg-white shadow-xl rounded-xl flex flex-col max-h-[90vh] overflow-hidden">
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

        {/* Market Description */}
        {market.rules_primary && (
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {market.rules_primary}
            </p>
          </div>
        )}

        {/* Current favorite section */}
        <div className="px-6 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Current favorite:</span>{" "}
            <span
              className={`${getPriceColorClass(
                processedOutcomes[0]?.yesPrice || 0
              )}`}
            >
              {processedOutcomes[0]?.yesPrice || 0}% chance
            </span>
          </p>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="mb-4">
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
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 px-6 py-4 mt-auto">
          <div className="flex justify-between">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="font-medium">Volume:</span>{" "}
                  <span>${market.volume.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Liquidity:</span>{" "}
                  <span>${market.liquidity.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal component for displaying all options in an event
function AllOptionsModal({
  isOpen,
  onClose,
  eventGroup,
  formatCurrency,
  formatDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventGroup: EventGroup;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}) {
  if (!isOpen) return null;

  // Helper function to determine text color based on price
  const getPriceColorClass = (price: number): string => {
    if (price > 50) return "text-green-600";
    if (price > 20) return "text-amber-600";
    if (price > 5) return "text-orange-600";
    return "text-red-600";
  };

  // Get the most likely outcome from the markets
  const getMostLikelyOutcome = (
    markets: KalshiMarket[]
  ): KalshiMarket | null => {
    if (!markets || markets.length === 0) return null;

    return markets.reduce((mostLikely, current) => {
      // If current market has no yes_bid, keep the previous most likely
      if (!current.yes_bid) return mostLikely;

      // If we don't have a most likely yet, or current has higher yes_bid
      if (
        !mostLikely ||
        !mostLikely.yes_bid ||
        current.yes_bid > mostLikely.yes_bid
      ) {
        return current;
      }

      return mostLikely;
    }, markets[0]);
  };

  // Handle click on the backdrop to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl bg-white shadow-xl rounded-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {eventGroup.eventTitle}
            </h3>
            <div className="flex flex-wrap items-center mt-2 gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                {eventGroup.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                {eventGroup.markets.length} markets
              </span>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                <span className="mr-1 font-normal">Liq:</span>
                <span>{formatCurrency(eventGroup.totalLiquidity)}</span>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                <span className="mr-1 font-normal">Vol:</span>
                <span>{formatCurrency(eventGroup.totalVolume)}</span>
              </div>
            </div>
          </div>
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

        {/* Description section */}
        {getMostLikelyOutcome(eventGroup.markets)?.rules_primary && (
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {getMostLikelyOutcome(eventGroup.markets)?.rules_primary}
            </p>
          </div>
        )}

        {/* Current favorite section */}
        {eventGroup.markets.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <p className="text-sm sm:text-base text-black font-medium">
              <span>Current favorite:</span>{" "}
              <span
                className={`${getPriceColorClass(
                  getMostLikelyOutcome(eventGroup.markets)?.yes_bid || 0
                )}`}
              >
                {getMostLikelyOutcome(eventGroup.markets)?.yes_sub_title ||
                  getMostLikelyOutcome(eventGroup.markets)?.title ||
                  "Yes"}{" "}
                - {getMostLikelyOutcome(eventGroup.markets)?.yes_bid || 0}%
                chance
              </span>
            </p>
          </div>
        )}

        {/* Modal content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventGroup.markets.map((market) => (
              <div
                key={market.id}
                className="bg-white border border-gray-200 rounded-md hover:shadow-md transition-shadow"
              >
                <div className="p-3">
                  {/* Market Title - Only show if different from option_name */}
                  {market.title !== market.option_name && (
                    <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-1">
                      {market.title}
                    </h3>
                  )}

                  {/* Option Name */}
                  <div className="mb-3">
                    {market.option_name ? (
                      <p className="text-base font-bold text-gray-800 line-clamp-1">
                        {market.option_name}
                      </p>
                    ) : (
                      <p className="text-base font-bold text-gray-800 line-clamp-1">
                        {market.title}
                      </p>
                    )}
                  </div>

                  {/* Yes/No Prices */}
                  <div className="flex space-x-2 mb-3">
                    <div className="flex-1 bg-green-50 border border-green-100 rounded-md px-2 py-1 text-center">
                      <p className="text-xs text-green-700 mb-1">Yes</p>
                      <p className="text-sm font-bold text-green-800">
                        {market.yes_bid
                          ? `${Math.round(market.yes_bid)}¢`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-100 rounded-md px-2 py-1 text-center">
                      <p className="text-xs text-red-700 mb-1">No</p>
                      <p className="text-sm font-bold text-red-800">
                        {market.no_bid
                          ? `${Math.round(market.no_bid)}¢`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-700 font-medium">
                          Volume
                        </p>
                        <p className="text-sm font-bold text-blue-900">
                          {formatCurrency(market.volume)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-purple-700 font-medium">
                          Liquidity
                        </p>
                        <p className="text-sm font-bold text-purple-900">
                          {formatCurrency(market.liquidity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Market close time */}
                  <div className="px-4 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Closes:</p>
                      <p className="text-xs font-medium text-gray-600">
                        {formatDate(market.close_time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 px-6 py-4 mt-auto">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KalshiMarketsProps {
  externalSearchQuery?: string;
  externalSortOption?: "volume" | "liquidity";
  externalSelectedCategories?: string[];
}

export default function KalshiMarkets({
  externalSearchQuery,
  externalSortOption,
  externalSelectedCategories,
}: KalshiMarketsProps = {}) {
  const [markets, setMarkets] = useState<KalshiMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState<KalshiMarket | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"volume" | "liquidity">(
    "volume"
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventGroup, setSelectedEventGroup] =
    useState<EventGroup | null>(null);
  const [isAllOptionsModalOpen, setIsAllOptionsModalOpen] = useState(false);
  const LIMIT = 10000;

  // Sync with external state if provided
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    if (externalSortOption !== undefined) {
      setSortOption(externalSortOption);
    }
  }, [externalSortOption]);

  useEffect(() => {
    if (externalSelectedCategories !== undefined) {
      setSelectedCategories(externalSelectedCategories);
    }
  }, [externalSelectedCategories]);

  // Function to toggle event expansion (now opens the modal)
  const toggleEventExpansion = (eventGroup: EventGroup) => {
    setSelectedEventGroup(eventGroup);
    setIsAllOptionsModalOpen(true);
  };

  // Function to close the all options modal
  const closeAllOptionsModal = () => {
    setIsAllOptionsModalOpen(false);
    setSelectedEventGroup(null);
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

  // Function to fetch markets
  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construct the API URL with query parameters - only for pagination and sorting
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
        sort: sortOption,
      });

      // No longer sending categories to the API - we'll filter on the client side

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [offset, sortOption]); // Remove selectedCategories from dependency array

  // Fetch markets when component mounts or dependencies change
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Function to close the outcomes modal
  const closeOutcomesModal = () => {
    setIsModalOpen(false);
    setSelectedMarket(null);
  };

  // Function to toggle category selection
  const toggleCategory = (category: string) => {
    if (externalSelectedCategories === undefined) {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  // Function to clear all selected categories
  const clearCategories = () => {
    if (externalSelectedCategories === undefined) {
      setSelectedCategories([]);
    }
  };

  // Function to toggle filter dropdown
  const toggleFilter = () => {
    if (externalSelectedCategories === undefined) {
      setIsFilterExpanded(!isFilterExpanded);
    }
  };

  // Function to handle sort change
  const handleSortChange = (option: "volume" | "liquidity") => {
    if (externalSortOption === undefined) {
      setSortOption(option);
    }
    setOffset(0); // Reset pagination when changing sort
  };

  // Function to handle click outside the filter dropdown
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("#filter-dropdown") &&
      !target.closest("#filter-button")
    ) {
      setIsFilterExpanded(false);
    }
  }, []);

  // Setup click outside handler
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

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
          totalVolume: 0,
          totalLiquidity: 0,
        });
      }

      const eventGroup = eventMap.get(market.event_ticker);
      if (eventGroup) {
        eventGroup.markets.push(market);
        eventGroup.totalVolume += market.volume || 0;
        eventGroup.totalLiquidity += market.liquidity || 0;
      }
    });

    // Convert map to array and sort by number of markets
    return Array.from(eventMap.values()).sort(
      (a, b) => b.markets.length - a.markets.length
    );
  };

  // Get the most likely market (highest yes price) from an array of markets
  const getMostLikelyMarket = (markets: KalshiMarket[]): KalshiMarket => {
    if (!markets || markets.length === 0) return markets[0];

    return markets.reduce((mostLikely, current) => {
      // If current market has no yes_bid, keep the previous most likely
      if (!current.yes_bid) return mostLikely;

      // If we don't have a most likely yet, or current has higher yes_bid
      if (!mostLikely.yes_bid || current.yes_bid > mostLikely.yes_bid) {
        return current;
      }

      return mostLikely;
    }, markets[0]);
  };

  // Filter markets based on search query and selected categories
  const filteredMarkets = markets.filter((market) => {
    // If there's a search query, filter by it
    const matchesSearch =
      !searchQuery ||
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (market.event_title &&
        market.event_title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter - exactly like in all-markets.tsx
    const matchesCategory =
      selectedCategories.length === 0 || // If no categories selected, show all
      (market.category && selectedCategories.includes(market.category));

    return matchesSearch && matchesCategory;
  });

  // Group filtered markets by event
  const eventGroups = groupMarketsByEvent(filteredMarkets);

  // Sort event groups based on the selected sort option
  const sortedEventGroups = [...eventGroups].sort((a, b) => {
    if (sortOption === "liquidity") {
      return b.totalLiquidity - a.totalLiquidity;
    }
    return b.totalVolume - a.totalVolume;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Only show UI controls if external ones are not provided */}
        {externalSearchQuery === undefined &&
          externalSortOption === undefined &&
          externalSelectedCategories === undefined && (
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative flex-grow">
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
              <div className="flex items-center space-x-4">
                {/* Sort Button */}
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm p-1">
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      sortOption === "volume"
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSortChange("volume")}
                  >
                    Volume
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      sortOption === "liquidity"
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSortChange("liquidity")}
                  >
                    Liquidity
                  </button>
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    id="filter-button"
                    className={`flex items-center gap-2 px-3 py-2 border ${
                      isFilterExpanded || selectedCategories.length > 0
                        ? "border-blue-500 text-blue-500"
                        : "border-gray-300 text-gray-700"
                    } rounded-lg bg-white hover:bg-gray-50 transition-colors`}
                    onClick={toggleFilter}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span>Filter</span>
                    {selectedCategories.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white bg-blue-500 rounded-full">
                        {selectedCategories.length}
                      </span>
                    )}
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterExpanded && (
                    <div
                      id="filter-dropdown"
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium">Filter by Category</h3>
                        {selectedCategories.length > 0 && (
                          <button
                            className="text-sm text-blue-500 hover:text-blue-700"
                            onClick={clearCategories}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleCategory(category)}
                          >
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onChange={() => {}}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="w-full cursor-pointer"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {sortedEventGroups.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {sortedEventGroups.map((eventGroup) => (
                      <motion.div
                        key={eventGroup.eventTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        {/* Event Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                          <div>
                            <h2 className="text-base font-semibold text-gray-900 line-clamp-2 h-[50px]">
                              {eventGroup.eventTitle}
                            </h2>
                            <div className="flex flex-wrap items-center mt-2 gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                                {eventGroup.category}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-600 border border-slate-300">
                                {eventGroup.markets.length} markets
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Current Favorite Section */}
                        <div className="p-4">
                          <div className="text-sm sm:text-base text-black h-10">
                            <span className="font-medium">
                              Current Favorite:
                            </span>{" "}
                            {(() => {
                              const mostLikelyMarket = getMostLikelyMarket(
                                eventGroup.markets
                              );
                              return (
                                <span className="text-black font-medium">
                                  {mostLikelyMarket?.yes_sub_title ||
                                    mostLikelyMarket?.option_name ||
                                    mostLikelyMarket?.title ||
                                    "Unknown"}
                                  {mostLikelyMarket?.yes_bid &&
                                    ` (${Math.round(
                                      mostLikelyMarket.yes_bid
                                    )}% chance)`}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Market Stats */}
                        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-blue-700 font-medium">
                                Volume
                              </p>
                              <p className="text-sm font-bold text-blue-900">
                                {formatCurrency(eventGroup.totalVolume)}
                              </p>
                            </div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-purple-700 font-medium">
                                Liquidity
                              </p>
                              <p className="text-sm font-bold text-purple-900">
                                {formatCurrency(eventGroup.totalLiquidity)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Preview of first market when collapsed */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex justify-between">
                            <button
                              onClick={() => toggleEventExpansion(eventGroup)}
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              {selectedEventGroup === eventGroup
                                ? "Hide Markets"
                                : "See Outcome Odds"}
                            </button>
                            <a
                              href={`https://kalshi.com/events/${
                                getMostLikelyMarket(eventGroup.markets).ticker
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                            >
                              View on Kalshi
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
                            </a>
                          </div>
                        </div>

                        {/* Markets in this event - Already in a grid layout with animation */}
                        <AnimatePresence>
                          {selectedEventGroup === eventGroup && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                                {eventGroup.markets.map((market) => (
                                  <div
                                    key={market.id}
                                    className="bg-white border border-gray-200 rounded-md hover:shadow-md transition-shadow"
                                  >
                                    <div className="p-3">
                                      {/* Market Title - Only show if different from option_name */}
                                      {market.title !== market.option_name && (
                                        <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-1">
                                          {market.title}
                                        </h3>
                                      )}

                                      {/* Option Name */}
                                      <div className="mb-3">
                                        {market.option_name ? (
                                          <p className="text-base font-bold text-gray-800 line-clamp-1">
                                            {market.option_name}
                                          </p>
                                        ) : (
                                          <p className="text-base font-bold text-gray-800 line-clamp-1">
                                            {market.title}
                                          </p>
                                        )}
                                      </div>

                                      {/* Yes/No Prices */}
                                      <div className="flex space-x-2 mb-3">
                                        <div className="flex-1 bg-green-50 border border-green-100 rounded-md px-2 py-1 text-center">
                                          <p className="text-xs text-green-700 mb-1">
                                            Yes
                                          </p>
                                          <p className="text-sm font-bold text-green-800">
                                            {market.yes_bid
                                              ? `${Math.round(market.yes_bid)}¢`
                                              : "N/A"}
                                          </p>
                                        </div>
                                        <div className="flex-1 bg-red-50 border border-red-100 rounded-md px-2 py-1 text-center">
                                          <p className="text-xs text-red-700 mb-1">
                                            No
                                          </p>
                                          <p className="text-sm font-bold text-red-800">
                                            {market.no_bid
                                              ? `${Math.round(market.no_bid)}¢`
                                              : "N/A"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Market Stats */}
                                      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-2">
                                        <div className="bg-blue-50 rounded-md px-2 py-1">
                                          <p className="text-xs text-blue-700">
                                            Volume
                                          </p>
                                          <p className="text-sm font-semibold text-blue-900">
                                            {formatCurrency(market.volume)}
                                          </p>
                                        </div>
                                        <div className="bg-indigo-50 rounded-md px-2 py-1">
                                          <p className="text-xs text-indigo-700">
                                            Liquidity
                                          </p>
                                          <p className="text-sm font-semibold text-indigo-900">
                                            {formatCurrency(market.liquidity)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            Expires
                                          </p>
                                          <p className="text-xs font-medium text-gray-900">
                                            {formatDate(market.expiration_time)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No markets found
                    </h3>
                    <p className="text-gray-600 max-w-md mb-6">
                      {selectedCategories.length > 0 ? (
                        <>
                          No markets match the selected{" "}
                          {selectedCategories.length === 1
                            ? "category"
                            : "categories"}
                          :
                          <span className="font-medium">
                            {" "}
                            {selectedCategories.join(", ")}
                          </span>
                          .
                          <br />
                          Kalshi may not have markets in{" "}
                          {selectedCategories.length === 1
                            ? "this category"
                            : "these categories"}{" "}
                          yet.
                        </>
                      ) : searchQuery ? (
                        <>
                          No markets match your search: &quot;
                          <span className="font-medium">{searchQuery}</span>
                          &quot;
                        </>
                      ) : (
                        <>No markets available at this time.</>
                      )}
                    </p>
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={clearCategories}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </>
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

      {/* All Options Modal */}
      <AnimatePresence>
        {isAllOptionsModalOpen && selectedEventGroup && (
          <AllOptionsModal
            isOpen={isAllOptionsModalOpen}
            onClose={closeAllOptionsModal}
            eventGroup={selectedEventGroup}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
