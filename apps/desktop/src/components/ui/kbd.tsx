import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KbdProps {
  children: ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center px-1.5 h-[20px] min-w-[20px]",
        "text-[10px] font-medium font-mono",
        "bg-white/[0.08] border border-white/[0.10] rounded-md",
        "text-white/45 leading-none",
        "shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}
