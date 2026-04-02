import { AnimatePresence, motion } from "motion/react";
import { Eye, Coffee, Zap, Check } from "lucide-react";

import type { Preset } from "@/types/timer";

const PRESETS: Preset[] = [
  { name: "20-20-20", icon: Eye, workMs: 20 * 60 * 1000, breakMs: 20 * 1000, desc: "Eye care" },
  {
    name: "Pomodoro",
    icon: Coffee,
    workMs: 25 * 60 * 1000,
    breakMs: 5 * 60 * 1000,
    desc: "Focus",
  },
  {
    name: "Deep Work",
    icon: Zap,
    workMs: 50 * 60 * 1000,
    breakMs: 10 * 60 * 1000,
    desc: "Deep focus",
  },
];

const SLIDER_CLASS =
  "w-full h-1 appearance-none rounded-full cursor-pointer bg-white/10 " +
  "[&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:w-3.5 " +
  "[&::-webkit-slider-thumb]:h-3.5 " +
  "[&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-white " +
  "[&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-webkit-slider-thumb]:transition-transform " +
  "[&::-webkit-slider-thumb]:hover:scale-110";

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
    <div className="space-y-8 pt-2">
      <div>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">
          Quick Presets
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const active = selectedPreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => onPreset(preset)}
                className={`py-3.5 px-2 rounded-xl text-center transition-all active:scale-95 cursor-pointer ${
                  active ? "bg-white" : "bg-white/[0.06] hover:bg-white/[0.10]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mx-auto mb-2 ${active ? "text-black/50" : "text-white/30"}`}
                />
                <p
                  className={`text-[11px] font-semibold leading-tight ${active ? "text-black" : "text-white/70"}`}
                >
                  {preset.name}
                </p>
                <p className={`text-[10px] mt-0.5 ${active ? "text-black/40" : "text-white/25"}`}>
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-medium text-white">Work Duration</p>
              <p className="text-[11px] text-white/30 mt-0.5">How long before a break</p>
            </div>
            <span className="text-2xl font-light text-white tabular-nums">{workMinutes}m</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            value={workMinutes}
            onChange={(e) => onWorkChange(parseInt(e.target.value))}
            className={SLIDER_CLASS}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-medium text-white">Break Duration</p>
              <p className="text-[11px] text-white/30 mt-0.5">How long each break lasts</p>
            </div>
            <span className="text-2xl font-light text-white tabular-nums">{breakSeconds}s</span>
          </div>
          <input
            type="range"
            min="5"
            max="300"
            step="5"
            value={breakSeconds}
            onChange={(e) => onBreakChange(parseInt(e.target.value))}
            className={SLIDER_CLASS}
          />
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer overflow-hidden relative bg-white hover:bg-white/90 text-black"
      >
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
            <motion.span
              key="saved"
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-4 h-4" />
              Saved!
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
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
