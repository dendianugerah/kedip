//! Application state management.
//!
//! This module contains the core state structures for the Kedip timer,
//! including the timer phase, duration settings, and synchronization primitives.

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Instant;

/// Represents the current phase of the break timer cycle.
#[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
pub enum TimerPhase {
    /// Timer is idle, not actively counting
    Idle,
    /// User is working, counting down to next break
    Working,
    /// Break is approaching, showing countdown notification
    Countdown,
    /// User is on a break
    Break,
}

/// The current state of the timer, including phase and duration settings.
#[derive(Clone, Serialize, Deserialize)]
pub struct TimerState {
    /// Current phase of the timer
    pub phase: TimerPhase,
    /// Time remaining in current phase (milliseconds)
    pub time_remaining_ms: u64,
    /// Duration of work sessions (milliseconds)
    pub work_duration_ms: u64,
    /// Duration of breaks (milliseconds)
    pub break_duration_ms: u64,
    /// Duration of countdown warning before break (milliseconds)
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

/// Global application state shared across the app.
///
/// Uses `Mutex` for thread-safe access from the timer thread
/// and Tauri command handlers.
pub struct AppState {
    /// The current timer state
    pub timer: Mutex<TimerState>,
    /// Last time the timer was updated (for calculating elapsed time)
    pub last_tick: Mutex<Instant>,
    /// Whether the timer is paused
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

/// Formats milliseconds into a MM:SS string.
pub fn format_time(ms: u64) -> String {
    let total_seconds = ms / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}", minutes, seconds)
}
