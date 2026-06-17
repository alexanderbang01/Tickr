import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500/60 focus:ring-red-500/30 focus:border-red-500/60",
              leftIcon && "pl-9",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60",
            "transition-colors duration-150 resize-none",
            error && "border-red-500/60",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, children, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-[#0f1117] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-sm text-zinc-100",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/60",
            "transition-colors duration-150 appearance-none cursor-pointer",
            error && "border-red-500/60",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
