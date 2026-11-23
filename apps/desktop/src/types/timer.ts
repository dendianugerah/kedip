export type TimerPhase = "Working" | "Break";

export interface TimerState {
  phase: TimerPhase;
  time_remaining_ms: number;
  phase_duration_ms: number;
  work_duration_ms: number;
  break_duration_ms: number;
  is_paused: boolean;
}

export interface Preset {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  workMs: number;
  breakMs: number;
  desc: string;
}
