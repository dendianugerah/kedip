import { useEffect, useState, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Plus, X } from "lucide-react";

import type { TimerState } from "@/types/timer";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function BreakWindow() {
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [isComplete, setIsComplete] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [escCount, setEscCount] = useState(0);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  useEffect(() => {
    resetIdleTimer();

    const events = ["mousemove", "mousedown"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get("time") || "20000");
    setTimeRemaining(Math.floor(time / 1000));

    const unlisten = listen<TimerState>("timer-update", (event) => {
      if (event.payload.phase === "Break") {
        const seconds = Math.floor(event.payload.time_remaining_ms / 1000);
        setTimeRemaining(seconds);
        if (seconds <= 0) setIsComplete(true);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscCount((prev) => {
          const next = prev + 1;
          if (next >= 2) {
            invoke("skip_break");
            return 0;
          }
          if (escTimer.current) clearTimeout(escTimer.current);
          escTimer.current = setTimeout(() => setEscCount(0), 800);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (escTimer.current) clearTimeout(escTimer.current);
    };
  }, []);

  const handleAddTime = () => invoke("add_break_time", { extraMs: 60000 });
  const handleSkip = () => invoke("skip_break");

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center select-none">
        <div className="text-center animate-fade-in">
          <p className="text-5xl font-light text-white/90 tracking-tight">Done</p>
          <p className="text-lg text-white/50 mt-4">Your eyes are refreshed</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-2xl flex items-center justify-center select-none transition-[cursor] duration-300 ${isIdle ? "cursor-none" : ""}`}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-12 transition-all duration-700 ease-out ${isIdle ? "opacity-0 -translate-y-4" : "opacity-100"}`}
        >
          <p className="text-2xl font-light text-white/70 tracking-wide">
            Look away. Rest your eyes.
          </p>
        </div>

        <div
          className={`transition-all duration-700 ease-out ${isIdle ? "scale-110" : "scale-100"}`}
        >
          <p className="text-[120px] font-extralight text-white tabular-nums tracking-tighter leading-none">
            {formatTime(timeRemaining)}
          </p>
        </div>

        <div
          className={`mt-16 flex flex-col items-center transition-all duration-700 ease-out ${isIdle ? "opacity-0 translate-y-4" : "opacity-100"}`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddTime}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />1 min
            </button>
            <button
              onClick={handleSkip}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
              Skip
            </button>
          </div>

          <p
            className={`mt-8 text-sm transition-colors duration-200 ${escCount > 0 ? "text-white/70" : "text-white/30"}`}
          >
            {escCount > 0 ? (
              <>
                Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-white/20 text-xs">ESC</kbd>{" "}
                again to skip
              </>
            ) : (
              <>
                Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-white/10 text-xs">ESC</kbd>{" "}
                twice to skip
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
