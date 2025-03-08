"use client";

import { useEffect, useRef } from "react";

interface FilterButtonProps {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  selectedCategories: string[];
  availableCategories: string[];
  toggleCategory: (category: string) => void;
  clearCategories: () => void;
}

const FilterButton = ({
  isFilterOpen,
  toggleFilter,
  selectedCategories,
  availableCategories,
  toggleCategory,
  clearCategories,
}: FilterButtonProps) => {
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        filterRef.current &&
        !filterRef.current.contains(target) &&
        !(target as HTMLElement).closest("#filter-button")
      ) {
        if (isFilterOpen) {
          toggleFilter();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen, toggleFilter]);

  return (
    <div className="relative">
      <button
        id="filter-button"
        className={`flex items-center gap-2 px-3 py-2 border ${
          isFilterOpen || selectedCategories.length > 0
            ? "border-blue-500 text-blue-500"
            : "border-gray-300 text-gray-700"
        } rounded-lg bg-white hover:bg-gray-50 transition-colors`}
        onClick={toggleFilter}
        aria-expanded={isFilterOpen}
        aria-controls="filter-dropdown"
        aria-label="Filter markets"
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

      {isFilterOpen && (
        <div
          id="filter-dropdown"
          ref={filterRef}
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
            {availableCategories.map((category) => {
              const isChecked = selectedCategories.includes(category);
              // Simple ID generation ensuring uniqueness
              const id = `category-${category
                .replace(/\s+/g, "-")
                .toLowerCase()}`;

              return (
                <label
                  key={category}
                  htmlFor={id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer w-full"
                >
                  <input
                    type="checkbox"
                    id={id}
                    checked={isChecked}
                    onChange={() => toggleCategory(category)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="select-none">{category}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
