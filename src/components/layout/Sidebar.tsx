"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Rss, Globe, BarChart3, Plus, User, Settings,
  TrendingUp, TrendingDown, LogIn, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLivePrices, formatLivePrice } from "@/hooks/useLivePrices";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_PRICES = ["BTC/USD", "ETH/USD", "EUR/USD", "XAU/USD", "NAS100", "SOL/USD"];

function MiniPriceRow({ symbol }: { symbol: string }) {
  const prices = useLivePrices();
  const p = prices[symbol];
  if (!p) return null;
  const up = p.direction === "up";
  return (
    <div className="flex items-center justify-between py-1.5 group">
      <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
        {symbol}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "text-xs font-mono font-medium tabular-nums transition-colors duration-500",
          up ? "text-buy" : "text-sell"
        )}>
          {formatLivePrice(p.price, symbol)}
        </span>
        {up
          ? <TrendingUp className="w-3 h-3 text-buy" />
          : <TrendingDown className="w-3 h-3 text-sell" />}
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const profileHref = session ? `/profile/${session.user.username}` : "/login";

  const mainLinks = [
    { href: "/", label: "Feed", icon: Rss },
    { href: "/explore", label: "Explore", icon: Globe },
    { href: "/markets", label: "Markets", icon: BarChart3 },
    { href: profileHref, label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-56px)] w-60 flex flex-col",
          "bg-[#080a10] border-r border-[#1e2130]",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {/* Main nav */}
          {mainLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-white/8 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}

          {/* New Trade CTA */}
          <Link
            href="/create"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1",
              "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300",
              pathname === "/create" && "bg-indigo-500/10"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            New Trade
            <span className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          </Link>

          {/* Live Prices */}
          <div className="pt-4 mt-3 border-t border-[#1e2130]">
            <p className="px-3 text-[10px] font-semibold text-zinc-700 uppercase tracking-widest mb-2">
              Live Prices
            </p>
            <div className="px-3">
              {SIDEBAR_PRICES.map((sym) => (
                <MiniPriceRow key={sym} symbol={sym} />
              ))}
            </div>
          </div>

        </div>

        {/* Bottom: sign out or sign in */}
        <div className="shrink-0 p-3 border-t border-[#1e2130]">
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
