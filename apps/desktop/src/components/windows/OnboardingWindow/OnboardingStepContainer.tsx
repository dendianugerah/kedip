import { type ReactNode } from "react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export interface OnboardingStepContainerProps {
  children: ReactNode;
  className?: string;
  onBack?: () => void;
  info?: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
}

const DEFAULT_CLASSNAME = "flex-1 flex flex-col px-10 pt-4 pb-8";

export function OnboardingStepContainer({
  children,
  className = DEFAULT_CLASSNAME,
  onBack,
  info,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: OnboardingStepContainerProps) {
  const hasFooter = onBack != null && onPrimary != null;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {hasFooter ? (
        <>
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>

          <div className="flex-shrink-0 border-t border-white/[0.06] pt-4 mt-6 flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-[12px] text-white/25 hover:text-white/50 hover:bg-transparent px-3 py-2 h-auto flex-shrink-0"
            >
              ← Back
            </Button>

            <div className="flex-1 flex justify-center">
              {info != null && <span className="text-[12px] text-white/25">{info}</span>}
            </div>

            <Button
              variant="white"
              onClick={onPrimary}
              disabled={primaryDisabled}
              className="px-6 py-2.5 h-auto text-[13px] font-semibold flex-shrink-0"
            >
              {primaryLabel}
            </Button>
          </div>
        </>
      ) : (
        children
      )}
    </motion.div>
  );
}
