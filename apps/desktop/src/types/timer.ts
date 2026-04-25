export type TimerPhase = "Working" | "Break";

export interface TimerState {
  phase: TimerPhase;
  time_remaining_ms: number;
  work_duration_ms: number;
  break_duration_ms: number;
}

export interface Preset {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  workMs: number;
  breakMs: number;
  desc: string;
}

export interface Reminder {
  id: number;
  name: string;
  message: string;
  interval_min: number;
  enabled: boolean;
}
