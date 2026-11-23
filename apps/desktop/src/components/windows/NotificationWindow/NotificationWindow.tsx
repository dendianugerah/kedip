import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { useTimerState } from "@/lib/useTimerState";
import { NotificationBanner } from "./NotificationBanner";

export function NotificationWindow() {
  const initialTime = Number(new URLSearchParams(window.location.search).get("time") ?? 30_000);
  const timer = useTimerState();
  const timeRemaining = timer?.phase === "Working" ? timer.time_remaining_ms : initialTime;
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);

  const act = useCallback((command: string, args?: { minutes: number }) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    void invoke(command, args).catch(() => {
      pending.current = false;
      setBusy(false);
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.code === "Space" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        act("start_break_now");
      } else if (e.key.toLowerCase() === "s") {
        act("snooze_break", { minutes: 5 });
      } else if (e.key === "Escape") {
        act("skip_break");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  return (
    <NotificationBanner
      timeRemaining={timeRemaining}
      busy={busy}
      onStartNow={() => act("start_break_now")}
      onSnooze={(minutes) => act("snooze_break", { minutes })}
      onSkip={() => act("skip_break")}
    />
  );
}
