//! Timer loop and phase transitions.

use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use crate::state::{AppState, TimerPhase};
use crate::windows;

const WARNING_THRESHOLD_MS: u64 = 30_000;

fn format_time(ms: u64) -> String {
    let total_seconds = ms / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}", minutes, seconds)
}

pub fn update_tray_title(app: &AppHandle, paused: bool, phase: TimerPhase, time_remaining_ms: u64) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = if paused {
            "⏸".to_string()
        } else {
            match phase {
                TimerPhase::Working => format_time(time_remaining_ms),
                TimerPhase::Break => format!("😌 {}", format_time(time_remaining_ms)),
            }
        };
        let _ = tray.set_title(Some(&title));
    }
}

pub fn start_loop(app: AppHandle, state: Arc<AppState>) {
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(100));

        let paused = *state.is_paused.lock().unwrap();
        if paused {
            let timer = state.timer.lock().unwrap();
            update_tray_title(&app, true, timer.phase, timer.time_remaining_ms);
            continue;
        }

        let elapsed = {
            let mut last_tick = state.last_tick.lock().unwrap();
            let now = Instant::now();
            let elapsed = now.duration_since(*last_tick);
            *last_tick = now;
            elapsed.as_millis() as u64
        };

        let mut timer = state.timer.lock().unwrap();

        if timer.time_remaining_ms > elapsed {
            timer.time_remaining_ms -= elapsed;
        } else {
            timer.time_remaining_ms = 0;
        }

        let phase = timer.phase;
        let time_remaining = timer.time_remaining_ms;
        let break_duration = timer.break_duration_ms;
        let work_duration = timer.work_duration_ms;

        if phase == TimerPhase::Working && time_remaining <= WARNING_THRESHOLD_MS {
            let mut shown = state.notification_shown.lock().unwrap();
            if !*shown {
                *shown = true;
                let app_clone = app.clone();
                let _ = app.run_on_main_thread(move || {
                    windows::show_notification(&app_clone, time_remaining);
                });
            }
        }

        if time_remaining == 0 {
            match phase {
                TimerPhase::Working => {
                    timer.phase = TimerPhase::Break;
                    timer.time_remaining_ms = break_duration;
                    *state.notification_shown.lock().unwrap() = false;

                    let app_clone = app.clone();
                    let _ = app.run_on_main_thread(move || {
                        windows::close_notification(&app_clone);
                        windows::show_break(&app_clone, break_duration);
                    });
                }
                TimerPhase::Break => {
                    timer.phase = TimerPhase::Working;
                    timer.time_remaining_ms = work_duration;

                    let app_clone = app.clone();
                    let _ = app.run_on_main_thread(move || {
                        windows::close_break(&app_clone);
                    });
                }
            }
        }

        let current_state = timer.clone();
        drop(timer);

        let _ = app.emit("timer-update", &current_state);
        update_tray_title(&app, false, phase, time_remaining);
    });
}
