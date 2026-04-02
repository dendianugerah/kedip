import { Eye, Coffee, Zap } from "lucide-react";

import type { Preset } from "@/types/timer";

export const PRESETS: Preset[] = [
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

export const PRESET_ICON_STYLE: Record<string, { bg: string; icon: string }> = {
  "20-20-20": { bg: "bg-blue-500/20", icon: "text-blue-400" },
  Pomodoro: { bg: "bg-orange-500/20", icon: "text-orange-400" },
  "Deep Work": { bg: "bg-violet-500/20", icon: "text-violet-400" },
};
