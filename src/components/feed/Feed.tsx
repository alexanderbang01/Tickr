"use client";

import { useState, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feed/EmptyState";
import type { PostWithDetails } from "@/types";

interface FeedProps {
  initialPosts: PostWithDetails[];
  initialCursor: string | null;
  searchParams: Record<string, string | undefined>;
}

export function Feed({ initialPosts, initialCursor, searchParams }: FeedProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "200px" });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("cursor", cursor);
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      // silently fail — user can scroll up and retry
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, searchParams]);

  useEffect(() => {
    if (inView) loadMore();
  }, [inView, loadMore]);

  // Reset when searchParams change
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
    setHasMore(!!initialCursor);
  }, [initialPosts, initialCursor]);

  if (posts.length === 0 && !loading) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeChange={(id, liked, count) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === id
                  ? { ...p, isLiked: liked, _count: { ...p._count, likes: count } }
                  : p
              )
            );
          }}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={ref} className="space-y-4">
          {loading && (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="flex items-center gap-3 py-6">
          <div className="flex-1 h-px bg-zinc-900" />
          <p className="text-xs text-zinc-700 font-medium">All trades loaded</p>
          <div className="flex-1 h-px bg-zinc-900" />
        </div>
      )}
    </div>
  );
}
