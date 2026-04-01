//! Timer loop and phase transition logic.
//!
//! This module contains the main timer loop that runs in a background thread,
//! updating the timer state and triggering phase transitions.

use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use crate::state::{format_time, AppState, TimerPhase};
use crate::windows;

/// Updates the system tray title with the current timer state.
pub fn update_tray_title(app: &AppHandle, paused: bool, phase: TimerPhase, time_remaining_ms: u64) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = if paused {
            "⏸".to_string()
        } else {
            match phase {
                TimerPhase::Idle => "👁".to_string(),
                TimerPhase::Working => format_time(time_remaining_ms),
                TimerPhase::Countdown => format!("⚠️ {}", format_time(time_remaining_ms)),
                TimerPhase::Break => format!("😌 {}", format_time(time_remaining_ms)),
            }
        };
        let _ = tray.set_title(Some(&title));
    }
}

/// Starts the main timer loop in a background thread.
///
/// This loop:
/// - Runs every 100ms
/// - Updates the timer countdown
/// - Handles phase transitions (Working → Countdown → Break → Working)
/// - Emits state updates to all windows
/// - Updates the system tray title
pub fn start_loop(app: AppHandle, state: Arc<AppState>) {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(Duration::from_millis(100));

            let paused = *state.is_paused.lock().unwrap();
            
            // When paused, just update tray and continue
            if paused {
                let timer = state.timer.lock().unwrap();
                update_tray_title(&app, true, timer.phase, timer.time_remaining_ms);
                continue;
            }

            // Calculate elapsed time since last tick
            let elapsed = {
                let mut last_tick = state.last_tick.lock().unwrap();
                let now = Instant::now();
                let elapsed = now.duration_since(*last_tick);
                *last_tick = now;
                elapsed.as_millis() as u64
            };

            let mut timer = state.timer.lock().unwrap();

            // Update time remaining
            if timer.time_remaining_ms > elapsed {
                timer.time_remaining_ms -= elapsed;
            } else {
                timer.time_remaining_ms = 0;
            }

            // Handle phase transitions when time runs out
            if timer.time_remaining_ms == 0 {
                match timer.phase {
                    TimerPhase::Idle => {
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                    }
                    TimerPhase::Working => {
                        timer.phase = TimerPhase::Countdown;
                        timer.time_remaining_ms = timer.countdown_duration_ms;
                        windows::show_notification(&app, timer.time_remaining_ms);
                    }
                    TimerPhase::Countdown => {
                        timer.phase = TimerPhase::Break;
                        timer.time_remaining_ms = timer.break_duration_ms;
                        windows::show_break(&app, timer.time_remaining_ms);
                    }
                    TimerPhase::Break => {
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                        windows::close_break(&app);
                    }
                }
            }

            // Clone state for emitting (to release lock)
            let current_state = timer.clone();
            let phase = timer.phase;
            let time_remaining = timer.time_remaining_ms;
            drop(timer);

            // Emit state updates to all windows
            let _ = app.emit("timer-update", &current_state);
            
            // Update tray title
            update_tray_title(&app, false, phase, time_remaining);
        }
    });
}
