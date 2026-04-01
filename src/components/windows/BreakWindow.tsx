import { useEffect, useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Plus, X } from "lucide-react";

interface TimerState {
  phase: string;
  time_remaining_ms: number;
  break_duration_ms: number;
}

// Soft organic blob components
const BlobOne = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fill="currentColor"
      d="M45.7,-76.1C58.9,-69.3,69.1,-55.4,78.2,-40.8C87.3,-26.2,95.3,-10.9,94.1,3.8C92.9,18.5,82.5,32.6,71.2,44.7C59.9,56.8,47.7,66.9,33.8,74.1C19.9,81.3,4.3,85.6,-10.8,84.1C-25.9,82.6,-40.5,75.3,-53.4,65.6C-66.3,55.9,-77.5,43.8,-83.9,29.4C-90.3,15,-91.9,-1.7,-87.6,-16.6C-83.3,-31.5,-73.1,-44.6,-60.6,-54.2C-48.1,-63.8,-33.3,-69.9,-19.1,-73.4C-4.9,-76.9,8.7,-77.8,22.8,-76.3C36.9,-74.8,45.7,-76.1,45.7,-76.1Z"
      transform="translate(100 100) scale(1.1)"
    />
  </svg>
);

const BlobTwo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fill="currentColor"
      d="M39.9,-65.7C53.1,-58.5,66.2,-50.4,75.6,-38.7C85,-27,90.7,-11.7,89.5,3.1C88.3,17.9,80.2,32.2,69.6,43.5C59,54.8,45.9,63.1,31.9,69.5C17.9,75.9,3,80.4,-11.4,79.5C-25.8,78.6,-39.7,72.3,-51.7,62.8C-63.7,53.3,-73.8,40.6,-79.6,26.1C-85.4,11.6,-86.9,-4.7,-82.5,-19.3C-78.1,-33.9,-67.8,-46.8,-55.2,-55.1C-42.6,-63.4,-27.7,-67.1,-13.7,-68.8C0.3,-70.5,14.3,-70.2,26.7,-72.9C39.1,-75.6,39.9,-65.7,39.9,-65.7Z"
      transform="translate(100 100) scale(1.2) rotate(45)"
    />
  </svg>
);

