import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  displayValue?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, icon, displayValue, ...props }, ref) => {
    return (
      <div className="bg-white rounded-xl p-4 border border-[#EAE6DF]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#7A7974]">{icon}</span>}
            {label && <span className="text-sm font-medium text-[#2A2A28]">{label}</span>}
          </div>
          {displayValue && (
            <span className="text-lg font-medium text-[#2A2A28] tabular-nums">{displayValue}</span>
          )}
        </div>
        <input
          type="range"
          ref={ref}
          className={cn(
            "w-full h-1 bg-[#EAE6DF] rounded-full appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-[#2A2A28]",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
