import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import type { Preset } from "@/types/timer";
import { PRESETS } from "@/constants/presets";
import { Slider } from "@/components/ui/slider";

interface Props {
  workMinutes: number;
  breakSeconds: number;
  selectedPreset?: string;
  saveState: "idle" | "saving" | "saved" | "error";
  dirty: boolean;
  onWorkChange: (v: number) => void;
  onBreakChange: (v: number) => void;
  onPreset: (p: Preset) => void;
  onSave: () => void;
}

export function TimerSettings({
  workMinutes,
  breakSeconds,
  selectedPreset,
  saveState,
  dirty,
  onWorkChange,
  onBreakChange,
  onPreset,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <h1 className="text-lg font-semibold">Break schedule</h1>
        <p className="text-sm text-white/60 mt-1 mb-3">
          Choose a rhythm or customize how often you want to look away.
        </p>
        <div className="flex gap-2">
          {PRESETS.map((preset) => {
            const active = selectedPreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => onPreset(preset)}
                aria-pressed={active}
                disabled={saveState === "saving"}
                className={`flex-1 py-2 rounded-[9px] text-[12px] font-medium transition-colors cursor-pointer scale-press ${
                  active
                    ? "bg-white text-black shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
                    : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.10] hover:text-zinc-200"
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Durations */}
      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
          Duration
        </p>
        <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          <div className="px-4 py-4 bg-white/[0.06]">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] text-white/75">Work</span>
              <span className="text-[13px] text-white/35 tabular-nums">{workMinutes}m</span>
            </div>
            <Slider
              aria-label="Work duration in minutes"
              disabled={saveState === "saving"}
              min={1}
              max={60}
              value={[workMinutes]}
              onValueChange={(values) => onWorkChange(Array.isArray(values) ? values[0] : values)}
            />
          </div>

          <div className="px-4 py-4 bg-white/[0.06]">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] text-white/75">Break</span>
              <span className="text-[13px] text-white/35 tabular-nums">{breakSeconds}s</span>
            </div>
            <Slider
              aria-label="Break duration in seconds"
              disabled={saveState === "saving"}
              min={5}
              max={600}
              step={5}
              value={[breakSeconds]}
              onValueChange={(values) => onBreakChange(Array.isArray(values) ? values[0] : values)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={!dirty || saveState === "saving" || saveState === "saved"}
        className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-teal-200 hover:bg-teal-100 text-zinc-950 transition-colors overflow-hidden cursor-pointer scale-press disabled:bg-white/10 disabled:text-white/60 disabled:cursor-default"
      >
        <AnimatePresence mode="wait" initial={false}>
          {saveState === "saved" ? (
            <motion.span
              key="saved"
              className="flex items-center justify-center gap-1.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-4 h-4" />
              Saved
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {saveState === "saving" ? "Saving…" : "Save schedule"}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {saveState === "saved" && (
        <p role="status" className="sr-only">
          Schedule saved.
        </p>
      )}
      {saveState === "error" && (
        <p role="alert" className="text-sm text-red-300">
          Couldn’t save your schedule. Try again.
        </p>
      )}
    </div>
  );
}
