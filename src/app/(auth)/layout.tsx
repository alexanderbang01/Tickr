import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="flex items-center justify-center pt-10 pb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#0f1117] border border-[#1e2130] rounded-xl flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Tickr</span>
        </Link>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
