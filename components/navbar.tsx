"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { name: "Polymarket", href: "/" },
    { name: "Kalshi", href: "/kalshi" },
  ];

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-center h-16">
          <div className="hidden sm:flex sm:space-x-8 items-center">
            {tabs.map((tab) => {
              const isActive =
                tab.href === pathname || (tab.href === "/" && pathname === "");

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className="relative px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-indigo-600"
                >
                  {tab.name}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      layoutId="navbar-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <motion.svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                animate={isOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      <motion.div
        className="sm:hidden"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="pt-2 pb-3 space-y-1 overflow-hidden">
          {tabs.map((tab) => {
            const isActive =
              tab.href === pathname || (tab.href === "/" && pathname === "");

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 ${
                  isActive
                    ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
