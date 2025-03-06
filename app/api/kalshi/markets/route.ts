// Define the KalshiMarket interface for type safety
export interface KalshiMarket {
  id: string;
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  open_time: string;
  close_time: string;
  expected_expiration_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  notional_value: number;
  tick_size: number;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_yes_bid: number;
  previous_yes_ask: number;
  previous_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  open_interest: number;
  result?: string;
  can_close_early: boolean;
  expiration_value?: string;
  category?: string;
  risk_limit_cents: number;
  rules_primary?: string;
  rules_secondary?: string;
  image?: string;
  outcomes?: string[];
  outcomePrices?: number[];
  active?: boolean;
  closed?: boolean;
  isNew?: boolean;
  event_title?: string;
  strike_type?: string;
  custom_strike?: Record<string, string>;
  option_name?: string;
}

// Define the Kalshi Event interface
export interface KalshiEvent {
  id: string;
  ticker: string;
  title: string;
  subtitle: string;
  sub_title: string;
  category: string;
  markets: KalshiMarket[];
  total_markets: number;
  total_volume: number;
  total_open_interest: number;
}

// Define the response interface
export interface KalshiMarketsResponse {
  success: boolean;
  markets: KalshiMarket[];
  message: string;
  totalMarkets: number;
}

// Ensure the route isn't statically cached
export const dynamic = "force-dynamic";

// Kalshi API endpoint for events with nested markets
const KALSHI_API_URL =
  "https://api.elections.kalshi.com/trade-api/v2/events?with_nested_markets=true";

// Check if a market is new (created in the last 7 days)
function isNewMarket(market: KalshiMarket): boolean {
  const openTime = new Date(market.open_time);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return openTime >= sevenDaysAgo;
}

// Map Kalshi markets from events to our standardized format
function mapKalshiMarketsFromEvents(events: KalshiEvent[]): KalshiMarket[] {
  const allMarkets: KalshiMarket[] = [];

  events.forEach((event) => {
    if (event.markets && Array.isArray(event.markets)) {
      const marketsWithEventInfo = event.markets.map((market) => {
        // Determine if market is active or closed based on status
        const active =
          market.status === "active" || market.status === "initialized";
        const closed =
          market.status === "settled" || market.status === "canceled";

        // Create outcomePrices array from yes_bid and yes_ask
        const outcomePrices = [market.yes_bid, market.no_bid];

        // Determine the option name from available fields
        let optionName = "";

        if (market.yes_sub_title && market.yes_sub_title !== event.sub_title) {
          // Use yes_sub_title if it's different from the event sub_title
          optionName = market.yes_sub_title;
        } else if (market.subtitle) {
          // Use subtitle if available
          optionName = market.subtitle.replace("::", "").trim();
        } else if (
          market.custom_strike &&
          Object.values(market.custom_strike).length > 0
        ) {
          // Use custom_strike if available
          optionName = Object.values(market.custom_strike)[0];
        }

        // Add event information to the market
        return {
          ...market,
          category: event.category || "Uncategorized",
          event_title: event.title,
          outcomes: ["Yes", "No"],
          outcomePrices,
          active,
          closed,
          isNew: isNewMarket(market),
          option_name: optionName,
        };
      });

      allMarkets.push(...marketsWithEventInfo);
    }
  });

  return allMarkets;
}

// Original function kept for reference
function mapKalshiMarkets(markets: any[]): KalshiMarket[] {
  return markets.map((market) => {
    // Determine if market is active or closed based on status
    const active =
      market.status === "active" || market.status === "initialized";
    const closed = market.status === "settled" || market.status === "canceled";

    // Create outcomePrices array from yes_bid and yes_ask
    const outcomePrices = [market.yes_bid, market.no_bid];

    // Return the mapped market
    return {
      ...market,
      outcomes: ["Yes", "No"],
      outcomePrices,
      active,
      closed,
      isNew: isNewMarket(market),
    };
  });
}

export async function GET(request: Request) {
  try {
    // Parse the request URL to get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";
    const sort = searchParams.get("sort") || "volume";

    // Get all category parameters (supports multiple categories)
    const categories = searchParams.getAll("categories");

    // Set up request options
    const options = {
      method: "GET",
      headers: { accept: "application/json" },
    };

    // Call the Kalshi API for events with nested markets
    const response = await fetch(KALSHI_API_URL, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.events || !Array.isArray(data.events)) {
      throw new Error("Invalid response format from Kalshi API");
    }

    // Map the Kalshi markets from events to our format
    let mappedMarkets = mapKalshiMarketsFromEvents(data.events);

    // Apply category filter if categories are provided
    if (categories.length > 0) {
      mappedMarkets = mappedMarkets.filter((market) => {
        // Skip markets without a category
        if (!market.category) return false;

        const marketCategory = market.category as string;
        // Check if the market's category matches any of the selected categories
        return categories.some(
          (cat) => marketCategory.toLowerCase() === cat.toLowerCase()
        );
      });
    }

    // Sort markets by volume or liquidity
    mappedMarkets.sort((a, b) => {
      if (sort === "liquidity") {
        return b.liquidity - a.liquidity;
      }
      return b.volume - a.volume;
    });

    // Get unique categories
    const uniqueCategories = Array.from(
      new Set(mappedMarkets.map((market) => market.category || "Uncategorized"))
    );

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedMarkets = mappedMarkets.slice(
      offsetNum,
      offsetNum + limitNum
    );

    // Return the response
    return Response.json({
      success: true,
      markets: paginatedMarkets,
      categories: uniqueCategories,
      totalMarkets: mappedMarkets.length,
      message: "Markets retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching Kalshi markets:", error);
    return Response.json(
      {
        success: false,
        markets: [],
        message: error.message || "Failed to fetch markets",
        totalMarkets: 0,
      },
      { status: 500 }
    );
  }
}
