// Define the Market interface for type safety
export interface Market {
  id: string;
  title: string;
  question: string;
  volume: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  category: string;
  outcomePrices?: number[] | Record<string, number>;
  tokens?: Array<{
    outcome: string;
    token_id: string;
  }>;
  image?: string;
  icon?: string;
  slug?: string;
  conditionId?: string;
  liquidity: number;
  description?: string;
  outcomes?: string[];
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isNew?: boolean;
  featured?: boolean;
  restricted?: boolean;
  questionID?: string;
  volume24hr?: number;
  spread?: number;
  bestBid?: number;
  bestAsk?: number;
  lastTradePrice?: number;
}

// Define a type for the raw market data from the API
interface RawMarketData {
  id: string;
  title?: string;
  question?: string;
  volume?: string | number;
  volumeNum?: number;
  end_date?: string;
  endDate?: string;
  endDateIso?: string;
  end_date_iso?: string;
  active: boolean;
  closed: boolean;
  category?: string;
  image?: string;
  icon?: string;
  slug?: string;
  conditionId?: string;
  liquidity?: string | number;
  liquidityNum?: number;
  description?: string;
  outcomes?: string;
  outcomePrices?: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  new?: boolean;
  featured?: boolean;
  restricted?: boolean;
  questionID?: string;
  volume24hr?: number;
  spread?: number;
  bestBid?: number;
  bestAsk?: number;
  lastTradePrice?: number;
  markets?: Array<{
    question?: string;
    outcomePrices?: Record<string, number>;
    endDate?: string;
    conditionId?: string;
    liquidity?: number;
    tokens?: Array<{
      outcome: string;
      token_id: string;
    }>;
  }>;
  tokens?: Array<{
    outcome: string;
    token_id: string;
  }>;
}

// Ensure the route isn't statically cached
export const dynamic = "force-dynamic";

// Polymarket Gamma API endpoint
const GAMMA_API_URL = "https://gamma-api.polymarket.com/events";

// Function to parse outcome prices from string to array of numbers
function parseOutcomePrices(outcomePricesStr?: string): number[] {
  if (!outcomePricesStr) return [];

  try {
    const parsed = JSON.parse(outcomePricesStr);
    return Array.isArray(parsed)
      ? parsed.map((price) =>
          typeof price === "string" ? parseFloat(price) : price
        )
      : [];
  } catch (e) {
    console.error("Error parsing outcome prices:", e);
    return [];
  }
}

// Function to parse outcomes from string to array of strings
function parseOutcomes(outcomesStr?: string): string[] {
  if (!outcomesStr) return [];

  try {
    return JSON.parse(outcomesStr);
  } catch (e) {
    console.error("Error parsing outcomes:", e);
    return [];
  }
}

// Check if a market is new (created in the last 7 days)
function isNewMarket(market: RawMarketData): boolean {
  if (market.new === true) return true;

  const createdAt = market.createdAt || market.startDate;
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return createdDate >= sevenDaysAgo;
}

// Define standard categories and keywords to map to them
const CATEGORY_MAPPING: Record<string, string[]> = {
  Sports: [
    "sports",
    "football",
    "soccer",
    "nfl",
    "nba",
    "mlb",
    "hockey",
    "tennis",
    "golf",
    "championship",
    "league",
    "tournament",
    "cup",
    "premier",
    "uefa",
    "world cup",
    "champion",
    "winner",
  ],
  Politics: [
    "politics",
    "election",
    "president",
    "vote",
    "political",
    "democrat",
    "republican",
    "congress",
    "senate",
    "house",
    "government",
    "trump",
    "biden",
    "presidential",
  ],
  Crypto: [
    "crypto",
    "bitcoin",
    "ethereum",
    "blockchain",
    "btc",
    "eth",
    "token",
    "coin",
    "defi",
    "nft",
    "web3",
  ],
  New: [], // Empty array for the "New" category - we'll determine this by creation date
  Economy: [
    "economy",
    "economic",
    "finance",
    "financial",
    "stock",
    "market",
    "gdp",
    "inflation",
    "recession",
    "fed",
    "interest rate",
  ],
};

