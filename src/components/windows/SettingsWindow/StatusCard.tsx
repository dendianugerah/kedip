import { motion } from "motion/react";
import { Play, Pause, Coffee, RotateCcw, Clock, ChevronRight } from "lucide-react";

import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CARD_BASE =
  "bg-[#2C2C2E] border border-white/[0.06] rounded-xl shadow-none ring-0 gap-0 py-0";

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
      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 mb-2">
          Active Session
        </h2>
        <Card className={`${CARD_BASE} p-4`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {phaseLabel}
              </p>
              <p className="text-[42px] font-light text-zinc-100 tabular-nums tracking-tight leading-none mt-2">
                {formatTime(timerState.time_remaining_ms)}
              </p>
              <p className="text-[12px] text-zinc-500 mt-2">
                {timerState.phase === "Working" ? "until next break" : "remaining"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="mt-4 h-[3px] bg-zinc-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 mb-2">
          Controls
        </h2>
        <Card className={`${CARD_BASE} overflow-hidden divide-y divide-white/[0.06]`}>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                {isPaused ? (
                  <Play className="w-5 h-5 text-blue-400" />
                ) : (
                  <Pause className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-[13.5px] font-medium text-zinc-100">
                  {isPaused ? "Resume Session" : "Pause Session"}
                </p>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {isPaused ? "Continue where you left off" : "Temporarily stop the timer"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPaused}
              onCheckedChange={() => onTogglePause()}
              className="data-unchecked:bg-zinc-600 data-unchecked:border-transparent data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </div>

          <Button
            variant="ghost"
            onClick={onBreakNow}
            className="w-full h-auto flex items-center justify-between px-4 py-3.5 rounded-none hover:bg-black/10 active:bg-black/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-[13.5px] font-medium text-zinc-100">Start Break Now</p>
                <p className="text-[12px] text-zinc-500 mt-0.5">Take your rest immediately</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          </Button>

          <Button
            variant="ghost"
            onClick={onReset}
            className="w-full h-auto flex items-center justify-between px-4 py-3.5 rounded-none hover:bg-black/10 active:bg-black/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-left">
                <p className="text-[13.5px] font-medium text-zinc-100">Reset Timer</p>
                <p className="text-[12px] text-zinc-500 mt-0.5">Restart the work countdown</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
