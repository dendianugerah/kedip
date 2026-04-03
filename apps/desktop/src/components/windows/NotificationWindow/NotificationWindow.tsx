import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { TimerState } from "@/types/timer";
import { NotificationBanner } from "./NotificationBanner";

export function NotificationWindow() {
  const [timeRemaining, setTimeRemaining] = useState(30000);
  const [visible, setVisible] = useState(true);

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

  const dismiss = (action: () => void) => {
    setVisible(false);
    setTimeout(action, 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.code === "Space") {
        e.preventDefault();
        setVisible(false);
        setTimeout(() => invoke("start_break_now"), 220);
      } else if (e.key === "s" || e.key === "S") {
        setVisible(false);
        setTimeout(() => invoke("snooze_break", { minutes: 5 }), 220);
      } else if (e.key === "Escape") {
        setVisible(false);
        setTimeout(() => invoke("skip_break"), 220);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  return (
    <NotificationBanner
      timeRemaining={timeRemaining}
      visible={visible}
      onStartNow={() => dismiss(() => invoke("start_break_now"))}
      onSnooze={(minutes) => dismiss(() => invoke("snooze_break", { minutes }))}
      onSkip={() => dismiss(() => invoke("skip_break"))}
    />
  );
}
