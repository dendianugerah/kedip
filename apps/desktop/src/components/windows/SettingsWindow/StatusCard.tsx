import { motion } from "motion/react";

import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";
import { Switch } from "@/components/ui/switch";

const PHASE_LABEL: Record<string, string> = {
  Working: "Focusing",
  Break: "On a break",
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
  const phaseLabel = isPaused ? "Paused" : (PHASE_LABEL[timerState.phase] ?? timerState.phase);

  return (
    <div className="space-y-5">
      {/* Timer hero */}
      <div>
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.22em] mb-3">
          Active
        </p>
        <div className="bg-white/[0.06] border border-white/[0.06] rounded-xl p-5">
          <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider">
            {phaseLabel}
          </p>
          <p className="text-[52px] font-light text-white tabular-nums tracking-tight leading-none mt-2">
            {formatTime(timerState.time_remaining_ms)}
          </p>
          <p className="text-[12px] text-white/20 mt-2">
            {timerState.phase === "Working" ? "until next break" : "remaining in break"}
          </p>
          <div className="mt-4 h-[2px] bg-white/[0.07] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div>
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.22em] mb-3">
          Controls
        </p>
        <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
          <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.06]">
            <span className="text-[13px] text-white/75">{isPaused ? "Resume" : "Pause"}</span>
            <Switch
              checked={isPaused}
              onCheckedChange={() => onTogglePause()}
              className="data-unchecked:bg-zinc-600 data-unchecked:border-transparent data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </div>

          <button
            onClick={onBreakNow}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.06] text-left hover:bg-white/[0.09] transition-colors cursor-pointer"
          >
            <span className="text-[13px] text-white/75">Take a Break Now</span>
            <span className="text-[13px] text-white/20">→</span>
          </button>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.06] text-left hover:bg-white/[0.09] transition-colors cursor-pointer"
          >
            <span className="text-[13px] text-white/75">Reset Timer</span>
            <span className="text-[13px] text-white/20">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
