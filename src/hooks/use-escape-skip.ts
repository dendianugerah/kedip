import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface UseEscapeSkipOptions {
  requiredPresses?: number;
  timeout?: number;
}

export function useEscapeSkip(options: UseEscapeSkipOptions = {}) {
  const { requiredPresses = 2, timeout = 1000 } = options;
  const [escCount, setEscCount] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscCount((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (escCount >= requiredPresses) {
      invoke("skip_break");
      setEscCount(0);
      return;
    }

    if (escCount > 0) {
      const timer = setTimeout(() => setEscCount(0), timeout);
      return () => clearTimeout(timer);
    }
  }, [escCount, requiredPresses, timeout]);

  return escCount;
}
