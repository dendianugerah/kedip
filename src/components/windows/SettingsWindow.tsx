import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface TimerState {
  phase: string;
  time_remaining_ms: number;
  work_duration_ms: number;
  break_duration_ms: number;
  countdown_duration_ms: number;
}

function formatTimeShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const presets = [
  { name: "20-20-20", work: 20, break: 20 },
  { name: "Pomodoro", work: 25, break: 5 },
  { name: "Long Focus", work: 50, break: 10 },
  { name: "Quick", work: 10, break: 15 },
];

export function SettingsWindow() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "settings">("status");

  useEffect(() => {
    // Get initial state
    invoke<TimerState>("get_timer_state").then((state) => {
      setTimerState(state);
      setWorkMinutes(Math.floor(state.work_duration_ms / 60000));
      setBreakSeconds(Math.floor(state.break_duration_ms / 1000));
      setCountdownSeconds(Math.floor(state.countdown_duration_ms / 1000));
    });

    // Listen for timer updates
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
      countdownDurationMs: countdownSeconds * 1000,
    });
  };

  const handleTogglePause = async () => {
    const paused = await invoke<boolean>("toggle_pause");
    setIsPaused(paused);
  };

  const handleStartBreak = () => {
    invoke("start_break_now");
  };

  const handleSkipBreak = () => {
    invoke("skip_break");
  };

  const applyPreset = (preset: (typeof presets)[0]) => {
    setWorkMinutes(preset.work);
    setBreakSeconds(preset.name === "20-20-20" ? 20 : preset.break * 60);
    invoke("update_settings", {
      workDurationMs: preset.work * 60 * 1000,
      breakDurationMs: (preset.name === "20-20-20" ? 20 : preset.break * 60) * 1000,
      countdownDurationMs: countdownSeconds * 1000,
    });
  };

  const phaseLabel = {
    Idle: "Idle",
    Working: "Working",
    Countdown: "Break starting soon",
    Break: "On break",
  };

  const phaseColor = {
    Idle: "bg-slate-400",
    Working: "bg-emerald-500",
    Countdown: "bg-amber-500",
    Break: "bg-indigo-500",
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Kedip</h1>
            <p className="text-xs text-slate-500">Eye care reminder</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setActiveTab("status")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "status"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "status" && timerState && (
          <div className="space-y-6">
            {/* Current status */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      phaseColor[timerState.phase as keyof typeof phaseColor] || "bg-slate-400"
                    } ${timerState.phase === "Working" && !isPaused ? "animate-pulse" : ""}`}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {isPaused ? "Paused" : phaseLabel[timerState.phase as keyof typeof phaseLabel] || timerState.phase}
                  </span>
                </div>
                <button
                  onClick={handleTogglePause}
                  className={`p-2 rounded-lg transition-colors ${
                    isPaused ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                  } hover:bg-slate-200`}
                >
                  {isPaused ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Timer display */}
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-slate-800 tabular-nums">
                  {formatTimeShort(timerState.time_remaining_ms)}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {timerState.phase === "Working" && "until next break"}
                  {timerState.phase === "Countdown" && "until break starts"}
                  {timerState.phase === "Break" && "remaining"}
                </p>
              </div>

              {/* Progress */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    phaseColor[timerState.phase as keyof typeof phaseColor] || "bg-slate-400"
                  }`}
                  style={{
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
                />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStartBreak}
                className="py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                Take Break Now
              </button>
              <button
                onClick={handleSkipBreak}
                className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors border border-slate-200"
              >
                Reset Timer
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              Work: {workMinutes}m • Break: {breakSeconds}s • Countdown: {countdownSeconds}s
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Presets */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
                      workMinutes === preset.work
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Work duration */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Work Duration
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-lg font-semibold text-slate-800 w-16 text-right tabular-nums">
                  {workMinutes}m
                </span>
              </div>
            </div>

            {/* Break duration */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Break Duration
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={breakSeconds}
                  onChange={(e) => setBreakSeconds(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-lg font-semibold text-slate-800 w-16 text-right tabular-nums">
                  {breakSeconds}s
                </span>
              </div>
            </div>

            {/* Countdown duration */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Countdown Warning
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={countdownSeconds}
                  onChange={(e) => setCountdownSeconds(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-lg font-semibold text-slate-800 w-16 text-right tabular-nums">
                  {countdownSeconds}s
                </span>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white">
        <p className="text-xs text-center text-slate-400">
          Kedip v0.1.0 • Protecting your eyes 👁
        </p>
      </div>
    </div>
  );
}
