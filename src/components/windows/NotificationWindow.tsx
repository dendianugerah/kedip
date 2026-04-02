import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "motion/react";
import { Clock, Play, X, Timer } from "lucide-react";

import { Button } from "@/components/ui";
import { formatTime } from "@/lib/format";
import type { TimerState } from "@/types/timer";

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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full bg-[#F9F8F4] rounded-2xl overflow-hidden select-none font-sans border border-[#EAE6DF]"
    >
      <div className="flex items-center justify-between px-5 py-4 h-full">
        {/* Left: Timer info */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#EAE6DF] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#7A7974]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#A3A19C]">Break in</p>
            <p className="text-xl font-medium text-[#2A2A28] tabular-nums tracking-tight">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" onClick={handleStartNow}>
            <Play className="w-3.5 h-3.5" />
            Now
          </Button>
          <Button variant="secondary" size="md" onClick={handleSnooze}>
            <Timer className="w-3.5 h-3.5" />
            +5m
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
