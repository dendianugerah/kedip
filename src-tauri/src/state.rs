//! Application state management.

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;

#[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
pub enum TimerPhase {
    Idle,
    Working,
    Countdown,
    Break,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub phase: TimerPhase,
    pub time_remaining_ms: u64,
    pub work_duration_ms: u64,
    pub break_duration_ms: u64,
    pub countdown_duration_ms: u64,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            phase: TimerPhase::Working,
            time_remaining_ms: 20 * 60 * 1000, // 20 minutes
            work_duration_ms: 20 * 60 * 1000,  // 20 minutes
            break_duration_ms: 20 * 1000,      // 20 seconds
            countdown_duration_ms: 30 * 1000,  // 30 seconds
        }
    }
}

pub struct AppState {
    pub timer: Mutex<TimerState>,
    pub last_tick: Mutex<Instant>,
    pub is_paused: Mutex<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            timer: Mutex::new(TimerState::default()),
            last_tick: Mutex::new(Instant::now()),
            is_paused: Mutex::new(false),
        }
    }
}

pub fn format_time(ms: u64) -> String {
    let total_seconds = ms / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}", minutes, seconds)
}
