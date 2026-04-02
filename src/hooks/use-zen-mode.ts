import { useEffect, useState, useCallback, useRef } from "react";

interface UseZenModeOptions {
  delay?: number;
}

export function useZenMode(options: UseZenModeOptions = {}) {
  const { delay = 3000 } = options;
  const [isZenMode, setIsZenMode] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setIsZenMode(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsZenMode(true);
    }, delay);
  }, [delay]);

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousedown", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  return isZenMode;
}
