import { AnimatePresence, motion } from "motion/react";
import { Eye } from "lucide-react";

import { formatTime } from "@/lib/format";

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="w-full h-full p-2"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.18, ease: "easeIn" } }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          <div className="w-full h-full rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col justify-between px-4 py-3 select-none font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye
                  className={`w-3.5 h-3.5 ${isUrgent ? "text-amber-400 animate-pulse" : "text-white/40"}`}
                />
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                  Kedip
                </span>
              </div>
              <span
                className={`text-xs font-semibold tabular-nums transition-colors duration-300 ${
                  isUrgent ? "text-amber-400" : "text-white/70"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-white leading-snug">Wrap it up!</p>
              <p className="text-[11px] text-white/50 mt-0.5 leading-snug">
                {getBodyCopy(seconds)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onStartNow}
                className="flex-1 py-1 text-[11px] font-semibold bg-white/90 hover:bg-white text-black rounded-lg transition-colors"
              >
                Break now
              </button>
              <button
                onClick={() => onSnooze(5)}
                className="px-3 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-colors"
              >
                +5m
              </button>
              <button
                onClick={onSkip}
                className="px-3 py-1 text-[11px] font-medium text-white/35 hover:text-white/60 rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
