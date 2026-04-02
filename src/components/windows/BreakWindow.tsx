import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Plus, X } from "lucide-react";

import { Button, BlobOne, BlobTwo, BlobThree } from "@/components/ui";
import { useZenMode, useEscapeSkip } from "@/hooks";
import { formatSeconds } from "@/lib/format";
import type { TimerState } from "@/types/timer";

export function BreakWindow() {
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [isComplete, setIsComplete] = useState(false);
  const isZenMode = useZenMode({ delay: 3000 });
  const escCount = useEscapeSkip({ requiredPresses: 2, timeout: 1000 });

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

  const addTime = () => {
    invoke("add_break_time", { seconds: 60 });
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
      className={`min-h-screen w-full bg-[#F9F8F4] relative overflow-hidden flex items-center justify-center selection:bg-[#EAE6DF] select-none transition-[cursor] duration-700 ${isZenMode ? "cursor-none" : "cursor-default"}`}
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
            {formatSeconds(timeRemaining)}
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
                <Button variant="secondary" size="lg" onClick={addTime}>
                  <Plus className="w-4 h-4" />1 Min
                </Button>
                <Button variant="outline" size="lg" onClick={handleSkip}>
                  <X className="w-4 h-4" />
                  Skip
                </Button>
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
