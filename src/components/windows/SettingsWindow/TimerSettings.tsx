import { AnimatePresence, motion } from "motion/react";
import { Eye, Coffee, Zap, Check, Clock } from "lucide-react";

import type { Preset } from "@/types/timer";

const PRESETS: Preset[] = [
  {
    name: "20-20-20",
    icon: Eye,
    workMs: 20 * 60 * 1000,
    breakMs: 20 * 1000,
    desc: "20 min work, 20 sec break",
  },
  {
    name: "Pomodoro",
    icon: Coffee,
    workMs: 25 * 60 * 1000,
    breakMs: 5 * 60 * 1000,
    desc: "25 min work, 5 min break",
  },
  {
    name: "Deep Work",
    icon: Zap,
    workMs: 50 * 60 * 1000,
    breakMs: 10 * 60 * 1000,
    desc: "50 min work, 10 min break",
  },
];

const PRESET_STYLE: Record<string, { bg: string; icon: string }> = {
  "20-20-20": { bg: "bg-blue-500/20", icon: "text-blue-400" },
  Pomodoro: { bg: "bg-orange-500/20", icon: "text-orange-400" },
  "Deep Work": { bg: "bg-violet-500/20", icon: "text-violet-400" },
};

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 mb-2">
      {children}
    </h2>
  );
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
  const workFill = ((workMinutes - 1) / (60 - 1)) * 100;
  const breakFill = ((breakSeconds - 5) / (300 - 5)) * 100;

  return (
    <div className="space-y-5">
      {/* ── Presets ── */}
      <section>
        <SectionHeader>Quick Presets</SectionHeader>
        <div className="bg-[#2C2C2E] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const active = selectedPreset === preset.name;
            const style = PRESET_STYLE[preset.name] ?? { bg: "bg-zinc-500/20", icon: "text-zinc-400" };
            return (
              <button
                key={preset.name}
                onClick={() => onPreset(preset)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/10 active:bg-black/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${style.icon}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-[13.5px] font-medium text-zinc-100">{preset.name}</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">{preset.desc}</p>
                  </div>
                </div>
                {active && <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Durations ── */}
      <section>
        <SectionHeader>Durations</SectionHeader>
        <div className="bg-[#2C2C2E] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
          {/* Work duration */}
          <div className="px-4 pt-4 pb-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-medium text-zinc-100">Work Duration</span>
                  <span className="text-[13.5px] font-medium text-zinc-400 ml-4 tabular-nums">
                    {workMinutes}m
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">How long you focus before a break</p>
              </div>
            </div>
            <div className="pl-[52px]">
              <input
                type="range"
                min="1"
                max="60"
                value={workMinutes}
                onChange={(e) => onWorkChange(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-blue-500 h-[3px]"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${workFill}%, #3f3f46 ${workFill}%)`,
                }}
              />
            </div>
          </div>

          {/* Break duration */}
          <div className="px-4 pt-4 pb-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-medium text-zinc-100">Break Duration</span>
                  <span className="text-[13.5px] font-medium text-zinc-400 ml-4 tabular-nums">
                    {breakSeconds}s
                  </span>
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">How long each rest lasts</p>
              </div>
            </div>
            <div className="pl-[52px]">
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={breakSeconds}
                onChange={(e) => onBreakChange(parseInt(e.target.value))}
                className="w-full cursor-pointer accent-blue-500 h-[3px]"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${breakFill}%, #3f3f46 ${breakFill}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Save ── */}
      <button
        onClick={onSave}
        className="w-full py-2.5 text-[13.5px] font-semibold rounded-xl bg-blue-500 hover:bg-blue-400 text-white transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
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
