import { useEffect, useState, type ElementType } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Timer, Info, Keyboard } from "lucide-react";

import { PRESETS } from "@/constants/presets";
import { useTimerState } from "@/lib/useTimerState";
import { StatusCard } from "./StatusCard";
import { TimerSettings } from "./TimerSettings";
import { ShortcutsPage } from "./ShortcutsPage";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.18,
  ease: [0.2, 0, 0, 1] as [number, number, number, number],
};

type Page = "overview" | "schedule" | "shortcuts" | "about";

const NAV: { id: Page; label: string; icon: ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: Timer },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

const NAV_BOTTOM: { id: Page; label: string; icon: ElementType }[] = [
  { id: "about", label: "About", icon: Info },
];

const GITHUB_URL = "https://github.com/dendianugerah/kedip";

export function SettingsWindow() {
  const timerState = useTimerState();
  const [draft, setDraft] = useState<{ workMs: number; breakMs: number } | null>(null);
  const [page, setPage] = useState<Page>("overview");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    void getVersion().then(setAppVersion).catch(console.error);
  }, []);

  const workMs = draft?.workMs ?? timerState?.work_duration_ms ?? 1_200_000;
  const breakMs = draft?.breakMs ?? timerState?.break_duration_ms ?? 20_000;
  const selectedPreset = PRESETS.find(
    (preset) => preset.workMs === workMs && preset.breakMs === breakMs
  )?.name;
  const dirty =
    timerState !== null &&
    (workMs !== timerState.work_duration_ms || breakMs !== timerState.break_duration_ms);

  const editSchedule = (workMs: number, breakMs: number) => {
    setDraft({ workMs, breakMs });
    setSaveState("idle");
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await invoke("update_settings", { workDurationMs: workMs, breakDurationMs: breakMs });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full bg-[#0A0A0A] flex flex-col font-sans select-none overflow-hidden text-white"
    >
      <div className="flex flex-1 min-h-0 overflow-hidden pt-10">
        {/* Sidebar */}
        <aside className="w-[168px] flex-shrink-0 border-r border-white/[0.06] flex flex-col pb-5 pt-3 px-2.5">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase px-2 mb-4">Kedip</p>
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = page === id;
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer scale-press ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-[14px] h-[14px] flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>

          <nav className="mt-auto flex flex-col gap-0.5">
            {NAV_BOTTOM.map(({ id, label, icon: Icon }) => {
              const active = page === id;
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer scale-press ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-[14px] h-[14px] flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="p-8 space-y-6"
              >
                {page === "overview" && timerState && (
                  <StatusCard
                    timerState={timerState}
                    onTogglePause={() => invoke("toggle_pause")}
                    onBreakNow={() => invoke("start_break_now")}
                    onReset={() => invoke("skip_break")}
                  />
                )}

                {page === "schedule" && (
                  <TimerSettings
                    workMinutes={Math.round(workMs / 60_000)}
                    breakSeconds={Math.round(breakMs / 1000)}
                    selectedPreset={selectedPreset}
                    saveState={saveState}
                    dirty={dirty}
                    onWorkChange={(value) => editSchedule(value * 60_000, breakMs)}
                    onBreakChange={(value) => editSchedule(workMs, value * 1000)}
                    onPreset={(preset) => editSchedule(preset.workMs, preset.breakMs)}
                    onSave={handleSave}
                  />
                )}

                {page === "shortcuts" && <ShortcutsPage />}

                {page === "about" && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
                        App
                      </p>
                      <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                        {(
                          [
                            ["Version", appVersion ? `v${appVersion}` : "..."],
                            ["License", "Open source · MIT"],
                            ["Platform", "macOS · Windows · Linux"],
                          ] as [string, string][]
                        ).map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between px-4 py-3 bg-white/[0.06]"
                          >
                            <span className="text-[13px] text-white/75">{label}</span>
                            <span className="text-[13px] text-white/35">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
                        About
                      </p>
                      <p className="text-[13px] text-white/50 leading-relaxed">
                        Kedip is a gentle eye care reminder. Every 20 minutes, look at something 20
                        feet away for 20 seconds, the 20-20-20 rule.
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.22em] mb-3">
                        Source
                      </p>
                      <button
                        onClick={() => openUrl(GITHUB_URL)}
                        className="text-[13px] text-white/50 hover:text-white/80 transition-colors cursor-pointer underline underline-offset-2 decoration-white/20 hover:decoration-white/50 scale-press"
                      >
                        github.com/dendianugerah/kedip
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
