import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AssetType, Direction } from "@prisma/client";

const PAGE_SIZE = 10;

const createSchema = z.object({
  marketPairId: z.string().min(1, "Market pair is required"),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive(),
  timeframe: z.enum(["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"]),
  description: z.string().min(1).max(2000),
  chartUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const cursor = searchParams.get("cursor");
    const assetType = searchParams.get("assetType") as AssetType | null;
    const direction = searchParams.get("direction") as Direction | null;
    const pair = searchParams.get("pair");
    const tag = searchParams.get("tag");

    const where: Record<string, unknown> = {};

    if (assetType && assetType !== ("ALL" as never)) {
      where.marketPair = { assetType };
    }
    if (direction && direction !== ("ALL" as never)) {
      where.direction = direction;
    }
    if (pair) {
      where.marketPair = {
        ...(where.marketPair as Record<string, unknown> ?? {}),
        symbol: pair,
      };
    }
    if (tag) {
      where.tags = { some: { name: tag } };
    }

    const posts = await prisma.post.findMany({
      where,
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        marketPair: true,
        tags: true,
        _count: { select: { comments: true, likes: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    const hasMore = posts.length > PAGE_SIZE;
    const slice = hasMore ? posts.slice(0, PAGE_SIZE) : posts;

    return NextResponse.json({
      posts: slice.map((p) => ({
        ...p,
        isLiked: userId ? p.likes.length > 0 : false,
        likes: undefined,
      })),
      nextCursor: hasMore ? slice[slice.length - 1].id : null,
    });
  } catch (err) {
    console.error("[posts:GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { marketPairId, direction, entryPrice, stopLoss, takeProfit, timeframe, description, chartUrl, tags } = parsed.data;

    // Verify market pair exists
    const pair = await prisma.marketPair.findUnique({ where: { symbol: marketPairId } });
    if (!pair) {
      return NextResponse.json({ error: "Invalid market pair" }, { status: 400 });
    }

    // Upsert tags
    const tagRecords = await Promise.all(
      (tags ?? []).map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    );

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        marketPairId: pair.id,
        direction,
        entryPrice,
        stopLoss,
        takeProfit,
        timeframe,
        description,
        chartUrl: chartUrl || null,
        tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        marketPair: true,
        tags: true,
        _count: { select: { comments: true, likes: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[posts:POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
