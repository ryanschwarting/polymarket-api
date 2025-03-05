# Polymarket API Integration

A Next.js 14 application that integrates with the Polymarket API to place orders on prediction markets.

## Features

- Environment variable validation with Zod
- Polymarket client with support for GTC, GTD, and FOK orders
- API route for placing orders with validation
- React component for order placement
- Error handling for common issues (insufficient funds, invalid token IDs)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Polymarket API credentials

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/polymarket-integration.git
   cd polymarket-integration
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Fill in your Polymarket API credentials in the `.env` file:

   ```
   PRIVATE_KEY=your_polygon_private_key_here
   API_KEY=your_polymarket_api_key_here
   API_SECRET=your_polymarket_api_secret_here
   PASSPHRASE=your_polymarket_passphrase_here
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### API Endpoint

The application exposes an API endpoint at `/api/place-order` that accepts POST requests with the following parameters:

```json
{
  "tokenID": "7132107...",
  "price": 0.5,
  "side": "BUY",
  "size": 10,
  "orderType": "GTC",
  "feeRateBps": 100,
  "expiration": 1672531200 // Optional, required for GTD orders
}
```

### Order Types

- **GTC (Good-Til-Canceled)**: Order remains active until it's filled or canceled.
- **GTD (Good-Til-Date)**: Order remains active until a specified expiration time.
- **FOK (Fill-Or-Kill)**: Order must be filled immediately and completely or not at all.

### React Component

The application includes a `PolymarketOrderForm` component that provides a user interface for placing orders. To use it:

```jsx
import PolymarketOrderForm from "@/components/PolymarketOrderForm";

export default function Home() {
  return (
    <div>
      <h1>Polymarket Order Placement</h1>
      <PolymarketOrderForm />
    </div>
  );
}
```

## Testing

To test the API endpoint, you can use the provided test script:

```bash
npx ts-node scripts/test-order-api.ts
```

## Error Handling

The application handles common errors:

- **Insufficient Funds**: When the user doesn't have enough funds to place the order.
- **Invalid Token ID**: When the provided token ID doesn't exist or is invalid.
- **Network Errors**: When there are issues connecting to the Polymarket API.
- **Validation Errors**: When the request parameters don't meet the validation criteria.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polymarket](https://polymarket.com) for their prediction market platform
- [Next.js](https://nextjs.org) for the React framework
- [Zod](https://github.com/colinhacks/zod) for validation
