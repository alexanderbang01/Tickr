import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Feed } from "@/components/feed/Feed";
import { FilterBar } from "@/components/feed/FilterBar";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import type { AssetType, Direction } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Explore" };

const PAGE_SIZE = 10;

interface ExplorePageProps {
  searchParams: {
    assetType?: string;
    direction?: string;
    pair?: string;
    tag?: string;
  };
}

async function getPosts(params: ExplorePageProps["searchParams"]) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const where: Record<string, unknown> = {};

  if (params.assetType && params.assetType !== "ALL") {
    where.marketPair = { assetType: params.assetType as AssetType };
  }
  if (params.direction && params.direction !== "ALL") {
    where.direction = params.direction as Direction;
  }
  if (params.pair) {
    where.marketPair = { ...(where.marketPair as object ?? {}), symbol: params.pair };
  }
  if (params.tag) {
    where.tags = { some: { name: params.tag } };
  }

  const posts = await prisma.post.findMany({
    where,
    take: PAGE_SIZE + 1,
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
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
  return {
    posts: slice.map((p) => ({ ...p, isLiked: userId ? p.likes.length > 0 : false, likes: undefined })),
    nextCursor: hasMore ? slice[slice.length - 1].id : null,
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { posts, nextCursor } = await getPosts(searchParams);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Suspense>
          <FilterBar popout />
        </Suspense>
      </div>
      <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}</div>}>
        <Feed initialPosts={posts as any} initialCursor={nextCursor} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
