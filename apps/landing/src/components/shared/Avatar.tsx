import { initials } from "./formatters";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      aria-hidden
      className={`flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white ${sizes[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 38%))`,
      }}
    >
      {initials(name)}
    </div>
  );
}
