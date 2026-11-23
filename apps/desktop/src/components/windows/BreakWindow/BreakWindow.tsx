import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, useReducedMotion } from "motion/react";
import { Eye, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import { useTimerState } from "@/lib/useTimerState";

const IDLE_MS = 3000;
const ESC_WINDOW_MS = 800;

export function BreakWindow() {
  const initialTime = Number(new URLSearchParams(window.location.search).get("time") ?? 20_000);
  const timer = useTimerState();
  const timeRemaining = timer?.phase === "Break" ? timer.time_remaining_ms : initialTime;
  const reducedMotion = useReducedMotion();
  const [idle, setIdle] = useState(false);
  const [escapePending, setEscapePending] = useState(false);

  useEffect(() => {
    let lastActivity = performance.now();
    let firstEscape: number | undefined;
    let escapeTimer: ReturnType<typeof setTimeout> | undefined;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const checkIdle = () => {
      const delay = IDLE_MS - (performance.now() - lastActivity);
      if (delay > 0) {
        idleTimer = setTimeout(checkIdle, delay);
      } else {
        idleTimer = undefined;
        setIdle(true);
      }
    };
    const activity = () => {
      lastActivity = performance.now();
      if (idleTimer === undefined) {
        setIdle(false);
        idleTimer = setTimeout(checkIdle, IDLE_MS);
      }
    };
    const keyDown = (event: KeyboardEvent) => {
      activity();
      if (event.key !== "Escape" || event.repeat) return;
      const now = performance.now();
      if (firstEscape !== undefined && now - firstEscape <= ESC_WINDOW_MS) {
        firstEscape = undefined;
        clearTimeout(escapeTimer);
        setEscapePending(false);
        void invoke("skip_break").catch(console.error);
      } else {
        firstEscape = now;
        setEscapePending(true);
        clearTimeout(escapeTimer);
        escapeTimer = setTimeout(() => setEscapePending(false), ESC_WINDOW_MS);
      }
    };

    activity();
    window.addEventListener("pointermove", activity);
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", keyDown);
    return () => {
      window.removeEventListener("pointermove", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", keyDown);
      clearTimeout(idleTimer);
      clearTimeout(escapeTimer);
    };
  }, []);

  return (
    <motion.main
      className={`break-surface fixed inset-0 flex items-center justify-center select-none text-white ${idle ? "cursor-none" : ""}`}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col items-center text-center px-6">
        <Eye aria-hidden="true" className="size-7 text-teal-200 mb-5" />
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Time to look away</h1>
        <p className="mt-3 text-base text-white/70 text-balance">
          Relax your shoulders and look at something about 20 feet (6 meters) away.
        </p>
        <p className="mt-8 text-[clamp(4rem,12vw,7.5rem)] font-extralight text-teal-50 tabular-nums tracking-tighter leading-none">
          {formatTime(timeRemaining)}
        </p>
        <div
          className={`mt-10 flex flex-col items-center motion-safe:transition-opacity motion-safe:duration-300 focus-within:opacity-100 focus-within:pointer-events-auto ${idle ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => invoke("add_break_time", { extraMs: 60_000 }).catch(console.error)}
              className="px-5 py-2.5 h-auto rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-sm font-medium"
            >
              <Plus /> Add 1 min
            </Button>
            <Button
              variant="ghost"
              onClick={() => invoke("skip_break").catch(console.error)}
              className="px-5 py-2.5 h-auto rounded-full bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium border border-white/10"
            >
              <X /> End break
            </Button>
          </div>
          <p className={`mt-6 text-sm ${escapePending ? "text-white/90" : "text-white/60"}`}>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Esc</kbd>
            {escapePending ? " again to end the break" : " twice to end the break"}
          </p>
        </div>
      </div>
    </motion.main>
  );
}
