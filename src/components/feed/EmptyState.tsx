import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showCreate?: boolean;
}

export function EmptyState({
  title = "No trades found",
  description = "Be the first to share a trade setup.",
  showCreate = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-5">
        <TrendingUp className="w-7 h-7 text-zinc-600" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {showCreate && (
        <Link href="/create">
          <Button variant="primary" size="sm">
            Post a trade setup
          </Button>
        </Link>
      )}
    </div>
  );
}
