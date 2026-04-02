import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence, motion } from "motion/react";

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
    <div className="w-full h-full bg-[#0A0A0A] flex flex-col font-sans select-none overflow-hidden text-white">
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step1"
            className="flex-1 flex"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Left — headline */}
            <div className="flex-1 flex flex-col justify-between px-10 py-9">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.25em]">
                Kedip
              </p>

              <div>
                <h1 className="text-[52px] font-semibold tracking-tight leading-[1.05] text-white">
                  Look up,
                  <br />
                  every 20
                  <br />
                  minutes.
                </h1>
                <p className="mt-5 text-[13px] text-white/35 leading-relaxed max-w-[200px]">
                  The 20-20-20 rule. A small habit that protects your eyes over a lifetime.
                </p>
              </div>

              <Button
                variant="white"
                onClick={() => setStep(2)}
                className="w-full py-3 text-[13px] font-semibold"
              >
                Get Started →
              </Button>
            </div>

            {/* Right — stats */}
            <div className="w-[210px] flex-shrink-0 border-l border-white/[0.06] flex flex-col divide-y divide-white/[0.06]">
              {(
                [
                  ["20", "minutes", "of focused work"],
                  ["20", "feet", "look that far away"],
                  ["20", "seconds", "of eye rest"],
                ] as [string, string, string][]
              ).map(([num, unit, desc]) => (
                <div key={unit} className="flex-1 flex flex-col justify-center px-7">
                  <p className="text-[44px] font-extralight text-white tabular-nums leading-none">
                    {num}
                  </p>
                  <p className="text-[13px] font-medium text-white/60 mt-2">{unit}</p>
                  <p className="text-[11px] text-white/20 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            className="flex-1 flex flex-col px-10 py-9 gap-7"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div>
              <h2 className="text-[28px] font-semibold tracking-tight leading-tight">
                Set your rhythm
              </h2>
              <p className="text-[13px] text-white/30 mt-1.5">
                You can change this any time from settings.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.2em] mb-3">
                  Work Duration
                </p>
                <div className="flex gap-2">
                  {WORK_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={workMinutes === opt.value ? "white" : "ghost"}
                      onClick={() => setWorkMinutes(opt.value)}
                      className={`flex-1 py-3 h-auto rounded-xl text-[13px] font-medium ${
                        workMinutes === opt.value
                          ? ""
                          : "bg-white/[0.05] text-white/35 hover:bg-white/10 hover:text-white/70"
                      }`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.2em] mb-3">
                  Break Duration
                </p>
                <div className="flex gap-2">
                  {BREAK_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={breakSeconds === opt.value ? "white" : "ghost"}
                      onClick={() => setBreakSeconds(opt.value)}
                      className={`flex-1 py-3 h-auto rounded-xl text-[13px] font-medium ${
                        breakSeconds === opt.value
                          ? ""
                          : "bg-white/[0.05] text-white/35 hover:bg-white/10 hover:text-white/70"
                      }`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-auto border-t border-white/[0.06] pt-5 flex items-center justify-between">
                <p className="text-[12px] text-white/25">
                  Work <span className="text-white/55">{workMinutes}m</span>{" "}
                  <span className="text-white/15">→</span> rest{" "}
                  <span className="text-white/55">{breakLabel}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-[12px] text-white/25 hover:text-white/50 hover:bg-transparent px-3 py-2 h-auto"
                  >
                    ← Back
                  </Button>
                  <Button
                    variant="white"
                    onClick={handleComplete}
                    disabled={loading}
                    className="px-6 py-2.5 h-auto text-[13px] font-semibold"
                  >
                    {loading ? "Starting…" : "Start Kedip"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
