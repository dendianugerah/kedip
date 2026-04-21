import { useEffect, useState, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion } from "motion/react";
import { Plus, X } from "lucide-react";

import { formatSeconds } from "@/lib/format";
import type { TimerState } from "@/types/timer";
import { Button } from "@/components/ui/button";

function SecondaryBreakWindow() {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    />
  );
}

export function BreakWindow() {
  const params = new URLSearchParams(window.location.search);
  const isPrimary = params.get("primary") !== "false";
  const initialTime = Math.floor(parseInt(params.get("time") || "20000") / 1000);

  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isComplete, setIsComplete] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [escCount, setEscCount] = useState(0);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(isIdle);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  useEffect(() => {
    if (!isPrimary) return;

    resetIdleTimer();

    const events = ["mousemove", "mousedown"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer, isPrimary]);

  useEffect(() => {
    if (!isPrimary) return;

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
  }, [isPrimary]);

  useEffect(() => {
    if (!isPrimary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isIdleRef.current) {
          resetIdleTimer();
          return;
        }

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
  }, [resetIdleTimer, isPrimary]);

  const handleAddTime = () => invoke("add_break_time", { extraMs: 60000 });
  const handleSkip = () => invoke("skip_break");

  if (!isPrimary) {
    return <SecondaryBreakWindow />;
  }

  if (isComplete) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="text-5xl font-semibold text-white tracking-tight">Done</p>
          <p className="text-lg font-light text-white/50 mt-4">Your eyes are refreshed</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed inset-0 bg-black/70 backdrop-blur-2xl flex items-center justify-center select-none transition-[cursor] duration-300 ${isIdle ? "cursor-none" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div
        className={`flex flex-col items-center text-center transition-transform duration-700 ease-out origin-center ${isIdle ? "scale-110" : "scale-100"}`}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white tracking-tight">Screen Break!</h1>
          <p className="mt-3 text-lg font-light text-white/60 max-w-md">
            Your eyes have been working overtime. Give them a quick mini-vacation.
          </p>
        </div>

        <div>
          <p className="text-[120px] font-extralight text-white tabular-nums tracking-tighter leading-none">
            {formatSeconds(timeRemaining)}
          </p>
        </div>

        <div
          className={`mt-16 flex flex-col items-center transition-opacity duration-700 ease-out ${isIdle ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleAddTime}
              className="px-5 py-2.5 h-auto rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium scale-press transition-colors"
            >
              <Plus className="w-4 h-4" />1 min
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="px-5 py-2.5 h-auto rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium border border-white/10 hover:border-white/10 scale-press transition-colors"
            >
              <X className="w-4 h-4" />
              Skip
            </Button>
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
    </motion.div>
  );
}
