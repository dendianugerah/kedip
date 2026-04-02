import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#2A2A28] text-[#F9F8F4] hover:bg-[#1A1A18]",
        secondary: "bg-[#EAE6DF] text-[#2A2A28] hover:bg-[#DFDBD0]",
        outline: "border border-[#EAE6DF] text-[#7A7974] hover:bg-white/50 hover:text-[#2A2A28]",
        ghost: "text-[#A3A19C] hover:text-[#2A2A28] hover:bg-[#EAE6DF]",
      },
      size: {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-sm rounded-full",
        lg: "px-6 py-3 text-base rounded-full",
        icon: "p-2 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
