import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye } from "lucide-react";

import { formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_HEADLINES, pickRandom } from "@/constants/copy";

interface Props {
  timeRemaining: number;
  visible: boolean;
  onStartNow: () => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
}

function getBodyCopy(seconds: number): string {
  if (seconds <= 10) return "Time to rest — put the screen down.";
  if (seconds <= 20) return "Almost there, wrap up your thought.";
  return "Finish that thought before your break begins.";
}

export function NotificationBanner({
  timeRemaining,
  visible,
  onStartNow,
  onSnooze,
  onSkip,
}: Props) {
  const seconds = Math.floor(timeRemaining / 1000);
  const isUrgent = seconds <= 10;
  const headline = useMemo(() => pickRandom(NOTIFICATION_HEADLINES), []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 rounded-2xl bg-neutral-900/95 backdrop-blur-xl shadow-2xl flex flex-col gap-2.5 px-4 pt-3.5 pb-3.5 select-none font-sans overflow-hidden"
          initial={{ opacity: 0, y: -140 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.16, ease: "easeIn" } }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Eye
                className={`w-3.5 h-3.5 ${isUrgent ? "text-amber-400 animate-pulse" : "text-white/30"}`}
              />
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                Kedip
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold tabular-nums transition-colors duration-300 ${
                isUrgent ? "text-amber-400" : "text-white/40"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-white leading-tight tracking-tight">
              {headline}
            </p>
            <p className="text-[11.5px] text-white/45 mt-0.5 leading-snug">
              {getBodyCopy(seconds)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <Button
              variant="white"
              onClick={onStartNow}
              className="flex-1 py-2 text-[12px] font-semibold h-auto rounded-xl"
            >
              Break now
            </Button>
            <Button
              variant="ghost"
              onClick={() => onSnooze(5)}
              className="px-4 py-2 text-[12px] font-medium h-auto rounded-xl bg-white/10 hover:bg-white/20 text-white/75 hover:text-white/75"
            >
              +5m
            </Button>
            <Button
              variant="ghost"
              onClick={onSkip}
              className="px-3 py-2 text-[12px] font-medium h-auto rounded-xl text-white/30 hover:text-white/60 hover:bg-transparent"
            >
              Skip
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
