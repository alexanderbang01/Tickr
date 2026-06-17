import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "buy" | "sell";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/10",
  secondary:
    "bg-surface-500 hover:bg-surface-400 text-zinc-200 border border-[#2d3148] hover:border-[#3d4260]",
  ghost:
    "bg-transparent hover:bg-surface-500 text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-[#2d3148]",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40",
  buy: "bg-buy-dim hover:bg-buy/20 text-buy border border-buy-border hover:border-buy/40 font-semibold",
  sell: "bg-sell-dim hover:bg-sell/20 text-sell border border-sell-border hover:border-sell/40 font-semibold",
};

const sizes = {
  xs: "h-6 px-2.5 text-xs rounded-md gap-1",
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-6 text-base rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.97]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
