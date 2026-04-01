import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Eye, Lock, SkipForward, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

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

const tips = [
  "Look at something 20 feet away 👀",
  "Blink slowly a few times ✨",
  "Close your eyes and breathe 🌸",
  "Stretch your neck gently 🌿",
  "Roll your shoulders back 💫",
];

export function BreakWindow() {
  const [timeRemaining, setTimeRemaining] = useState(20000);
  const [breakDuration, setBreakDuration] = useState(20000);
  const [escPressCount, setEscPressCount] = useState(0);
  const [escTimeout, setEscTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

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

    return () => {
      unlisten.then((fn) => fn());
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
    <div className="w-screen h-screen relative overflow-hidden select-none cursor-default bg-[#f8f7ff]">
      {/* Soft gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(196, 181, 253, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(251, 207, 232, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 80%, rgba(191, 219, 254, 0.4) 0%, transparent 50%),
            linear-gradient(180deg, #f8f7ff 0%, #f3f1ff 100%)
          `,
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cloud shape top left */}
        <div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.3) 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        {/* Cloud shape top right */}
        <div 
          className="absolute -top-10 right-20 w-60 h-60 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(251, 207, 232, 0.3) 0%, transparent 70%)',
            animationDelay: '1s',
          }}
        />
        {/* Cloud shape bottom */}
        <div 
          className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(191, 219, 254, 0.3) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Main content card */}
      <div className="relative h-full flex items-center justify-center p-8">
        <div className="glass rounded-[2.5rem] p-12 max-w-lg w-full shadow-xl shadow-violet-200/50 border border-white/50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-300/50 animate-wiggle">
              <Eye className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center text-slate-800 mb-2">
            Rest your eyes
          </h1>
          
          {/* Tip */}
          <p className="text-lg text-center text-slate-500 mb-8">
            {tip}
          </p>

          {/* Timer circle */}
          <div className="relative flex justify-center mb-8">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Timer text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-800 tabular-nums">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-sm text-slate-400 mt-1">remaining</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSkip}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl",
                "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800",
                "text-sm font-semibold transition-all duration-200",
                "border border-slate-200/50"
              )}
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>

            <button
              onClick={handleLockScreen}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl",
                "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600",
                "text-white text-sm font-semibold transition-all duration-200",
                "shadow-lg shadow-violet-300/50"
              )}
            >
              <Lock className="w-4 h-4" />
              Lock Screen
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">Esc</kbd> twice to skip
          </p>
        </div>
      </div>

      {/* Sparkle decorations */}
      <Sparkles className="absolute top-1/4 left-1/4 w-6 h-6 text-violet-300 animate-pulse-soft" />
      <Sparkles className="absolute top-1/3 right-1/3 w-4 h-4 text-pink-300 animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
      <Sparkles className="absolute bottom-1/3 right-1/4 w-5 h-5 text-blue-300 animate-pulse-soft" style={{ animationDelay: '1s' }} />
    </div>
  );
}
