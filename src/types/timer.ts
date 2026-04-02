export type TimerPhase = "Idle" | "Working" | "Countdown" | "Break";

export interface TimerState {
  phase: TimerPhase;
  time_remaining_ms: number;
  work_duration_ms: number;
  break_duration_ms: number;
  countdown_duration_ms: number;
}

export interface TimerSettings {
  workDurationMs: number;
  breakDurationMs: number;
  countdownDurationMs: number;
}

export interface Preset {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  work: number;
  break: number;
  desc: string;
}
