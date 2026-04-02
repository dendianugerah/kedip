import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "motion/react";

import type { TimerState, Preset } from "@/types/timer";
import { StatusCard } from "./StatusCard";
import { TimerSettings } from "./TimerSettings";

type Tab = "status" | "settings";

export function SettingsWindow() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const [tab, setTab] = useState<Tab>("status");
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
    <div className="w-full h-full bg-[#111110] flex flex-col font-sans select-none">
      <div className="flex-shrink-0 px-5 pt-4 pb-3 flex gap-1">
        {(["status", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[13px] font-medium rounded-xl transition-all cursor-pointer capitalize ${
              tab === t
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/55 hover:bg-white/[0.04]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "status" ? (
            timerState && (
              <motion.div
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <StatusCard
                  timerState={timerState}
                  isPaused={isPaused}
                  onTogglePause={handleTogglePause}
                  onBreakNow={() => invoke("start_break_now")}
                  onReset={() => invoke("skip_break")}
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 px-5 pb-3.5">
        <p className="text-[10px] text-center text-white/15">Kedip · Open source · v0.1.0</p>
      </div>
    </div>
  );
}
