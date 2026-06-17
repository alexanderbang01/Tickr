"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { TrendingUp, Menu } from "lucide-react";
import { PriceTicker } from "./PriceTicker";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 glass border-b border-[#1e2130] flex items-center">
      {/* Logo — shrink-fit on mobile, fixed w-60 on desktop to align with sidebar */}
      <div className="flex items-center shrink-0 px-3 sm:px-4 lg:w-60 border-r border-[#1e2130] h-full gap-2.5">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0f1117] border border-[#1e2130] rounded-xl flex items-center justify-center shadow-lg group-hover:border-indigo-500/40 transition-colors shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-black text-white tracking-tight leading-none block">TICKR</span>
            <p className="hidden sm:block text-[9px] text-zinc-600 font-medium tracking-widest uppercase leading-none mt-0.5">
              Trading Community
            </p>
          </div>
        </Link>
      </div>

      {/* Price Ticker — fills remaining space */}
      <PriceTicker />

      {/* Right: only shown to guests */}
      {status !== "loading" && !session && (
        <div className="flex items-center shrink-0 pr-3 sm:pr-4 pl-2 sm:pl-3 border-l border-[#1e2130] h-full gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 hidden sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Get started
          </Link>
        </div>
      )}
    </header>
  );
}
