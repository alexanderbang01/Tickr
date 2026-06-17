import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
        <TrendingUp className="w-8 h-8 text-zinc-700" />
      </div>
      <h1 className="text-5xl font-black text-white mb-3">404</h1>
      <p className="text-lg font-medium text-zinc-400 mb-2">Page not found</p>
      <p className="text-sm text-zinc-600 max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Back to feed
      </Link>
    </div>
  );
}
