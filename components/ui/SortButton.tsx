"use client";

interface SortButtonProps {
  sortOption: "volume" | "liquidity";
  onSortChange: (option: "volume" | "liquidity") => void;
}

const SortButton = ({ sortOption, onSortChange }: SortButtonProps) => {
  const handleSort = (option: "volume" | "liquidity") => {
    onSortChange(option);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-sm p-1">
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          sortOption === "volume"
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => handleSort("volume")}
        aria-label="Sort by volume"
      >
        Volume
      </button>
      <button
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          sortOption === "liquidity"
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => handleSort("liquidity")}
        aria-label="Sort by liquidity"
      >
        Liquidity
      </button>
    </div>
  );
};

export default SortButton;
