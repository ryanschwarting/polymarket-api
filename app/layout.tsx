import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Hero from "@/components/hero";
import Footer from "@/components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Prediction Markets Explorer",
  description:
    "A tool for exploring prediction markets to help you make better decisions. To view all markets in one place, visit the Prediction Markets Explorer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Hero />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
