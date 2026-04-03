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
        "inline-flex items-center justify-center px-1.5 h-[18px] min-w-[18px]",
        "text-[10px] font-medium font-mono",
        "bg-white/[0.07] border border-white/[0.12] rounded",
        "text-white/40 leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}
