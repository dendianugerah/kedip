import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { OnboardingStepContainer } from "./OnboardingStepContainer";

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
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
    <div className="w-full h-full bg-[#0A0A0A] flex flex-col font-sans select-none overflow-hidden text-white pt-10">
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <OnboardingStepContainer key="step1" className="flex-1 flex">
            <div className="flex-1 flex flex-col justify-between px-10 pb-9 pt-4">
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
          </OnboardingStepContainer>
        )}

        {step === 2 && (
          <OnboardingStepContainer
            key="step2"
            onBack={() => setStep(1)}
            info={
              <>
                Work <span className="text-white/55">{workMinutes}m</span>{" "}
                <span className="text-white/15">→</span> rest{" "}
                <span className="text-white/55">{breakLabel}</span>
              </>
            }
            primaryLabel="Next →"
            onPrimary={() => setStep(3)}
          >
            <div className="mb-5">
              <h2 className="text-[28px] font-semibold tracking-tight leading-tight">
                Set your rhythm
              </h2>
              <p className="text-[13px] text-white/30 mt-1.5">
                You can change this any time from settings.
              </p>
            </div>

            <div className="flex flex-col gap-5">
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
            </div>
          </OnboardingStepContainer>
        )}

        {step === 3 && (
          <OnboardingStepContainer
            key="step3"
            onBack={() => setStep(2)}
            primaryLabel={loading ? "Starting\u2026" : "Got it, show me"}
            onPrimary={handleComplete}
            primaryDisabled={loading}
          >
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div>
                <h2 className="text-[28px] font-semibold tracking-tight leading-tight">
                  Quick demo first.
                </h2>
                <p className="text-[13px] text-white/40 mt-2 leading-relaxed max-w-l">
                  In about 10 seconds you’ll see a notification banner — that’s Kedip reminding you
                  to wrap up.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {(
                  [
                    ["1", "Notification appears — choose to break now, snooze, or skip."],
                    ["2", "Screen dims for your break. Look 20 feet away."],
                    ["3", "Break ends. Kedip resets and your real timer starts."],
                  ] as [string, string][]
                ).map(([num, desc]) => (
                  <div key={num} className="flex items-start gap-3">
                    <span className="text-[11px] font-semibold text-white/25 w-4 mt-0.5 flex-shrink-0">
                      {num}
                    </span>
                    <p className="text-[13px] text-white/60 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col gap-2.5">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em]">
                  When the notification appears
                </p>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      ["Space", "Start break now"],
                      ["S", "Snooze 5 minutes"],
                      ["Esc", "Skip"],
                    ] as [string, string][]
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[12px] text-white/50">{label}</span>
                      <Kbd>{key}</Kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </OnboardingStepContainer>
        )}
      </AnimatePresence>
    </div>
  );
}
