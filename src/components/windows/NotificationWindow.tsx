import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Eye } from "lucide-react";

import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";

export function NotificationWindow() {
  const [timeRemaining, setTimeRemaining] = useState(30000);

  const seconds = Math.floor(timeRemaining / 1000);
  const isUrgent = seconds <= 10;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get("time") || "30000");
    setTimeRemaining(time);

    const unlisten = listen<TimerState>("timer-update", (event) => {
      if (event.payload.phase === "Working") {
        setTimeRemaining(event.payload.time_remaining_ms);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleStartNow = () => invoke("start_break_now");
  const handleSnooze = (minutes: number) => invoke("snooze_break", { minutes });
  const handleSkip = () => invoke("skip_break");

  return (
    <div className="w-full h-full flex items-center justify-between px-3 select-none font-sans">
      <div className="flex items-center gap-2">
        <Eye className={`w-4 h-4 text-white ${isUrgent ? "animate-pulse" : "opacity-60"}`} />
        <span
          className={`text-sm font-medium tabular-nums transition-colors ${
            isUrgent ? "text-amber-400" : "text-white/90"
          }`}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleStartNow}
          className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-black rounded-full transition-colors"
        >
          Now
        </button>
        <button
          onClick={() => handleSnooze(1)}
          className="px-2 py-1 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-full transition-colors"
        >
          +1m
        </button>
        <button
          onClick={() => handleSnooze(5)}
          className="px-2 py-1 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-full transition-colors"
        >
          +5m
        </button>
        <button
          onClick={handleSkip}
          className="px-2 py-1 text-xs font-medium text-white/50 hover:text-white/70 rounded-full transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
