//! Timer loop and phase transitions.

use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use crate::state::{format_time, AppState, TimerPhase};
use crate::windows;

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

        let current_state = timer.clone();
        let phase = timer.phase;
        let time_remaining = timer.time_remaining_ms;
        drop(timer);

        let _ = app.emit("timer-update", &current_state);
        update_tray_title(&app, false, phase, time_remaining);
    });
}
