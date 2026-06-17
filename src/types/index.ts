import { Direction, AssetType, Timeframe, PostStatus } from "@prisma/client";

export type { Direction, AssetType, Timeframe, PostStatus };

export interface UserPublic {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  _count: {
    posts: number;
    likes: number;
  };
}

export interface PostWithDetails {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  marketPair: {
    id: string;
    symbol: string;
    name: string;
    assetType: AssetType;
  };
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: Timeframe;
  description: string;
  chartUrl: string | null;
  status: PostStatus;
  tags: Array<{ id: string; name: string }>;
  _count: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface FilterState {
  assetType: AssetType | "ALL";
  marketPair: string;
  direction: Direction | "ALL";
  tag: string;
}

export const MARKET_PAIRS_BY_ASSET: Record<AssetType, Array<{ symbol: string; name: string }>> = {
  FOREX: [
    { symbol: "EUR/USD", name: "Euro / US Dollar" },
    { symbol: "GBP/USD", name: "GBP / US Dollar" },
    { symbol: "USD/JPY", name: "USD / Japanese Yen" },
    { symbol: "USD/CHF", name: "USD / Swiss Franc" },
    { symbol: "AUD/USD", name: "AUD / US Dollar" },
    { symbol: "USD/CAD", name: "USD / CAD" },
    { symbol: "NZD/USD", name: "NZD / US Dollar" },
    { symbol: "EUR/GBP", name: "Euro / GBP" },
    { symbol: "EUR/JPY", name: "Euro / Yen" },
    { symbol: "GBP/JPY", name: "GBP / Yen" },
    { symbol: "XAU/USD", name: "Gold / USD" },
    { symbol: "XAG/USD", name: "Silver / USD" },
  ],
  CRYPTO: [
    { symbol: "BTC/USD", name: "Bitcoin / USD" },
    { symbol: "ETH/USD", name: "Ethereum / USD" },
    { symbol: "SOL/USD", name: "Solana / USD" },
    { symbol: "BNB/USD", name: "Binance Coin / USD" },
    { symbol: "XRP/USD", name: "Ripple / USD" },
    { symbol: "ADA/USD", name: "Cardano / USD" },
    { symbol: "DOGE/USD", name: "Dogecoin / USD" },
    { symbol: "AVAX/USD", name: "Avalanche / USD" },
  ],
  INDICES: [
    { symbol: "US30", name: "Dow Jones" },
    { symbol: "US500", name: "S&P 500" },
    { symbol: "NAS100", name: "NASDAQ 100" },
    { symbol: "GER40", name: "DAX 40" },
    { symbol: "UK100", name: "FTSE 100" },
    { symbol: "JPN225", name: "Nikkei 225" },
    { symbol: "AUS200", name: "ASX 200" },
  ],
};

export const TIMEFRAMES: Array<{ value: Timeframe; label: string }> = [
  { value: "M1", label: "1M" },
  { value: "M5", label: "5M" },
  { value: "M15", label: "15M" },
  { value: "M30", label: "30M" },
  { value: "H1", label: "1H" },
  { value: "H4", label: "4H" },
  { value: "D1", label: "1D" },
  { value: "W1", label: "1W" },
  { value: "MN", label: "1MN" },
];

export const STRATEGY_TAGS = [
  "scalping",
  "swing",
  "breakout",
  "reversal",
  "trend",
  "news",
  "support",
  "resistance",
  "fibonacci",
  "ict",
  "smc",
  "harmonic",
  "divergence",
  "liquidity",
  "orderblock",
];
