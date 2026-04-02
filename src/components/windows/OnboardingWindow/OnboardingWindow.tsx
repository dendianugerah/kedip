import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence, motion } from "motion/react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";

const WORK_OPTIONS = [
  { label: "5m", value: 5 },
  { label: "10m", value: 10 },
  { label: "20m", value: 20 },
  { label: "25m", value: 25 },
  { label: "50m", value: 50 },
];

const BREAK_OPTIONS = [
  { label: "15s", value: 15 },
  { label: "20s", value: 20 },
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
];

export function OnboardingWindow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await invoke("complete_onboarding", {
      workDurationMs: workMinutes * 60 * 1000,
      breakDurationMs: breakSeconds * 1000,
    });
  };

  const breakLabel =
    breakSeconds >= 60 ? `${Math.floor(breakSeconds / 60)} min` : `${breakSeconds}s`;

  return (
    <div className="w-full h-full bg-[#111110] flex flex-col font-sans select-none overflow-hidden">
      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5 pt-6 pb-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`rounded-full transition-all duration-300 ${
              s <= step ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step1"
            className="flex-1 flex flex-col items-center justify-center px-8 pb-8 gap-6 text-center"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 rounded-3xl bg-white/[0.06] flex items-center justify-center">
              <Eye className="w-10 h-10 text-white/60" />
            </div>

            <div className="space-y-2.5">
              <h1 className="text-2xl font-semibold text-white tracking-tight leading-snug">
                Your eyes deserve
                <br />a break
              </h1>
              <p className="text-[13px] text-white/40 leading-relaxed max-w-[260px] mx-auto">
                Kedip reminds you to rest your eyes regularly using the 20-20-20 rule.
              </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 text-center">
              {(
                [
                  ["20", "min work"],
                  ["20", "ft away"],
                  ["20", "sec break"],
                ] as [string, string][]
              ).map(([n, l]) => (
                <div key={l} className="py-3.5 rounded-xl bg-white/[0.06]">
                  <p className="text-xl font-semibold text-white">{n}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            <Button
              variant="white"
              onClick={() => setStep(2)}
              className="w-full py-3 text-sm font-semibold"
            >
              Get Started →
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            className="flex-1 flex flex-col px-6 pt-2 pb-6 gap-5"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div>
              <p className="text-white text-base font-semibold">Set your schedule</p>
              <p className="text-white/40 text-[12px] mt-0.5">You can always change this later.</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                Work Duration
              </p>
              <div className="flex gap-1.5">
                {WORK_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={workMinutes === opt.value ? "white" : "ghost"}
                    onClick={() => setWorkMinutes(opt.value)}
                    className={`flex-1 py-2.5 h-auto rounded-xl text-[12px] font-medium ${
                      workMinutes === opt.value
                        ? ""
                        : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10] hover:text-white/70"
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                Break Duration
              </p>
              <div className="flex gap-1.5">
                {BREAK_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={breakSeconds === opt.value ? "white" : "ghost"}
                    onClick={() => setBreakSeconds(opt.value)}
                    className={`flex-1 py-2.5 h-auto rounded-xl text-[12px] font-medium ${
                      breakSeconds === opt.value
                        ? ""
                        : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10] hover:text-white/70"
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl px-4 py-3 flex items-start gap-3">
              <Eye className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/40 leading-relaxed">
                Every <span className="text-white/65">{workMinutes} min</span>, rest your eyes for{" "}
                <span className="text-white/65">{breakLabel}</span> to reduce eye strain.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <Button
                variant="white"
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold"
              >
                {loading ? "Starting..." : "Start Kedip"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full py-2 text-[12px] text-white/30 hover:text-white/50 hover:bg-transparent"
              >
                ← Back
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
