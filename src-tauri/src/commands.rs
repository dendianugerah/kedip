//! Tauri command handlers.

use std::sync::Arc;
use std::time::Instant;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::state::{AppState, TimerPhase, TimerState};
use crate::windows;

#[tauri::command]
pub fn get_timer_state(state: tauri::State<'_, Arc<AppState>>) -> TimerState {
    state.timer.lock().unwrap().clone()
}

#[tauri::command]
pub fn skip_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_break(&app);
    windows::close_notification(&app);

    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = timer.work_duration_ms;
    *state.notification_shown.lock().unwrap() = false;
    *state.last_tick.lock().unwrap() = Instant::now();
}

#[tauri::command]
pub fn snooze_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>, minutes: Option<u64>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_notification(&app);

    let snooze_ms = minutes.unwrap_or(5) * 60 * 1000;
    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = snooze_ms;
    *state.notification_shown.lock().unwrap() = false;
    *state.last_tick.lock().unwrap() = Instant::now();
}

#[tauri::command]
pub fn start_break_now(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_notification(&app);

    timer.phase = TimerPhase::Break;
    timer.time_remaining_ms = timer.break_duration_ms;
    *state.notification_shown.lock().unwrap() = false;
    *state.last_tick.lock().unwrap() = Instant::now();

    windows::show_break(&app, timer.time_remaining_ms);
}

#[tauri::command]
pub fn toggle_pause(state: tauri::State<'_, Arc<AppState>>) -> bool {
    let mut paused = state.is_paused.lock().unwrap();
    *paused = !*paused;

    if !*paused {
        *state.last_tick.lock().unwrap() = Instant::now();
    }

    *paused
}

#[tauri::command]
pub fn update_settings(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
    work_duration_ms: u64,
    break_duration_ms: u64,
) {
    let mut timer = state.timer.lock().unwrap();
    timer.work_duration_ms = work_duration_ms;
    timer.break_duration_ms = break_duration_ms;
    if timer.phase == TimerPhase::Working {
        timer.time_remaining_ms = work_duration_ms;
    }
    drop(timer);

    if let Ok(store) = app.store("kedip.json") {
        store.set("work_duration_ms", serde_json::json!(work_duration_ms));
        store.set("break_duration_ms", serde_json::json!(break_duration_ms));
        let _ = store.save();
    }
}

#[tauri::command]
pub fn add_break_time(state: tauri::State<'_, Arc<AppState>>, extra_ms: u64) {
    let mut timer = state.timer.lock().unwrap();

    if timer.phase == TimerPhase::Break {
        timer.time_remaining_ms += extra_ms;
    }
}

#[tauri::command]
pub fn complete_onboarding(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
    work_duration_ms: u64,
    break_duration_ms: u64,
) {
    {
        let mut timer = state.timer.lock().unwrap();
        timer.work_duration_ms = work_duration_ms;
        timer.break_duration_ms = break_duration_ms;
        if timer.phase == TimerPhase::Working {
            timer.time_remaining_ms = work_duration_ms;
        }
    }

    if let Ok(store) = app.store("kedip.json") {
        store.set("work_duration_ms", serde_json::json!(work_duration_ms));
        store.set("break_duration_ms", serde_json::json!(break_duration_ms));
        store.set("onboarding_complete", serde_json::json!(true));
        let _ = store.save();
    }

    if let Some(onboarding) = app.get_webview_window("onboarding") {
        let _ = onboarding.destroy();
    }

    windows::show_settings(&app);
}
