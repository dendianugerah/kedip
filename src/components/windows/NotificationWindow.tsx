import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Play, Clock, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TimerState {
  phase: string;
  time_remaining_ms: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function NotificationWindow() {
  const [timeRemaining, setTimeRemaining] = useState(30000);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get("time") || "30000");
    setTimeRemaining(time);

    const unlisten = listen<TimerState>("timer-update", (event) => {
      if (event.payload.phase === "Countdown") {
        setTimeRemaining(event.payload.time_remaining_ms);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleStartNow = () => {
    invoke("start_break_now");
  };

  const handleSnooze = () => {
    invoke("snooze_break");
  };

  const handleSkip = () => {
    invoke("skip_break");
  };

  return (
    <div className="w-full h-full p-2">
      <div 
        className="w-full h-full rounded-2xl overflow-hidden select-none glass border border-white/30 shadow-xl shadow-violet-200/30"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 247, 255, 0.95) 100%)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 h-full">
          {/* Left: Timer info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md shadow-violet-200/50">
              <Clock className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Break in</p>
              <p className="text-xl font-bold text-slate-700 tabular-nums">
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNow}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl",
                "bg-gradient-to-r from-violet-500 to-purple-500",
                "text-white text-xs font-semibold",
                "hover:from-violet-600 hover:to-purple-600 transition-all",
                "shadow-md shadow-violet-200/50"
              )}
            >
              <Play className="w-3 h-3" fill="currentColor" />
              Start
            </button>
            <button
              onClick={handleSnooze}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              +5m
            </button>
            <button
              onClick={handleSkip}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
