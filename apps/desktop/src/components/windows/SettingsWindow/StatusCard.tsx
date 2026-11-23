import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";
import { Switch } from "@/components/ui/switch";

interface Props {
  timerState: TimerState;
  onTogglePause: () => void;
  onBreakNow: () => void;
  onReset: () => void;
}

export function StatusCard({ timerState, onTogglePause, onBreakNow, onReset }: Props) {
  const total = timerState.phase_duration_ms;
  const elapsed = total - timerState.time_remaining_ms;
  const progress = Math.max(0, Math.min((elapsed / total) * 100, 100));
  const onBreak = timerState.phase === "Break";
  const isPaused = timerState.is_paused;
  const phaseLabel = onBreak ? "On a break" : isPaused ? "Reminders paused" : "Focusing";

  return (
    <div className="space-y-5">
      {/* Timer hero */}
      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
          Your next break
        </p>
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p
            className="text-[11px] font-medium text-teal-200/80 uppercase tracking-wider"
            role="status"
          >
            {phaseLabel}
          </p>
          <p className="text-[52px] font-light text-white tabular-nums tracking-tight leading-none mt-2">
            {formatTime(timerState.time_remaining_ms)}
          </p>
          <p className="text-[12px] text-white/30 mt-2">
            {onBreak
              ? "remaining in this break"
              : isPaused
                ? "until a break once you resume"
                : "until your eyes get a rest"}
          </p>
          <div className="mt-4 h-[2px] bg-white/[0.06] rounded-full overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]">
            <div className="h-full bg-teal-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
          Controls
        </p>
        <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.06]">
            <span id="pause-reminders" className="text-[13px] text-white/75">
              Pause reminders
            </span>
            <Switch
              checked={isPaused}
              disabled={onBreak}
              aria-labelledby="pause-reminders"
              onCheckedChange={() => onTogglePause()}
              className="data-unchecked:bg-zinc-600 data-unchecked:border-transparent data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer transition-all"
            />
          </div>

          <button
            onClick={onBreak ? onReset : onBreakNow}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.06] text-left hover:bg-white/[0.09] transition-colors cursor-pointer scale-press"
          >
            <span className="text-[13px] text-white/75">
              {onBreak ? "End break early" : "Take a break now"}
            </span>
            <span className="text-[13px] text-white/30">→</span>
          </button>

          {!onBreak && (
            <button
              onClick={onReset}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.06] text-left hover:bg-white/[0.09] transition-colors cursor-pointer scale-press"
            >
              <span className="text-[13px] text-white/75">Restart work timer</span>
              <span className="text-[13px] text-white/30">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
