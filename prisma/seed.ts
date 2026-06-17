import { PrismaClient, AssetType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const marketPairs = [
    // Forex
    { symbol: "EUR/USD", name: "Euro / US Dollar", assetType: AssetType.FOREX },
    { symbol: "GBP/USD", name: "British Pound / US Dollar", assetType: AssetType.FOREX },
    { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", assetType: AssetType.FOREX },
    { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", assetType: AssetType.FOREX },
    { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", assetType: AssetType.FOREX },
    { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", assetType: AssetType.FOREX },
    { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", assetType: AssetType.FOREX },
    { symbol: "EUR/GBP", name: "Euro / British Pound", assetType: AssetType.FOREX },
    { symbol: "EUR/JPY", name: "Euro / Japanese Yen", assetType: AssetType.FOREX },
    { symbol: "GBP/JPY", name: "British Pound / Japanese Yen", assetType: AssetType.FOREX },
    { symbol: "XAU/USD", name: "Gold / US Dollar", assetType: AssetType.FOREX },
    { symbol: "XAG/USD", name: "Silver / US Dollar", assetType: AssetType.FOREX },
    // Crypto
    { symbol: "BTC/USD", name: "Bitcoin / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "ETH/USD", name: "Ethereum / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "SOL/USD", name: "Solana / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "BNB/USD", name: "Binance Coin / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "XRP/USD", name: "Ripple / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "ADA/USD", name: "Cardano / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "DOGE/USD", name: "Dogecoin / US Dollar", assetType: AssetType.CRYPTO },
    { symbol: "AVAX/USD", name: "Avalanche / US Dollar", assetType: AssetType.CRYPTO },
    // Indices
    { symbol: "US30", name: "Dow Jones Industrial Average", assetType: AssetType.INDICES },
    { symbol: "US500", name: "S&P 500", assetType: AssetType.INDICES },
    { symbol: "NAS100", name: "NASDAQ 100", assetType: AssetType.INDICES },
    { symbol: "GER40", name: "DAX 40", assetType: AssetType.INDICES },
    { symbol: "UK100", name: "FTSE 100", assetType: AssetType.INDICES },
    { symbol: "JPN225", name: "Nikkei 225", assetType: AssetType.INDICES },
    { symbol: "AUS200", name: "S&P/ASX 200", assetType: AssetType.INDICES },
  ];

  for (const pair of marketPairs) {
    await prisma.marketPair.upsert({
      where: { symbol: pair.symbol },
      update: {},
      create: pair,
    });
  }

  const tags = [
    "scalping", "swing", "breakout", "reversal", "trend",
    "news", "support", "resistance", "fibonacci", "ict",
    "smc", "harmonic", "divergence", "liquidity", "orderblock",
  ];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const password = await bcrypt.hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@tickr.app" },
    update: {},
    create: {
      email: "demo@tickr.app",
      username: "traderpro",
      name: "Alex Chen",
      password,
      bio: "Forex & Crypto trader. 5+ years experience. ICT concepts & SMC methodology.",
    },
  });

  const eurUsd = await prisma.marketPair.findUnique({ where: { symbol: "EUR/USD" } });
  const xauUsd = await prisma.marketPair.findUnique({ where: { symbol: "XAU/USD" } });
  const btcUsd = await prisma.marketPair.findUnique({ where: { symbol: "BTC/USD" } });
  const nas100 = await prisma.marketPair.findUnique({ where: { symbol: "NAS100" } });

  const breakoutTag = await prisma.tag.findUnique({ where: { name: "breakout" } });
  const swingTag = await prisma.tag.findUnique({ where: { name: "swing" } });
  const ictTag = await prisma.tag.findUnique({ where: { name: "ict" } });
  const trendTag = await prisma.tag.findUnique({ where: { name: "trend" } });

  if (eurUsd && breakoutTag && swingTag) {
    await prisma.post.upsert({
      where: { id: "seed-post-1" },
      update: { chartUrl: "/charts/eurusd.svg" },
      create: {
        id: "seed-post-1",
        userId: demoUser.id,
        marketPairId: eurUsd.id,
        direction: "BUY",
        entryPrice: 1.08420,
        stopLoss: 1.07980,
        takeProfit: 1.09300,
        timeframe: "H4",
        chartUrl: "/charts/eurusd.svg",
        description:
          "Clean break above the 1.0840 key resistance level with strong momentum. Expecting continuation towards the 1.0930 target. Stop placed below the breakout candle. Risk-to-reward is solid at 2:1. Watch for NY session confirmation.",
        tags: { connect: [{ id: breakoutTag.id }, { id: swingTag.id }] },
      },
    });
  }

  if (xauUsd && ictTag && trendTag) {
    await prisma.post.upsert({
      where: { id: "seed-post-2" },
      update: { chartUrl: "/charts/xauusd.svg" },
      create: {
        id: "seed-post-2",
        userId: demoUser.id,
        marketPairId: xauUsd.id,
        direction: "BUY",
        entryPrice: 2018.50,
        stopLoss: 2008.00,
        takeProfit: 2042.00,
        timeframe: "D1",
        chartUrl: "/charts/xauusd.svg",
        description:
          "Gold reacting off a major daily order block at 2018. Price swept the liquidity below last week's low and is now showing bullish displacement. Looking for continuation to the next premium PD array. ICT concept — optimal trade entry within the OB.",
        tags: { connect: [{ id: ictTag.id }, { id: trendTag.id }] },
      },
    });
  }

  if (btcUsd && breakoutTag) {
    await prisma.post.upsert({
      where: { id: "seed-post-3" },
      update: { chartUrl: "/charts/btcusd.svg" },
      create: {
        id: "seed-post-3",
        userId: demoUser.id,
        marketPairId: btcUsd.id,
        direction: "SELL",
        entryPrice: 43500,
        stopLoss: 44800,
        takeProfit: 40000,
        timeframe: "H4",
        chartUrl: "/charts/btcusd.svg",
        description:
          "BTC showing distribution at the 43.5k level. Multiple rejections at this zone. If we break below 42k with momentum, expecting a move to the 40k demand zone. Tight stop above the recent high. Playing the range exhaustion short.",
        tags: { connect: [{ id: breakoutTag.id }] },
      },
    });
  }

  if (nas100 && swingTag) {
    await prisma.post.upsert({
      where: { id: "seed-post-4" },
      update: { chartUrl: "/charts/nas100.svg" },
      create: {
        id: "seed-post-4",
        userId: demoUser.id,
        marketPairId: nas100.id,
        direction: "BUY",
        entryPrice: 17250,
        stopLoss: 17050,
        takeProfit: 17800,
        timeframe: "D1",
        chartUrl: "/charts/nas100.svg",
        description:
          "NAS100 pulling back to the 17250 support after the strong rally. Confluence with the 21 EMA. Expecting a bounce into the 17800 all-time high region. Earnings season looking strong for mega-cap tech. Risk/reward 2.75:1.",
        tags: { connect: [{ id: swingTag.id }] },
      },
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