// Function to determine the best category for a market
function determineCategory(market: RawMarketData): string {
  // If the market already has a category, use it
  if (market.category) {
    // Check if it's one of our standard categories (case insensitive)
    for (const standardCategory of Object.keys(CATEGORY_MAPPING)) {
      if (market.category.toLowerCase() === standardCategory.toLowerCase()) {
        return standardCategory;
      }
    }
    return market.category;
  }

  // Try to determine category from the question/title
  const questionText = (
    market.question ||
    market.title ||
    market.markets?.[0]?.question ||
    ""
  ).toLowerCase();

  // Special cases for specific markets we want to categorize as Politics
  if (
    questionText.includes("trump") ||
    questionText.includes("biden") ||
    questionText.includes("war") ||
    questionText.includes("ukraine") ||
    questionText.includes("russia") ||
    questionText.includes("recession") ||
    questionText.includes("openai") ||
    questionText.includes("u.s.") ||
    questionText.includes("united states") ||
    questionText.includes("election") ||
    questionText.includes("government") ||
    questionText.includes("president") ||
    questionText.includes("congress") ||
    questionText.includes("senate") ||
    questionText.includes("house") ||
    questionText.includes("supreme court") ||
    questionText.includes("federal") ||
    questionText.includes("democracy") ||
    questionText.includes("democratic") ||
    questionText.includes("republican")
  ) {
    return "Politics";
  }

  // Special case for economy-related markets
  if (
    questionText.includes("recession") ||
    questionText.includes("economy") ||
    questionText.includes("economic") ||
    questionText.includes("inflation") ||
    questionText.includes("fed") ||
    questionText.includes("interest rate") ||
    questionText.includes("gdp") ||
    questionText.includes("stock market") ||
    questionText.includes("financial") ||
    questionText.includes("finance")
  ) {
    return "Economy";
  }

  // Check each category's keywords
  const categoryMatches: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    // Skip the "New" category as it's determined by date
    if (category === "New") continue;

    // Count how many keywords match for this category
    let matchCount = 0;
    for (const keyword of keywords) {
      if (questionText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      categoryMatches[category] = matchCount;
    }
  }

  // If we have matches, return the category with the most keyword matches
  if (Object.keys(categoryMatches).length > 0) {
    const bestCategory = Object.entries(categoryMatches).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    return bestCategory;
  }

  // Special case for markets with sports team names
  const sportsTeams = [
    "arsenal",
    "manchester",
    "liverpool",
    "chelsea",
    "tottenham",
    "lakers",
    "celtics",
    "warriors",
    "bulls",
    "heat",
    "knicks",
    "yankees",
    "dodgers",
    "red sox",
    "cubs",
    "giants",
    "cowboys",
    "patriots",
    "eagles",
    "packers",
    "steelers",
  ];

  for (const team of sportsTeams) {
    if (questionText.includes(team)) {
      return "Sports";
    }
  }

  return "Uncategorized";
}

