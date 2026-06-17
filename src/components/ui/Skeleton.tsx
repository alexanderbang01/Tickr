import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-md shimmer-bg", className)}
      aria-hidden="true"
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-lg mb-4" />
      <div className="grid grid-cols-4 gap-3 mb-4 p-3 rounded-lg bg-black/20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-[#1e2130]">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}
