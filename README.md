# Polymarket Explorer

A Next.js 14 application that integrates with the Polymarket API to display and explore prediction markets with real-time data.

## Features

- Browse all Polymarket prediction markets
- View detailed market information including prices and outcomes
- Filter markets by category (Sports, Politics, Crypto, Economy, etc.)
- Sort markets by volume or liquidity
- Responsive design for all devices

## API Integration

The application provides a streamlined API endpoint for fetching Polymarket market data:

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

### AllMarkets Component

The main component displays all markets with:

- Category filtering
- Sort controls
- Pagination
- Detailed market cards showing key information
- Modal view for outcome details

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

The application integrates with the Polymarket Gamma API to fetch market data, which is then formatted and categorized for display. Key features include:

- Real-time market data with automatic category detection
- Responsive UI built with Tailwind CSS
- Server-side API integration with Next.js API routes
- Client-side filtering and sorting capabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polymarket](https://polymarket.com) for their prediction market platform and API
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
