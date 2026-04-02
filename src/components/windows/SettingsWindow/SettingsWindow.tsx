import { useEffect, useState } from "react";
import { type ElementType } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Timer, Info } from "lucide-react";

import type { TimerState, Preset } from "@/types/timer";
import { StatusCard } from "./StatusCard";
import { TimerSettings } from "./TimerSettings";

type Page = "overview" | "schedule" | "about";

interface NavItem {
  id: Page;
  label: string;
  icon: ElementType;
  color: string;
}

interface NavGroup {
  group: string | null;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: null,
    items: [{ id: "overview", label: "Overview", icon: Clock, color: "bg-blue-500" }],
  },
  {
    group: "Timer",
    items: [{ id: "schedule", label: "Schedule", icon: Timer, color: "bg-violet-500" }],
  },
  {
    group: "Kedip",
    items: [{ id: "about", label: "About", icon: Info, color: "bg-amber-500" }],
  },
];

const PAGE_TITLE: Record<Page, string> = {
  overview: "Overview",
  schedule: "Schedule",
  about: "About",
};

export function SettingsWindow() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const [page, setPage] = useState<Page>("overview");
  const [selectedPreset, setSelectedPreset] = useState("20-20-20");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    invoke<TimerState>("get_timer_state").then((state) => {
      setTimerState(state);
      setWorkMinutes(Math.floor(state.work_duration_ms / 60000));
      setBreakSeconds(Math.floor(state.break_duration_ms / 1000));
    });

    const unlisten = listen<TimerState>("timer-update", (event) => {
      setTimerState(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleSave = () => {
    invoke("update_settings", {
      workDurationMs: workMinutes * 60 * 1000,
      breakDurationMs: breakSeconds * 1000,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreset = (preset: Preset) => {
    setSelectedPreset(preset.name);
    setWorkMinutes(Math.floor(preset.workMs / 60000));
    setBreakSeconds(Math.floor(preset.breakMs / 1000));
    invoke("update_settings", {
      workDurationMs: preset.workMs,
      breakDurationMs: preset.breakMs,
    });
  };

  const handleTogglePause = async () => {
    const paused = await invoke<boolean>("toggle_pause");
    setIsPaused(paused);
  };

  return (
    <div className="w-full h-full bg-[#1C1C1E] flex font-sans select-none overflow-hidden text-zinc-200">
      {/* ── Sidebar ── */}
      <aside className="w-[200px] flex-shrink-0 border-r border-white/[0.07] flex flex-col">
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {group.group && (
                <p className="px-2 pb-1 text-[10.5px] font-semibold text-zinc-500 uppercase tracking-widest">
                  {group.group}
                </p>
              )}
              {group.items.map(({ id, label, icon: Icon, color }) => {
                const active = page === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPage(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] transition-colors cursor-pointer ${
                      active
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className={`w-[22px] h-[22px] rounded-[5px] flex items-center justify-center flex-shrink-0 ${active ? "bg-white/20" : color}`}
                    >
                      <Icon className="w-[13px] h-[13px] text-white" />
                    </div>
                    <span className="text-[13px] font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Content pane ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header */}
        <header className="h-[46px] flex items-center px-6 border-b border-white/[0.07] flex-shrink-0">
          <h1 className="text-[15px] font-semibold text-zinc-100">{PAGE_TITLE[page]}</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="p-6 space-y-5"
            >
              {page === "overview" && timerState && (
                <StatusCard
                  timerState={timerState}
                  isPaused={isPaused}
                  onTogglePause={handleTogglePause}
                  onBreakNow={() => invoke("start_break_now")}
                  onReset={() => invoke("skip_break")}
                />
              )}

              {page === "schedule" && (
                <TimerSettings
                  workMinutes={workMinutes}
                  breakSeconds={breakSeconds}
                  selectedPreset={selectedPreset}
                  saved={saved}
                  onWorkChange={setWorkMinutes}
                  onBreakChange={setBreakSeconds}
                  onPreset={handlePreset}
                  onSave={handleSave}
                />
              )}

              {page === "about" && (
                <>
                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                      App Info
                    </h2>
                    <div className="bg-[#2C2C2E] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
                      {(
                        [
                          ["Version", "0.1.0"],
                          ["License", "Open source"],
                          ["Platform", "macOS · Windows · Linux"],
                        ] as [string, string][]
                      ).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3">
                          <span className="text-[13px] font-medium text-zinc-200">{label}</span>
                          <span className="text-[13px] text-zinc-500">{value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                      About
                    </h2>
                    <div className="bg-[#2C2C2E] border border-white/[0.06] rounded-xl p-4">
                      <p className="text-[13px] text-zinc-400 leading-relaxed">
                        Kedip is a gentle eye care reminder. Every 20 minutes, look at something 20
                        feet away for 20 seconds — the 20-20-20 rule.
                      </p>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
