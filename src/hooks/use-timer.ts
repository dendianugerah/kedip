import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { TimerState, TimerPhase } from "@/types/timer";

interface UseTimerOptions {
  phase?: TimerPhase;
  onComplete?: () => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  useEffect(() => {
    invoke<TimerState>("get_timer_state").then(setTimerState);

    const unlisten = listen<TimerState>("timer-update", (event) => {
      const state = event.payload;

      if (options.phase && state.phase !== options.phase) {
        return;
      }

      setTimerState(state);

      if (options.onComplete && state.time_remaining_ms <= 0) {
        options.onComplete();
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [options.phase, options.onComplete]);

  return timerState;
}
