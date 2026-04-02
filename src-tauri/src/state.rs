//! Application state management.

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;

const DEFAULT_WORK_DURATION_MS: u64 = 20 * 60 * 1000;
const DEFAULT_BREAK_DURATION_MS: u64 = 20 * 1000;

#[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
pub enum TimerPhase {
    Working,
    Break,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub phase: TimerPhase,
    pub time_remaining_ms: u64,
    pub work_duration_ms: u64,
    pub break_duration_ms: u64,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            phase: TimerPhase::Working,
            time_remaining_ms: DEFAULT_WORK_DURATION_MS,
            work_duration_ms: DEFAULT_WORK_DURATION_MS,
            break_duration_ms: DEFAULT_BREAK_DURATION_MS,
        }
    }
}

pub struct AppState {
    pub timer: Mutex<TimerState>,
    pub last_tick: Mutex<Instant>,
    pub is_paused: Mutex<bool>,
    pub notification_shown: Mutex<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            timer: Mutex::new(TimerState::default()),
            last_tick: Mutex::new(Instant::now()),
            is_paused: Mutex::new(false),
            notification_shown: Mutex::new(false),
        }
    }
}
