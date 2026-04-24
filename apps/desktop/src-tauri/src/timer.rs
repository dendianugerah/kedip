//! Timer loop and phase transitions.

use std::sync::Arc;
use std::time::Duration;
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
        std::thread::sleep(Duration::from_millis(1000));

        let paused = *state.is_paused.lock().unwrap();

        let current_state = {
            let mut timer = state.timer.lock().unwrap();

            if !paused {
                if timer.time_remaining_ms >= 1000 {
                    timer.time_remaining_ms -= 1000;
                } else {
                    timer.time_remaining_ms = 0;
                }
            }

            if !paused
                && timer.phase == TimerPhase::Working
                && timer.time_remaining_ms <= WARNING_THRESHOLD_MS
            {
                let mut shown = state.notification_shown.lock().unwrap();
                if !*shown {
                    *shown = true;
                    let app_clone = app.clone();
                    let time = timer.time_remaining_ms;
                    let _ = app.run_on_main_thread(move || {
                        windows::show_notification(&app_clone, time);
                    });
                }
            }

            if timer.time_remaining_ms == 0 {
                match timer.phase {
                    TimerPhase::Working => {
                        *state.notification_shown.lock().unwrap() = false;
                        timer.phase = TimerPhase::Break;
                        timer.time_remaining_ms = timer.break_duration_ms;
                    }
                    TimerPhase::Break => {
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                    }
                }
            }

            timer.clone()
        };

        let _ = app.emit("timer-update", &current_state);

        if current_state.time_remaining_ms == 0 {
            let app_for_closure = app.clone();
            match current_state.phase {
                TimerPhase::Break => {
                    let a = app_for_closure.clone();
                    let _ = app_for_closure.run_on_main_thread(move || {
                        windows::close_notification(&a);
                        windows::show_break(&a, current_state.break_duration_ms);
                    });
                }
                TimerPhase::Working => {
                    let a = app_for_closure.clone();
                    let _ = app_for_closure.run_on_main_thread(move || {
                        windows::close_break(&a);
                    });
                }
            }
        }

        update_tray_title(
            &app,
            paused,
            current_state.phase,
            current_state.time_remaining_ms,
        );
    });
}
