//! Timer loop and phase transitions.

use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

use crate::state::{AppState, Reminder, TimerPhase};
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

fn check_reminders(app: &AppHandle, _state: &Arc<AppState>, elapsed_ms: u64) {
    let reminders: Vec<Reminder> = _state.reminder.reminders.lock().unwrap().clone();
    for reminder in reminders {
        if !reminder.enabled {
            continue;
        }
        let interval_ms = reminder.interval_ms();
        if interval_ms == 0 {
            continue;
        }
        // Fire when elapsed time has reached and is a multiple of the interval.
        if elapsed_ms >= interval_ms && elapsed_ms % interval_ms == 0 {
            let name = reminder.name.clone();
            let message = reminder.message.clone();
            let closure_app = app.clone();
            let _ = app.clone().run_on_main_thread(move || {
                windows::show_reminder(&closure_app, &name, &message);
            });
        }
    }
}

pub fn start_loop(app: AppHandle, state: Arc<AppState>) {
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(1000));

        let paused = *state.is_paused.lock().unwrap();

        let mut phase_just_transitioned = false;

        let current_state: Option<crate::state::TimerState> = 'tick: {
            let mut timer = state.timer.lock().unwrap();
            let phase_before_tick = timer.phase;

            if !paused {
                if timer.time_remaining_ms >= 1000 {
                    timer.time_remaining_ms -= 1000;
                } else {
                    timer.time_remaining_ms = 0;
                }

                if timer.phase == TimerPhase::Working {
                    *state.reminder.elapsed_work_ms.lock().unwrap() += 1000;
                }
            }

            // Phase transitions happen when the timer hits zero.
            if timer.time_remaining_ms == 0 {
                match timer.phase {
                    TimerPhase::Working => {
                        *state.notification_shown.lock().unwrap() = false;
                        timer.phase = TimerPhase::Break;
                        timer.time_remaining_ms = timer.break_duration_ms;
                    }
                    TimerPhase::Break => {
                        *state.reminder.elapsed_work_ms.lock().unwrap() = 0;
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                    }
                }
                phase_just_transitioned = phase_before_tick != timer.phase;
            }

            let phase_now = timer.phase;

            // Check enabled reminders every tick during Working phase.
            if !paused && phase_now == TimerPhase::Working {
                let elapsed = *state.reminder.elapsed_work_ms.lock().unwrap();
                let time_now = timer.time_remaining_ms;
                let phase_now_inner = timer.phase;
                drop(timer);
                check_reminders(&app, &state, elapsed);
                let timer = state.timer.lock().unwrap();
                let phase_after = timer.phase;
                let time_after = timer.time_remaining_ms;
                drop(timer);
                // If state changed while we dropped the lock, skip the rest.
                if phase_after != phase_now_inner || time_after != time_now {
                    if phase_just_transitioned {
                        let a = app.clone();
                        let _ = a.clone().run_on_main_thread(move || {
                            let handle = a.clone();
                            windows::close_reminder(&handle);
                        });
                    }
                    break 'tick None;
                }
                let timer_guard = state.timer.lock().unwrap();
                let timer_val = timer_guard.clone();

                // Show pre-break warning notification.
                if timer_guard.time_remaining_ms <= WARNING_THRESHOLD_MS {
                    let mut shown = state.notification_shown.lock().unwrap();
                    if !*shown {
                        *shown = true;
                        let a = app.clone();
                        let time = timer_guard.time_remaining_ms;
                        drop(timer_guard);
                        drop(shown);
                        let _ = a.clone().run_on_main_thread(move || {
                            let handle = a.clone();
                            windows::show_notification(&handle, time);
                        });
                    }
                }

                break 'tick Some(timer_val);
            }

            break 'tick Some(timer.clone());
        };

        // If we returned early above (state changed mid-tick), go to next iteration.
        let Some(timer_state) = current_state else {
            continue;
        };

        let _ = app.emit("timer-update", &timer_state);

        if timer_state.time_remaining_ms == 0 {
            let a = app.clone();
            match timer_state.phase {
                TimerPhase::Break => {
                    let _ = a.clone().run_on_main_thread(move || {
                        let handle = a.clone();
                        windows::close_notification(&handle);
                        windows::show_break(&handle, timer_state.break_duration_ms);
                    });
                }
                TimerPhase::Working => {
                    let _ = a.clone().run_on_main_thread(move || {
                        let handle = a.clone();
                        windows::close_break(&handle);
                    });
                }
            }
        }

        update_tray_title(
            &app,
            paused,
            timer_state.phase,
            timer_state.time_remaining_ms,
        );
    });
}
