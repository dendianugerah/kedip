import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { 
  Eye, 
  Play, 
  Pause, 
  Coffee, 
  RotateCcw, 
  Sparkles,
  Clock,
  Timer,
  Bell,
  Settings,
  Zap
} from "lucide-react";
import { cn } from "../../lib/utils";

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
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const presets = [
  { name: "20-20-20", icon: Eye, work: 20, break: 20, desc: "Classic eye care" },
  { name: "Pomodoro", icon: Timer, work: 25, break: 5, desc: "Focus technique" },
  { name: "Deep Work", icon: Zap, work: 50, break: 10, desc: "Long sessions" },
  { name: "Quick", icon: Coffee, work: 10, break: 15, desc: "Short bursts" },
];

export function SettingsWindow() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "settings">("status");
  const [selectedPreset, setSelectedPreset] = useState("20-20-20");

  useEffect(() => {
    invoke<TimerState>("get_timer_state").then((state) => {
      setTimerState(state);
      setWorkMinutes(Math.floor(state.work_duration_ms / 60000));
      setBreakSeconds(Math.floor(state.break_duration_ms / 1000));
      setCountdownSeconds(Math.floor(state.countdown_duration_ms / 1000));
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
    setSelectedPreset(preset.name);
    setWorkMinutes(preset.work);
    setBreakSeconds(preset.name === "20-20-20" ? 20 : preset.break * 60);
    invoke("update_settings", {
      workDurationMs: preset.work * 60 * 1000,
      breakDurationMs: (preset.name === "20-20-20" ? 20 : preset.break * 60) * 1000,
      countdownDurationMs: countdownSeconds * 1000,
    });
  };

  const phaseInfo = {
    Idle: { label: "Ready", color: "from-slate-400 to-slate-500", bg: "bg-slate-100" },
    Working: { label: "Focusing", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50" },
    Countdown: { label: "Break soon", color: "from-amber-400 to-orange-500", bg: "bg-amber-50" },
    Break: { label: "Resting", color: "from-violet-400 to-purple-500", bg: "bg-violet-50" },
  };

  const currentPhase = timerState?.phase as keyof typeof phaseInfo || "Idle";
  const phase = phaseInfo[currentPhase] || phaseInfo.Idle;

  const getProgress = () => {
    if (!timerState) return 0;
    if (timerState.phase === "Working") {
      return ((timerState.work_duration_ms - timerState.time_remaining_ms) / timerState.work_duration_ms) * 100;
    }
    if (timerState.phase === "Break") {
      return ((timerState.break_duration_ms - timerState.time_remaining_ms) / timerState.break_duration_ms) * 100;
    }
    return 0;
  };

  return (
    <div className="w-full h-full bg-[#f8f7ff] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-violet-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Eye className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Kedip</h1>
            <p className="text-xs text-slate-400">Your eye care buddy ✨</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="px-5 py-3 bg-white/50">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab("status")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all",
              activeTab === "status"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Clock className="w-4 h-4" />
            Status
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all",
              activeTab === "settings"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {activeTab === "status" && timerState && (
          <div className="space-y-4">
            {/* Status card */}
            <div className={cn(
              "rounded-3xl p-6 border transition-all",
              phase.bg,
              "border-white/50"
            )}>
              {/* Status badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white",
                  `bg-gradient-to-r ${phase.color}`
                )}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  {isPaused ? "Paused" : phase.label}
                </div>
                <button
                  onClick={handleTogglePause}
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                    isPaused 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50" 
                      : "bg-white/80 text-slate-600 hover:bg-white shadow-sm"
                  )}
                >
                  {isPaused ? <Play className="w-4 h-4" fill="currentColor" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>

              {/* Timer display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-slate-800 tabular-nums tracking-tight">
                  {formatTimeShort(timerState.time_remaining_ms)}
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {timerState.phase === "Working" && "until your next break"}
                  {timerState.phase === "Countdown" && "break starting soon"}
                  {timerState.phase === "Break" && "enjoy your rest"}
                  {timerState.phase === "Idle" && "ready to start"}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    `bg-gradient-to-r ${phase.color}`
                  )}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStartBreak}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 px-4 rounded-2xl",
                  "bg-gradient-to-r from-violet-500 to-purple-500",
                  "text-white font-semibold transition-all",
                  "hover:from-violet-600 hover:to-purple-600",
                  "shadow-lg shadow-violet-200/50"
                )}
              >
                <Coffee className="w-5 h-5" />
                Take Break
              </button>
              <button
                onClick={handleSkipBreak}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 px-4 rounded-2xl",
                  "bg-white text-slate-700 font-semibold transition-all",
                  "hover:bg-slate-50 border border-slate-200/50",
                  "shadow-sm"
                )}
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>

            {/* Current settings info */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 py-2">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" /> {workMinutes}m work
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {breakSeconds}s break
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3" /> {countdownSeconds}s warning
              </span>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-5">
            {/* Presets */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "p-4 rounded-2xl text-left transition-all border",
                        selectedPreset === preset.name
                          ? "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-md shadow-violet-100/50"
                          : "bg-white border-slate-100 hover:border-violet-200"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn(
                          "w-4 h-4",
                          selectedPreset === preset.name ? "text-violet-500" : "text-slate-400"
                        )} />
                        <span className={cn(
                          "text-sm font-semibold",
                          selectedPreset === preset.name ? "text-violet-700" : "text-slate-700"
                        )}>
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom settings */}
            <div className="space-y-4">
              {/* Work duration */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-500" />
                    Work Duration
                  </label>
                  <span className="text-lg font-bold text-slate-800 tabular-nums bg-slate-100 px-3 py-1 rounded-xl">
                    {workMinutes}m
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1m</span>
                  <span>60m</span>
                </div>
              </div>

              {/* Break duration */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-violet-500" />
                    Break Duration
                  </label>
                  <span className="text-lg font-bold text-slate-800 tabular-nums bg-slate-100 px-3 py-1 rounded-xl">
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
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5s</span>
                  <span>5m</span>
                </div>
              </div>

              {/* Countdown duration */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Warning Time
                  </label>
                  <span className="text-lg font-bold text-slate-800 tabular-nums bg-slate-100 px-3 py-1 rounded-xl">
                    {countdownSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={countdownSeconds}
                  onChange={(e) => setCountdownSeconds(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10s</span>
                  <span>2m</span>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveSettings}
              className={cn(
                "w-full py-4 px-4 rounded-2xl",
                "bg-gradient-to-r from-violet-500 to-purple-500",
                "text-white font-semibold transition-all",
                "hover:from-violet-600 hover:to-purple-600",
                "shadow-lg shadow-violet-200/50"
              )}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-white/50 border-t border-violet-100/50">
        <p className="text-xs text-center text-slate-400">
          Made with 💜 for your eyes
        </p>
      </div>
    </div>
  );
}
