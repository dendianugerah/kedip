import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { TimerState } from "@/types/timer";

export function useTimerState() {
  const [state, setState] = useState<TimerState | null>(null);

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const onUpdate = (event: WindowEventMap["kedip:timer-update"]) => {
      receivedUpdate = true;
      setState(event.detail);
    };
    window.addEventListener("kedip:timer-update", onUpdate);
    void invoke<TimerState>("get_timer_state")
      .then((snapshot) => {
        if (active && !receivedUpdate) setState(snapshot);
      })
      .catch(console.error);

    return () => {
      active = false;
      window.removeEventListener("kedip:timer-update", onUpdate);
    };
  }, []);

  return state;
}

declare global {
  interface WindowEventMap {
    "kedip:timer-update": CustomEvent<TimerState>;
  }
}
