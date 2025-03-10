"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PolymarketMarkets from "@/components/polymarket-markets";
import KalshiMarkets from "@/components/kalshi-markets";
import SearchBar from "@/components/ui/SearchBar";
import SortButton from "@/components/ui/SortButton";
import FilterButton from "@/components/ui/FilterButton";

export default function AllMarkets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"volume" | "liquidity">(
    "volume"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableCategories, _setAvailableCategories] = useState<string[]>([
    "Politics",
    "Economics",
    "Elections",
    "Companies",
    "Entertainment",
    "Science and Technology",
    "Crypto",
    "Climate and Weather",
    "World",
    "Social",
    "Health",
    "Uncategorized",
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("polymarket");

  const handleSortChange = (option: "volume" | "liquidity") => {
    setSortOption(option);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((c) => c !== category)
        : [...prevSelected, category]
    );
  };

  const removeCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.filter((c) => c !== category)
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs
        defaultValue="polymarket"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="sticky top-0 z-50 pt-2 pb-4 backdrop-blur-sm ">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="polymarket">Polymarket</TabsTrigger>
            <TabsTrigger value="kalshi">Kalshi</TabsTrigger>
          </TabsList>

          {/* Search and Filter controls */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <div className="flex items-center space-x-4">
                <SortButton
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
                <FilterButton
                  isFilterOpen={isFilterOpen}
                  toggleFilter={toggleFilter}
                  selectedCategories={selectedCategories}
                  availableCategories={availableCategories}
                  toggleCategory={toggleCategory}
                  clearCategories={clearCategories}
                />
              </div>
            </div>
          </div>

          {/* Selected Categories Display */}
          {selectedCategories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1"
                >
                  <span className="mr-1">{category}</span>
                  <button
                    onClick={() => removeCategory(category)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove ${category} filter`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              ))}
              <button
                onClick={clearCategories}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <TabsContent value="polymarket">
          <PolymarketMarkets
            externalSearchQuery={searchQuery}
            externalSortOption={sortOption}
            externalSelectedCategories={selectedCategories}
          />
        </TabsContent>
        <TabsContent value="kalshi">
          <KalshiMarkets
            externalSearchQuery={searchQuery}
            externalSortOption={sortOption}
            externalSelectedCategories={selectedCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
