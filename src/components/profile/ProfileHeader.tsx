"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CalendarDays, TrendingUp, TrendingDown, Heart, BarChart2, Edit3 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatTimeAgo } from "@/lib/utils";
import type { UserPublic } from "@/types";

interface ProfileHeaderProps {
  user: UserPublic & {
    _count: { posts: number; likes: number };
    posts?: Array<{ direction: string }>;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.username === user.username;

  const buyCount = user.posts?.filter((p) => p.direction === "BUY").length ?? 0;
  const sellCount = user.posts?.filter((p) => p.direction === "SELL").length ?? 0;
  const total = buyCount + sellCount;
  const buyPct = total > 0 ? Math.round((buyCount / total) * 100) : 0;

  // Derive a gradient color from username for the banner
  const colors = [
    "from-indigo-900/40 to-violet-900/20",
    "from-blue-900/40 to-cyan-900/20",
    "from-emerald-900/40 to-teal-900/20",
    "from-rose-900/40 to-pink-900/20",
    "from-amber-900/40 to-orange-900/20",
  ];
  const gradientIndex =
    user.username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const gradient = colors[gradientIndex];

  return (
    <div className="mb-6 animate-fade-in">
      {/* Banner */}
      <div className={cn("relative h-28 rounded-2xl bg-gradient-to-br border border-[#1e2130] overflow-hidden", gradient)}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }} />
      </div>

      {/* Avatar + name row */}
      <div className="px-4 sm:px-5 -mt-10 flex items-end justify-between gap-4">
        <div className="relative">
          <div className="ring-4 ring-[#080a10] rounded-full">
            <Avatar user={user} size="xl" />
          </div>
        </div>
        {isOwner && (
          <Link
            href="/settings"
            className="mb-1 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 border border-[#1e2130] rounded-xl hover:border-[#2d3148] hover:text-white transition-colors bg-[#0f1117]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit profile
          </Link>
        )}
      </div>

      {/* Name + bio */}
      <div className="px-4 sm:px-5 mt-3">
        <h1 className="text-lg font-bold text-white leading-tight">{user.name || user.username}</h1>
        <p className="text-sm text-zinc-500">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-md">{user.bio}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <CalendarDays className="w-3.5 h-3.5" />
            Joined {formatTimeAgo(user.createdAt)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-5 mt-5">
        <div className="card p-3.5 text-center">
          <p className="text-xl font-bold text-white font-mono">{user._count.posts}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
            <BarChart2 className="w-3 h-3" /> Setups
          </p>
        </div>
        <div className="card p-3.5 text-center">
          <p className="text-xl font-bold text-white font-mono">{user._count.likes}</p>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3" /> Likes
          </p>
        </div>
        <div className="card p-3.5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-buy font-mono">{buyCount}L</span>
            <span className="text-zinc-700 text-xs">/</span>
            <span className="text-xs font-bold text-sell font-mono">{sellCount}S</span>
          </div>
          {total > 0 ? (
            <div className="h-1.5 w-full rounded-full bg-sell/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-buy transition-all"
                style={{ width: `${buyPct}%` }}
              />
            </div>
          ) : (
            <div className="h-1.5 w-full rounded-full bg-zinc-900" />
          )}
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" /> Direction
          </p>
        </div>
      </div>
    </div>
  );
}
