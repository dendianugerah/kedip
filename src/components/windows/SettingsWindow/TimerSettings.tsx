import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Coffee } from "lucide-react";

import type { Preset } from "@/types/timer";
import { PRESETS, PRESET_ICON_STYLE } from "@/constants/presets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const CARD_BASE =
  "bg-[#2C2C2E] border border-white/[0.06] rounded-xl shadow-none ring-0 gap-0 py-0 overflow-hidden";

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
      <section>
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 mb-2">
          Quick Presets
        </h2>
        <Card className={`${CARD_BASE} divide-y divide-white/[0.06]`}>
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const active = selectedPreset === preset.name;
            const style = PRESET_ICON_STYLE[preset.name] ?? {
              bg: "bg-zinc-500/20",
              icon: "text-zinc-400",
            };
            return (
              <Button
                key={preset.name}
                variant="ghost"
                onClick={() => onPreset(preset)}
                className="w-full h-auto flex items-center justify-between px-4 py-3.5 rounded-none hover:bg-black/10 active:bg-black/20"
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
              </Button>
            );
          })}
        </Card>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 mb-2">
          Durations
        </h2>
        <Card className={`${CARD_BASE} divide-y divide-white/[0.06]`}>
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
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  How long you focus before a break
                </p>
              </div>
            </div>
            <div className="pl-[52px]">
              <Slider
                min={1}
                max={60}
                value={[workMinutes]}
                onValueChange={(values) => onWorkChange(Array.isArray(values) ? values[0] : values)}
              />
            </div>
          </div>

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
              <Slider
                min={5}
                max={300}
                step={5}
                value={[breakSeconds]}
                onValueChange={(values) =>
                  onBreakChange(Array.isArray(values) ? values[0] : values)
                }
              />
            </div>
          </div>
        </Card>
      </section>

      <Button
        variant="primary"
        onClick={onSave}
        className="w-full py-2.5 text-[13.5px] font-semibold rounded-xl overflow-hidden"
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
      </Button>
    </div>
  );
}