const BlobThree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fill="currentColor"
      d="M44.7,-76.4C58.3,-69.2,70,-57.1,78.8,-43.1C87.6,-29.1,93.5,-13.2,92.1,2C90.7,17.2,82,31.7,71.5,43.9C61,56.1,48.7,66,34.8,73.1C20.9,80.2,5.4,84.5,-9.6,83.4C-24.6,82.3,-39.1,75.8,-51.3,66.1C-63.5,56.4,-73.4,43.5,-80.1,28.9C-86.8,14.3,-90.3,-2,-86.7,-16.5C-83.1,-31,-72.4,-43.7,-60,-53.6C-47.6,-63.5,-33.5,-70.6,-19.3,-74.6C-5.1,-78.6,9.2,-79.5,23.1,-77.6C37,-75.7,44.7,-76.4,44.7,-76.4Z"
      transform="translate(100 100) scale(1.1) rotate(-20)"
    />
  </svg>
);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function BreakWindow() {
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [escCount, setEscCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const zenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zen Mode: Hide controls after 3 seconds of inactivity
  const resetZenTimer = useCallback(() => {
    setIsZenMode(false);
    if (zenTimeoutRef.current) {
      clearTimeout(zenTimeoutRef.current);
    }
    zenTimeoutRef.current = setTimeout(() => {
      setIsZenMode(true);
    }, 3000);
  }, []);

  useEffect(() => {
    // Start zen timer on mount
    resetZenTimer();
    
    // Reset on any mouse movement or key press
    const handleActivity = () => resetZenTimer();
    
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      if (zenTimeoutRef.current) {
        clearTimeout(zenTimeoutRef.current);
      }
    };
  }, [resetZenTimer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = parseInt(params.get("time") || "20000");
    setTimeRemaining(Math.floor(time / 1000));

    const unlisten = listen<TimerState>("timer-update", (event) => {
      if (event.payload.phase === "Break") {
        const seconds = Math.floor(event.payload.time_remaining_ms / 1000);
        setTimeRemaining(seconds);
        if (seconds <= 0) {
          setIsComplete(true);
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Esc key logic - double tap to skip
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
    if (escCount >= 2) {
      invoke("skip_break");
      setEscCount(0);
    }
    if (escCount === 1) {
      const timer = setTimeout(() => setEscCount(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [escCount]);

  const addTime = () => {
    setTimeRemaining((prev) => prev + 60);
  };

  const handleSkip = () => {
    invoke("skip_break");
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen w-full bg-[#F9F8F4] flex flex-col items-center justify-center text-[#2A2A28] relative overflow-hidden select-none">
        <div className="absolute inset-0 pointer-events-none opacity-40 blur-3xl flex items-center justify-center">
          <BlobOne className="absolute w-[600px] h-[600px] text-[#D3E4CD]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-10"
        >
          <div className="w-16 h-16 bg-[#EAE6DF] text-[#2A2A28] rounded-full flex items-center justify-center mx-auto mb-6">
            <Wind className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight mb-4 italic">
            Gently return.
          </h1>
          <p className="text-lg text-[#7A7974] mb-10 font-sans">Your eyes are refreshed.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen w-full bg-[#F9F8F4] relative overflow-hidden flex items-center justify-center selection:bg-[#EAE6DF] select-none transition-[cursor] duration-700 ${isZenMode ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Ambient Background Blobs - Slow, breathing animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 0.95, 1],
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] text-[#D3E4CD] opacity-60 blur-2xl"
        >
          <BlobOne />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [1, 0.95, 1.05, 1],
            x: [0, -30, 30, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-40 w-[700px] h-[700px] text-[#F4D1B6] opacity-50 blur-2xl"
        >
          <BlobTwo />
        </motion.div>

        <motion.div
          animate={{
            rotate: [0, 20, -20, 0],
            scale: [1, 1.1, 0.9, 1],
            x: [0, 40, -40, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] text-[#D1E8E2] opacity-60 blur-2xl"
        >
          <BlobThree />
        </motion.div>
      </div>

      {/* Main Content - Centered & Minimal */}
      <div className="z-10 flex flex-col items-center text-center max-w-xl px-6 w-full">
        
        {/* Heading & Description - Fades in Zen Mode */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-serif font-normal tracking-tight text-[#2A2A28] mb-4 italic">
                Take a moment.
              </h1>
              <p className="text-lg md:text-xl text-[#7A7974] font-sans font-normal leading-relaxed">
                Look away from the screen. Focus on something distant and let your eyes rest.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown Timer - Scales up slightly in Zen Mode */}
        <motion.div
          animate={{
            scale: isZenMode ? 1.08 : 1,
            y: isZenMode ? -20 : 0,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="mb-16"
        >
          <div className="text-[100px] md:text-[140px] font-extralight text-[#2A2A28] tracking-tighter tabular-nums leading-none font-sans">
            {formatTime(timeRemaining)}
          </div>
        </motion.div>

        {/* Action Buttons - Fades in Zen Mode */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-4 mb-12">
                <button
                  onClick={addTime}
                  className="px-6 py-3 bg-[#EAE6DF] text-[#2A2A28] rounded-full font-medium hover:bg-[#DFDBD0] transition-colors flex items-center gap-2 font-sans"
                >
                  <Plus className="w-4 h-4" />
                  1 Min
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 border border-[#EAE6DF] text-[#7A7974] rounded-full font-medium hover:bg-white/50 hover:text-[#2A2A28] transition-colors flex items-center gap-2 font-sans"
                >
                  <X className="w-4 h-4" />
                  Skip
                </button>
              </div>

              {/* Hint Text */}
              <div
                className={`text-sm transition-colors duration-500 font-sans ${escCount > 0 ? "text-[#2A2A28]" : "text-[#A3A19C]"}`}
              >
                Double-tap{" "}
                <kbd className="px-2 py-0.5 bg-white/50 rounded border border-[#EAE6DF] font-sans text-xs mx-1">
                  ESC
                </kbd>{" "}
                to skip
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
