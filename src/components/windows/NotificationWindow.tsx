import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface TimerState {
  phase: string;
  time_remaining_ms: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
    <div className="w-full h-full rounded-2xl overflow-hidden select-none" 
      style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.95) 50%, rgba(76, 29, 149, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 h-full">
        {/* Left: Timer info */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-white/60">Break starts in</p>
            <p className="text-xl font-semibold text-white tabular-nums tracking-wide">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartNow}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/20 rounded-lg transition-colors"
          >
            Start Now
          </button>
          <button
            onClick={handleSnooze}
            className="px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            +5 min
          </button>
          <button
            onClick={handleSkip}
            className="px-3.5 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
