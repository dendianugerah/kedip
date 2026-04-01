import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface TimerState {
  phase: string;
  time_remaining_ms: number;
  break_duration_ms: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function BreakWindow() {
  const [timeRemaining, setTimeRemaining] = useState(20000);
  const [breakDuration, setBreakDuration] = useState(20000);
  const [currentTime, setCurrentTime] = useState(getCurrentTime);
  const [escPressCount, setEscPressCount] = useState(0);
  const [escTimeout, setEscTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get("time") || "20000");
    setTimeRemaining(time);
    setBreakDuration(time);

    const unlisten = listen<TimerState>("timer-update", (event) => {
      if (event.payload.phase === "Break") {
        setTimeRemaining(event.payload.time_remaining_ms);
        if (event.payload.break_duration_ms > 0) {
          setBreakDuration(event.payload.break_duration_ms);
        }
      }
    });

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => {
      unlisten.then((fn) => fn());
      clearInterval(timeInterval);
    };
  }, []);

  // Handle double-Esc to skip
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      
      if (escPressCount === 0) {
        setEscPressCount(1);
        const timeout = setTimeout(() => {
          setEscPressCount(0);
        }, 500);
        setEscTimeout(timeout);
      } else if (escPressCount === 1) {
        if (escTimeout) clearTimeout(escTimeout);
        setEscPressCount(0);
        invoke("skip_break");
      }
    }
  }, [escPressCount, escTimeout]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSkip = () => {
    invoke("skip_break");
  };

  const handleLockScreen = () => {
    invoke("lock_screen");
  };

  const progress = breakDuration > 0 ? ((breakDuration - timeRemaining) / breakDuration) * 100 : 0;

  return (
    <div className="w-screen h-screen relative overflow-hidden select-none cursor-default">
      {/* Gradient background - matching LookAway's purple aesthetic */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 20%, rgba(139, 92, 246, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 40%),
            radial-gradient(ellipse 80% 80% at 20% 80%, rgba(124, 58, 237, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #3b0764 100%)
          `,
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Inner rounded container - like LookAway */}
      <div className="absolute inset-8 rounded-[2.5rem] overflow-hidden">
        {/* Inner gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 0%, rgba(167, 139, 250, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 100% 50%, rgba(192, 132, 252, 0.1) 0%, transparent 40%)
            `,
          }}
        />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center">
          {/* Current time - top */}
          <div className="absolute top-12">
            <span className="text-white/70 text-base font-normal tracking-wide">
              Current time is {currentTime}
            </span>
          </div>

          {/* Main content - centered */}
          <div className="flex flex-col items-center">
            {/* Title */}
            <h1 className="text-[4rem] leading-none font-semibold text-white mb-4 tracking-tight">
              Relax those eyes
            </h1>
            
            {/* Subtitle */}
            <p className="text-white/70 text-xl font-normal mb-12">
              Set your eyes on something distant until the countdown is over
            </p>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-white/20 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-white/50 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Timer */}
            <div className="text-[3.5rem] font-light text-white/40 tabular-nums tracking-wider">
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-70">
                  <path d="M4 3L10 8L4 13V3Z" fill="currentColor"/>
                  <path d="M8 3L14 8L8 13V3Z" fill="currentColor"/>
                </svg>
                Skip
              </button>

              {/* Lock Screen button */}
              <button
                onClick={handleLockScreen}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-70">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M4.5 6V4.5C4.5 3.11929 5.61929 2 7 2C8.38071 2 9.5 3.11929 9.5 4.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Lock Screen
              </button>
            </div>

            {/* Hint text */}
            <span className="text-white/30 text-xs">
              Press Esc twice to skip
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
