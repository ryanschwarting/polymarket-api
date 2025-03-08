"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, BarChart3, Globe } from "lucide-react";
import Link from "next/link";

export default function NewHero() {
  return (
    <div className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <div className="absolute inset-0 opacity-5">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="dots"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>

      {/* Animated accent shapes */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-300 mb-6"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Explore the top prediction markets
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Prediction Markets Explorer
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover, analyze, and compare top markets from leading prediction
            platforms. Each market connects you directly to trading platforms
            where you can place your bets with ease.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/markets"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 shadow-lg hover:shadow-indigo-500/20"
            >
              Explore Markets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-700 text-base font-medium rounded-lg text-slate-300 bg-slate-800/50 hover:bg-slate-800 transition-colors duration-150"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-indigo-400 mr-3" />
              <Globe className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Analytics</h3>
            <p className="text-slate-400">
              Track real-time market movements across multiple prediction
              platforms in one unified interface with advanced analytics.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
            <TrendingUp className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              One-Click Market Access
            </h3>
            <p className="text-slate-400">
              Analyze markets here, then jump directly to the respective
              prediction platforms to place your predictions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
