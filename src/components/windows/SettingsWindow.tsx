import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "motion/react";
import { Eye, Play, Pause, Coffee, RotateCcw, Clock, Zap, Leaf } from "lucide-react";

import { formatTime } from "@/lib/format";
import type { TimerState, Preset } from "@/types/timer";

const presets: Preset[] = [
  {
    name: "20-20-20",
    icon: Eye,
    workMs: 20 * 60 * 1000,
    breakMs: 20 * 1000,
    desc: "Classic eye care",
  },
  {
    name: "Pomodoro",
    icon: Coffee,
    workMs: 25 * 60 * 1000,
    breakMs: 5 * 60 * 1000,
    desc: "Focus sessions",
  },
  {
    name: "Deep Work",
    icon: Zap,
    workMs: 50 * 60 * 1000,
    breakMs: 10 * 60 * 1000,
    desc: "Long focus",
  },
];

const PHASE_LABEL: Record<string, string> = {
  Working: "Focusing",
  Break: "Resting",
};

const PHASE_COLOR: Record<string, string> = {
  Working: "bg-[#D3E4CD]",
  Break: "bg-[#D1E8E2]",
};

export function SettingsWindow() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "settings">("status");
  const [selectedPreset, setSelectedPreset] = useState("20-20-20");

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

  const handleSaveSettings = () => {
    invoke("update_settings", {
      workDurationMs: workMinutes * 60 * 1000,
      breakDurationMs: breakSeconds * 1000,
    });
  };

  const handleTogglePause = async () => {
    const paused = await invoke<boolean>("toggle_pause");
    setIsPaused(paused);
  };

  const handleStartBreak = () => {
    invoke("start_break_now");
  };

  const handleResetTimer = () => {
    invoke("skip_break");
  };

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset.name);
    setWorkMinutes(Math.floor(preset.workMs / 60000));
    setBreakSeconds(Math.floor(preset.breakMs / 1000));
    invoke("update_settings", {
      workDurationMs: preset.workMs,
      breakDurationMs: preset.breakMs,
    });
  };

  return (
    <div className="w-full h-full bg-[#F9F8F4] flex flex-col font-sans select-none">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EAE6DF] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#7A7974]" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-[#2A2A28]">Kedip</h1>
            <p className="text-xs text-[#A3A19C]">Gentle eye care</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EAE6DF]">
        <button
          onClick={() => setActiveTab("status")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "status"
              ? "text-[#2A2A28] border-b-2 border-[#2A2A28]"
              : "text-[#A3A19C] hover:text-[#7A7974]"
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "text-[#2A2A28] border-b-2 border-[#2A2A28]"
              : "text-[#A3A19C] hover:text-[#7A7974]"
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "status" && timerState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Current status card */}
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      PHASE_COLOR[timerState.phase] || "bg-[#A3A19C]"
                    } ${timerState.phase === "Working" && !isPaused ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm font-medium text-[#7A7974]">
                    {isPaused ? "Paused" : PHASE_LABEL[timerState.phase] || timerState.phase}
                  </span>
                </div>
                <button
                  onClick={handleTogglePause}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isPaused
                      ? "bg-[#D3E4CD] text-[#2A2A28]"
                      : "bg-[#EAE6DF] text-[#7A7974] hover:bg-[#DFDBD0]"
                  }`}
                >
                  {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>

              {/* Timer display */}
              <div className="text-center mb-4">
                <div className="text-5xl font-light text-[#2A2A28] tabular-nums tracking-tight">
                  {formatTime(timerState.time_remaining_ms)}
                </div>
                <p className="text-sm text-[#A3A19C] mt-1">
                  {timerState.phase === "Working" && "until next break"}
                  {timerState.phase === "Break" && "remaining"}
                </p>
              </div>

              {/* Progress */}
              <div className="h-1 bg-[#EAE6DF] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${PHASE_COLOR[timerState.phase] || "bg-[#A3A19C]"} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      timerState.phase === "Working"
                        ? ((timerState.work_duration_ms - timerState.time_remaining_ms) /
                            timerState.work_duration_ms) *
                          100
                        : timerState.phase === "Break"
                          ? ((timerState.break_duration_ms - timerState.time_remaining_ms) /
                              timerState.break_duration_ms) *
                            100
                          : 0
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStartBreak}
                className="py-3 px-4 bg-[#2A2A28] hover:bg-[#1A1A18] text-[#F9F8F4] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                Break Now
              </button>
              <button
                onClick={handleResetTimer}
                className="py-3 px-4 bg-white hover:bg-[#EAE6DF] text-[#2A2A28] rounded-xl font-medium transition-colors border border-[#EAE6DF] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Info */}
            <div className="text-center text-xs text-[#A3A19C]">
              Work: {workMinutes}m · Break: {breakSeconds}s
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Presets */}
            <div>
              <label className="text-sm font-medium text-[#7A7974] mb-3 block">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        selectedPreset === preset.name
                          ? "bg-[#2A2A28] border-[#2A2A28] text-[#F9F8F4]"
                          : "bg-white border-[#EAE6DF] text-[#2A2A28] hover:border-[#DFDBD0]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{preset.name}</span>
                      </div>
                      <p
                        className={`text-xs ${
                          selectedPreset === preset.name ? "text-[#A3A19C]" : "text-[#A3A19C]"
                        }`}
                      >
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work duration */}
            <div className="bg-white rounded-xl p-4 border border-[#EAE6DF]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#7A7974]" />
                  <span className="text-sm font-medium text-[#2A2A28]">Work Duration</span>
                </div>
                <span className="text-lg font-medium text-[#2A2A28] tabular-nums">
                  {workMinutes}m
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(parseInt(e.target.value))}
                className="w-full h-1 bg-[#EAE6DF] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#2A2A28]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>

            {/* Break duration */}
            <div className="bg-white rounded-xl p-4 border border-[#EAE6DF]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#7A7974]" />
                  <span className="text-sm font-medium text-[#2A2A28]">Break Duration</span>
                </div>
                <span className="text-lg font-medium text-[#2A2A28] tabular-nums">
                  {breakSeconds}s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={breakSeconds}
                onChange={(e) => setBreakSeconds(parseInt(e.target.value))}
                className="w-full h-1 bg-[#EAE6DF] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#2A2A28]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 px-4 bg-[#2A2A28] hover:bg-[#1A1A18] text-[#F9F8F4] rounded-xl font-medium transition-colors"
            >
              Save Changes
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#EAE6DF]">
        <p className="text-xs text-center text-[#A3A19C]">Kedip v0.1.0 · Made with care</p>
      </div>
    </div>
  );
}
