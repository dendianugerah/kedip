import { motion } from "motion/react";
import { Eye } from "lucide-react";

import { formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface Props {
  timeRemaining: number;
  busy: boolean;
  onStartNow: () => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
}

export function NotificationBanner({ timeRemaining, busy, onStartNow, onSnooze, onSkip }: Props) {
  const isUrgent = timeRemaining <= 10_000;

  return (
    <motion.div
      className="fixed inset-0 rounded-2xl bg-zinc-900 flex flex-col gap-2.5 px-4 pt-3.5 pb-3.5 select-none font-sans overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      style={{
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-teal-200" />
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
          Your break starts soon
        </p>
        <p className="text-[11.5px] text-white/65 mt-0.5 leading-snug">
          Wrap up what you’re doing, or give yourself more time.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <Button
          variant="white"
          onClick={onStartNow}
          disabled={busy}
          className="flex-1 py-2 text-[12px] font-semibold h-auto rounded-xl scale-press"
        >
          Break now
        </Button>
        <Button
          variant="ghost"
          onClick={() => onSnooze(5)}
          disabled={busy}
          className="px-3 py-2 text-[12px] font-medium h-auto rounded-xl bg-white/10 hover:bg-white/20 text-white/80 scale-press"
        >
          Snooze 5 min
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          disabled={busy}
          className="px-3 py-2 text-[12px] font-medium h-auto rounded-xl text-white/65 hover:text-white hover:bg-transparent scale-press"
        >
          Skip
        </Button>
      </div>
    </motion.div>
  );
}
