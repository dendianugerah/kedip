import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import type { Preset } from "@/types/timer";
import { PRESETS } from "@/constants/presets";
import { Slider } from "@/components/ui/slider";

interface Props {
  workMinutes: number;
  breakSeconds: number;
  selectedPreset: string;
  saved: boolean;
  onWorkChange: (v: number) => void;
  onBreakChange: (v: number) => void;
  onPreset: (p: Preset) => void;
  onSave: () => void;
}

export function TimerSettings({
  workMinutes,
  breakSeconds,
  selectedPreset,
  saved,
  onWorkChange,
  onBreakChange,
  onPreset,
  onSave,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.22em] mb-3">
          Preset
        </p>
        <div className="flex gap-2">
          {PRESETS.map((preset) => {
            const active = selectedPreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => onPreset(preset)}
                className={`flex-1 py-2 rounded-[9px] text-[12px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-white text-black"
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
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.22em] mb-3">
          Duration
        </p>
        <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
          <div className="px-4 py-4 bg-[#2C2C2E]">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] text-zinc-300">Work</span>
              <span className="text-[13px] text-zinc-500 tabular-nums">{workMinutes}m</span>
            </div>
            <Slider
              min={1}
              max={60}
              value={[workMinutes]}
              onValueChange={(values) => onWorkChange(Array.isArray(values) ? values[0] : values)}
            />
          </div>

          <div className="px-4 py-4 bg-[#2C2C2E]">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] text-zinc-300">Break</span>
              <span className="text-[13px] text-zinc-500 tabular-nums">{breakSeconds}s</span>
            </div>
            <Slider
              min={5}
              max={300}
              step={5}
              value={[breakSeconds]}
              onValueChange={(values) => onBreakChange(Array.isArray(values) ? values[0] : values)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-colors overflow-hidden cursor-pointer"
      >
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
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
              Save Changes
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
