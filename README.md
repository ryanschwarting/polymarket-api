# Polymarket Explorer

A Next.js 14 application that integrates with the Polymarket and Kalshi APIs to provide a comprehensive prediction markets explorer, offering users insights into real-time market data, trends, and trading opportunities.

## What is Polymarket Explorer?

Polymarket Explorer is a sophisticated platform that bridges the gap between casual observers and active participants in prediction markets. It serves as a unified interface for exploring, analyzing, and interacting with real-time prediction markets from multiple platforms including Polymarket and Kalshi.

The application leverages advanced data visualization and categorization to present complex market information in an intuitive, accessible format. Users can seamlessly browse through diverse categories of prediction markets, examine price movements, and gain insights into market sentiment across political events, sports outcomes, economic indicators, and emerging technologies.

## Who is it for?

### Prediction Market Enthusiasts

Users who follow prediction markets but may find navigating multiple platforms cumbersome. The Explorer provides a consolidated view across platforms, making it easier to track diverse markets without switching between sites.

### Data-Driven Decision Makers

Individuals who rely on crowd wisdom and market-based forecasting to inform their decisions. These users benefit from the app's comprehensive categorization, filtering, and sorting capabilities, which help identify the most relevant signals across multiple prediction markets.

### Researchers and Analysts

People studying forecasting, crowd wisdom, or specific domains like politics or economics. The Explorer offers a unified view of market sentiment across platforms, enabling deeper insights into how different markets price similar events.

### Traders and Investors

Active participants in prediction markets looking for trading opportunities. The platform's streamlined interface between analysis and execution helps users identify market inefficiencies and seamlessly transition to placing orders on their preferred platform.

### Newcomers to Prediction Markets

Those curious about prediction markets but intimidated by the complexity of individual platforms. The Explorer provides context, categorization, and user-friendly interfaces that make prediction markets more approachable for beginners.

## Features

- Browse all Polymarket and Kalshi prediction markets in a unified interface
- View detailed market information including prices, outcomes, and real-time data
- Filter markets by category (Sports, Politics, Crypto, Economy, etc.)
- Sort markets by volume or liquidity to identify the most active opportunities
- Responsive design optimized for all devices
- Direct integration with trading platforms for seamless market participation
- Advanced visualization of market data and price trends
- Real-time updates of market conditions and probabilities

## API Integration

The application provides a streamlined API endpoint for fetching market data:

### Markets API Endpoint

`GET /api/markets` - Fetches all markets from Polymarket with optional filtering

**Query Parameters:**

- `page` - Page number for pagination (default: 1)
- `limit` - Number of markets per page (default: 20)
- `category` - Filter by category name (optional)
- `search` - Search term for market titles/questions (optional)
- `sortBy` - Sort field, either "volume" or "liquidity" (default: "volume")
- `active` - Filter for active markets only (optional, boolean)

**Response Format:**

```json
{
  "success": true,
  "markets": [
    {
      "id": "string",
      "title": "string",
      "question": "string",
      "volume": 0,
      "liquidity": 0,
      "endDate": "string",
      "active": true,
      "closed": false,
      "category": "string",
      "outcomePrices": [0.5, 0.5],
      "outcomes": ["Yes", "No"],
      "image": "string",
      "nestedMarkets": []
    }
  ],
  "message": "string",
  "totalMarkets": 0
}
```

## UI Components

### Market Components

The application features dedicated components for different market platforms:

- **PolymarketMarkets**: Displays Polymarket prediction markets with detailed outcome information
- **KalshiMarkets**: Organizes Kalshi markets by event groups with probability visualization
- **OrderForm**: Enables direct market interaction for placing trades on supported platforms

Each component provides:

- Category filtering with intuitive toggles
- Advanced sorting mechanisms
- Responsive pagination
- Detailed market cards showing key indicators
- Modal views for exploring outcomes and probabilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/polymarket-explorer.git
   cd polymarket-explorer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technical Details

The application leverages a modern tech stack to deliver a performant and intuitive user experience:

- **Real-time Data Integration**: Connects to multiple prediction market APIs to fetch and normalize market data
- **Intelligent Categorization**: Automatically categorizes markets using natural language analysis of market questions
- **Responsive UI**: Built with Tailwind CSS and Framer Motion for smooth animations and transitions
- **Server-side API Integration**: Uses Next.js API routes for secure and efficient data fetching
- **Client-side Filtering**: Provides instantaneous filtering and sorting capabilities for optimal user experience
- **TypeScript**: Ensures type safety throughout the application for reliable performance

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polymarket](https://polymarket.com) for their prediction market platform and API
- [Kalshi](https://kalshi.com) for their event contracts and market data
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
