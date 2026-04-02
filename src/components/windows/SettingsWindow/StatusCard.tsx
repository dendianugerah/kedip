import { motion } from "motion/react";
import { Play, Pause, Coffee, RotateCcw } from "lucide-react";

import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";

const PHASE_LABEL: Record<string, string> = {
  Working: "Focusing",
  Break: "Resting",
};

interface Props {
  timerState: TimerState;
  isPaused: boolean;
  onTogglePause: () => void;
  onBreakNow: () => void;
  onReset: () => void;
}

export function StatusCard({ timerState, isPaused, onTogglePause, onBreakNow, onReset }: Props) {
  const total =
    timerState.phase === "Working" ? timerState.work_duration_ms : timerState.break_duration_ms;
  const elapsed = total - timerState.time_remaining_ms;
  const progress = Math.max(0, Math.min((elapsed / total) * 100, 100));

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">
          {isPaused ? "Paused" : (PHASE_LABEL[timerState.phase] ?? timerState.phase)}
        </p>
        <p className="text-7xl font-extralight text-white tabular-nums tracking-tight leading-none">
          {formatTime(timerState.time_remaining_ms)}
        </p>
        <p className="text-[11px] text-white/25 mt-4">
          {timerState.phase === "Working" ? "until next break" : "remaining"}
        </p>
      </div>

      <div className="h-px bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/40 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onBreakNow}
          className="flex flex-col items-center gap-2 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-95 transition-all cursor-pointer"
        >
          <Coffee className="w-4 h-4 text-white/40" />
          <span className="text-[10px] font-medium text-white/35">Break now</span>
        </button>
        <button
          onClick={onTogglePause}
          className="flex flex-col items-center gap-2 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-95 transition-all cursor-pointer"
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-white/40" />
          ) : (
            <Pause className="w-4 h-4 text-white/40" />
          )}
          <span className="text-[10px] font-medium text-white/35">
            {isPaused ? "Resume" : "Pause"}
          </span>
        </button>
        <button
          onClick={onReset}
          className="flex flex-col items-center gap-2 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-white/40" />
          <span className="text-[10px] font-medium text-white/35">Reset</span>
        </button>
      </div>
    </div>
  );
}
