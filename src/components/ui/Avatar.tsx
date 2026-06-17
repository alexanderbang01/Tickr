import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  user: {
    name?: string | null;
    username: string;
    avatarUrl?: string | null;
    image?: string | null;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: { container: "w-6 h-6", text: "text-xs" },
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
  xl: { container: "w-16 h-16", text: "text-xl" },
};

const colors = [
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
];

function getGradient(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ user, size = "md", className }: AvatarProps) {
  const { container, text } = sizes[size];
  const src = user.avatarUrl || user.image;
  const initials = (user.name || user.username)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradient = getGradient(user.username);

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 overflow-hidden ring-1 ring-white/5",
        container,
        className
      )}
    >
      {src ? (
        <Image src={src} alt={user.name || user.username} fill className="object-cover" />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br font-bold text-white select-none",
            gradient,
            text
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
