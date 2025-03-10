"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

const ScrollToTop = ({ threshold = 300, className }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleScrollToTop();
    }
  };

  return (
    <button
      aria-label="Scroll to top"
      tabIndex={0}
      onClick={handleScrollToTop}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed bottom-6 right-6 p-2.5 rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 z-50 border border-gray-200 backdrop-blur-sm",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none",
        className
      )}
    >
      <ChevronUp className="h-5 w-5 stroke-[2.5px]" />
    </button>
  );
};

export default ScrollToTop;