export async function GET() {
  try {
    console.log("Fetching markets from Polymarket Gamma API...");

    // We'll fetch up to 5 batches of 100 markets each with offset
    const allMarkets: RawMarketData[] = [];
    const seenMarketIds = new Set<string>(); // Track market IDs we've already seen
    const seenTitles = new Set<string>(); // Track market titles we've already seen
    const limit = 100;
    const maxBatches = 5; // Fetch up to 5 batches (500 markets total)
    let duplicatesSkipped = 0; // Track how many duplicates we skip

    // Fetch markets with offset pagination
    for (let batch = 0; batch < maxBatches; batch++) {
      const offset = batch * limit;
      console.log(`Fetching markets with offset ${offset}...`);

      const response = await fetch(
        `${GAMMA_API_URL}?active=true&closed=false&limit=${limit}&offset=${offset}&sort=volume:desc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(
          `Gamma API returned status: ${response.status} for offset ${offset}`
        );
      }

      // Parse the JSON response
      const marketsPage: RawMarketData[] = await response.json();

      console.log(
        `Received ${marketsPage.length} markets for offset ${offset}`
      );

      // If we got fewer markets than the limit, we've reached the end
      if (!Array.isArray(marketsPage) || marketsPage.length === 0) {
        console.log(`No more markets found at offset ${offset}`);
        break;
      }

      // Add only unique markets from this page to our collection
      for (const market of marketsPage) {
        if (!market.id) {
          console.log("Skipping market with missing ID");
          continue;
        }

        // Get the title or question for duplicate checking
        const title = market.title || market.question || "";

        // Skip if we've seen this ID or title before
        if (seenMarketIds.has(market.id) || (title && seenTitles.has(title))) {
          duplicatesSkipped++;
          // Don't log every duplicate to avoid console spam
          if (duplicatesSkipped % 10 === 0) {
            console.log(
              `Skipped ${duplicatesSkipped} duplicate markets so far`
            );
          }
          continue;
        }

        // Add to our tracking sets and markets array
        seenMarketIds.add(market.id);
        if (title) seenTitles.add(title);
        allMarkets.push(market);
      }

      // If we got fewer markets than the limit, we've reached the end
      if (marketsPage.length < limit) {
        console.log(`Reached end of markets at offset ${offset}`);
        break;
      }
    }

    console.log(`Total unique markets fetched: ${allMarkets.length}`);
    console.log(`Total duplicate markets skipped: ${duplicatesSkipped}`);

    if (allMarkets.length === 0) {
      console.log("No markets found in Gamma API response");
      return Response.json({
        message: "No markets available from Polymarket API",
        markets: [],
        success: false,
      });
    }

    // Process all markets without categorizing
    const formattedMarkets: Market[] = [];

    allMarkets.forEach((market) => {
      // Skip invalid markets
      if (!market || typeof market !== "object") return;

      // Skip inactive or closed markets (should already be filtered by API query params)
      if (market.active !== true || market.closed === true) return;

      // Extract volume - try different possible locations
      let volume = 0;
      if (typeof market.volume === "number") {
        volume = market.volume;
      } else if (typeof market.volume === "string") {
        volume = parseFloat(market.volume) || 0;
      } else if (typeof market.volumeNum === "number") {
        volume = market.volumeNum;
      }

      // Extract liquidity - try different possible locations
      let liquidity = 0;
      if (typeof market.liquidity === "number") {
        liquidity = market.liquidity;
      } else if (typeof market.liquidity === "string") {
        liquidity = parseFloat(market.liquidity) || 0;
      } else if (typeof market.liquidityNum === "number") {
        liquidity = market.liquidityNum;
      }

      // Parse outcome prices
      const outcomePrices = parseOutcomePrices(market.outcomePrices);

      // Parse outcomes
      const outcomes = parseOutcomes(market.outcomes);

      // Determine if this is a new market
      const isNew = isNewMarket(market);

      // Format the market data
      const formattedMarket: Market = {
        id: market.id,
        title: market.title || market.question || "Untitled Market",
        question: market.question || "",
        volume: volume,
        liquidity: liquidity,
        endDate:
          market.endDate ||
          market.end_date ||
          market.endDateIso ||
          market.end_date_iso ||
          "N/A",
        active: market.active,
        closed: market.closed,
        category: determineCategory(market),
        outcomePrices: outcomePrices.length > 0 ? outcomePrices : undefined,
        outcomes: outcomes.length > 0 ? outcomes : undefined,
        image: market.image,
        icon: market.icon,
        slug: market.slug,
        conditionId: market.conditionId,
        description: market.description,
        startDate: market.startDate,
        createdAt: market.createdAt,
        updatedAt: market.updatedAt,
        isNew: isNew,
        featured: market.featured,
        restricted: market.restricted,
        questionID: market.questionID,
        volume24hr: market.volume24hr,
        spread: market.spread,
        bestBid: market.bestBid,
        bestAsk: market.bestAsk,
        lastTradePrice: market.lastTradePrice,
      };

      // Add the formatted market to our array
      formattedMarkets.push(formattedMarket);
    });

    // Sort all markets by volume (descending)
    formattedMarkets.sort((a, b) => b.volume - a.volume);

    // Return all markets sorted by volume
    return Response.json({
      success: true,
      markets: formattedMarkets,
      message: `All markets sorted by volume (${formattedMarkets.length} total)`,
      totalMarkets: formattedMarkets.length,
    });
  } catch (error) {
    console.error("Error in markets API route:", error);

    // If anything goes wrong, return an error
    return Response.json({
      success: false,
      message: "Error retrieving market data",
      error: error instanceof Error ? error.message : String(error),
      markets: [],
    });
  }
}
