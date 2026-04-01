//! Tauri command handlers.
//!
//! This module contains all the commands that can be invoked from
//! the frontend JavaScript/TypeScript code.

use std::sync::Arc;
use std::time::Instant;
use tauri::AppHandle;

use crate::state::{AppState, TimerPhase, TimerState};
use crate::windows;

/// Gets the current timer state.
#[tauri::command]
pub fn get_timer_state(state: tauri::State<'_, Arc<AppState>>) -> TimerState {
    state.timer.lock().unwrap().clone()
}

/// Skips the current break or countdown and returns to working phase.
#[tauri::command]
pub fn skip_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_break(&app);
    windows::close_notification(&app);

    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = timer.work_duration_ms;
    *state.last_tick.lock().unwrap() = Instant::now();
}

/// Snoozes the upcoming break by 5 minutes.
#[tauri::command]
pub fn snooze_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_notification(&app);

    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = 5 * 60 * 1000; // 5 minutes
    *state.last_tick.lock().unwrap() = Instant::now();
}

/// Starts a break immediately.
#[tauri::command]
pub fn start_break_now(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_notification(&app);

    timer.phase = TimerPhase::Break;
    timer.time_remaining_ms = timer.break_duration_ms;
    *state.last_tick.lock().unwrap() = Instant::now();

    windows::show_break(&app, timer.time_remaining_ms);
}

/// Toggles the pause state of the timer.
///
/// Returns the new paused state (true if now paused, false if resumed).
#[tauri::command]
pub fn toggle_pause(state: tauri::State<'_, Arc<AppState>>) -> bool {
    let mut paused = state.is_paused.lock().unwrap();
    *paused = !*paused;

    // Reset last_tick when unpausing to avoid big time jumps
    if !*paused {
        *state.last_tick.lock().unwrap() = Instant::now();
    }

    *paused
}

/// Updates the timer settings.
///
/// If currently in working or idle phase, the timer will be reset
/// with the new work duration.
#[tauri::command]
pub fn update_settings(
    state: tauri::State<'_, Arc<AppState>>,
    work_duration_ms: u64,
    break_duration_ms: u64,
    countdown_duration_ms: u64,
) {
    let mut timer = state.timer.lock().unwrap();

    timer.work_duration_ms = work_duration_ms;
    timer.break_duration_ms = break_duration_ms;
    timer.countdown_duration_ms = countdown_duration_ms;

    // Reset timer with new work duration if currently working
    if timer.phase == TimerPhase::Working || timer.phase == TimerPhase::Idle {
        timer.time_remaining_ms = timer.work_duration_ms;
        timer.phase = TimerPhase::Working;
    }
}

/// Locks the screen (macOS only).
///
/// Uses the `pmset displaysleepnow` command to turn off the display.
#[tauri::command]
pub fn lock_screen() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("pmset")
            .args(["displaysleepnow"])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("rundll32.exe")
            .args(["user32.dll,LockWorkStation"])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try different screen lockers
        let lockers = [
            "xdg-screensaver lock",
            "gnome-screensaver-command -l",
            "xscreensaver-command -lock",
        ];
        for locker in lockers {
            if std::process::Command::new("sh")
                .args(["-c", locker])
                .spawn()
                .is_ok()
            {
                break;
            }
        }
    }

    Ok(())
}

/// Adds extra time to the current break.
#[tauri::command]
pub fn add_break_time(state: tauri::State<'_, Arc<AppState>>, extra_ms: u64) {
    let mut timer = state.timer.lock().unwrap();

    if timer.phase == TimerPhase::Break {
        timer.time_remaining_ms += extra_ms;
    }
}
