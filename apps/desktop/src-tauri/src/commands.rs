//! Tauri command handlers.

use std::sync::Arc;
use std::time::Instant;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_store::StoreExt;

use crate::state::{AppState, Reminder, TimerPhase, TimerState};
use crate::windows;

const DEMO_COUNTDOWN_MS: u64 = 40_000;

#[tauri::command]
pub fn get_timer_state(state: tauri::State<'_, Arc<AppState>>) -> TimerState {
    state.timer.lock().unwrap().clone()
}

#[tauri::command]
pub fn skip_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();

    windows::close_break(&app);
    windows::close_notification(&app);
    windows::close_reminder(&app);

    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = timer.work_duration_ms;
    *state.notification_shown.lock().unwrap() = false;
    *state.last_tick.lock().unwrap() = Instant::now();
    drop(timer);

    reset_reminder_elapsed(&state);
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

    let break_duration = timer.time_remaining_ms;
    drop(timer);

    let app_clone = app.clone();
    let _ = app.run_on_main_thread(move || {
        windows::show_break(&app_clone, break_duration);
    });
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
pub fn is_onboarding_complete(app: AppHandle) -> bool {
    if let Ok(store) = app.store("kedip.json") {
        store
            .get("onboarding_complete")
            .and_then(|v| v.as_bool())
            .unwrap_or(false)
    } else {
        false
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
            timer.time_remaining_ms = DEMO_COUNTDOWN_MS;
        }
    }

    if let Ok(store) = app.store("kedip.json") {
        store.set("work_duration_ms", serde_json::json!(work_duration_ms));
        store.set("break_duration_ms", serde_json::json!(break_duration_ms));
        store.set("onboarding_complete", serde_json::json!(true));
        let _ = store.save();
    }

    // Tell the frontend to switch views — no window operations needed.
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.emit("onboarding-complete", ());
    }
}

#[tauri::command]
pub fn get_reminders(state: tauri::State<'_, Arc<AppState>>) -> Vec<Reminder> {
    state.reminder.reminders.lock().unwrap().clone()
}

#[tauri::command]
pub fn add_reminder(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
    name: String,
    message: String,
    interval_min: u32,
) -> Reminder {
    let id = {
        let mut next_id = state.reminder.next_id.lock().unwrap();
        let id = *next_id;
        *next_id += 1;
        id
    };

    let reminder = Reminder {
        id,
        name,
        message,
        interval_min,
        enabled: true,
    };

    state
        .reminder
        .reminders
        .lock()
        .unwrap()
        .push(reminder.clone());
    drop_reminders_to_store(&app, &state);
    reminder
}

#[tauri::command]
pub fn update_reminder(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppState>>,
    id: u32,
    name: String,
    message: String,
    interval_min: u32,
    enabled: bool,
) {
    let mut reminders = state.reminder.reminders.lock().unwrap();
    if let Some(r) = reminders.iter_mut().find(|r| r.id == id) {
        r.name = name;
        r.message = message;
        r.interval_min = interval_min;
        r.enabled = enabled;
    }
    drop(reminders);
    drop_reminders_to_store(&app, &state);
}

#[tauri::command]
pub fn delete_reminder(app: AppHandle, state: tauri::State<'_, Arc<AppState>>, id: u32) {
    let mut reminders = state.reminder.reminders.lock().unwrap();
    reminders.retain(|r| r.id != id);
    drop(reminders);
    drop_reminders_to_store(&app, &state);
}

#[tauri::command]
pub fn toggle_reminder(app: AppHandle, state: tauri::State<'_, Arc<AppState>>, id: u32) -> bool {
    let mut reminders = state.reminder.reminders.lock().unwrap();
    let enabled = if let Some(r) = reminders.iter_mut().find(|r| r.id == id) {
        r.enabled = !r.enabled;
        r.enabled
    } else {
        return false;
    };
    drop(reminders);
    drop_reminders_to_store(&app, &state);
    enabled
}

fn reset_reminder_elapsed(state: &Arc<AppState>) {
    *state.reminder.elapsed_work_ms.lock().unwrap() = 0;
}

fn drop_reminders_to_store(app: &AppHandle, state: &Arc<AppState>) {
    let reminders = state.reminder.reminders.lock().unwrap();
    if let Ok(store) = app.store("kedip.json") {
        let json: Vec<serde_json::Value> = reminders
            .iter()
            .map(|r| serde_json::to_value(r).unwrap())
            .collect();
        store.set("reminders", serde_json::json!(json));
        let _ = store.save();
    }
}
