"use client";

import React from "react";
import { BsTwitterX } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="py-3 flex flex-col gap-4 sm:flex-row items-center justify-between">
          {/* Copyright and Legal Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2025 Prediction Markets Explorer.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-500 transition-colors"
                aria-label="Twitter"
              >
                <BsTwitterX className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-500 transition-colors"
                aria-label="Discord"
              >
                <FaDiscord className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-zinc-600 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-500 transition-colors"
                aria-label="Email"
              >
                <IoMdMail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
