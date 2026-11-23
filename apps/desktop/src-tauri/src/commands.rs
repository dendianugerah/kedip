//! Tauri command handlers.

use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

use crate::state::{AppState, TimerState};
use crate::timer::{self, Action};

pub fn setting_duration(ms: u64) -> Duration {
    Duration::from_millis(ms.clamp(1_000, 86_400_000))
}

#[tauri::command]
pub fn get_timer_state(state: tauri::State<'_, AppState>) -> TimerState {
    TimerState::new(&state.clock.lock().unwrap(), Instant::now())
}

#[tauri::command]
pub fn skip_break(app: AppHandle) {
    timer::send(&app, Action::Skip);
}

#[tauri::command]
pub fn snooze_break(app: AppHandle, minutes: Option<u64>) {
    timer::send(
        &app,
        Action::Snooze(Duration::from_secs(minutes.unwrap_or(5).clamp(1, 60) * 60)),
    );
}

#[tauri::command]
pub fn start_break_now(app: AppHandle) {
    timer::send(&app, Action::BreakNow);
}

#[tauri::command]
pub fn toggle_pause(app: AppHandle) {
    timer::send(&app, Action::TogglePause);
}

#[tauri::command]
pub fn add_break_time(app: AppHandle, extra_ms: u64) {
    timer::send(&app, Action::Extend(setting_duration(extra_ms)));
}

#[tauri::command]
pub fn is_onboarding_complete(app: AppHandle) -> bool {
    app.store("kedip.json")
        .ok()
        .and_then(|store| store.get("onboarding_complete"))
        .and_then(|value| value.as_bool())
        .unwrap_or(false)
}

fn save_schedule(
    app: &AppHandle,
    work: Duration,
    rest: Duration,
    demo: bool,
) -> Result<(), String> {
    let store = app.store("kedip.json").map_err(|err| err.to_string())?;
    store.set(
        "work_duration_ms",
        serde_json::json!(work.as_millis() as u64),
    );
    store.set(
        "break_duration_ms",
        serde_json::json!(rest.as_millis() as u64),
    );
    if demo {
        store.set("onboarding_complete", serde_json::json!(true));
    }
    store.save().map_err(|err| err.to_string())?;
    app.state::<AppState>()
        .actions
        .send(Action::SetSchedule { work, rest, demo })
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn update_settings(
    app: AppHandle,
    work_duration_ms: u64,
    break_duration_ms: u64,
) -> Result<(), String> {
    save_schedule(
        &app,
        setting_duration(work_duration_ms),
        setting_duration(break_duration_ms),
        false,
    )
}

#[tauri::command]
pub async fn complete_onboarding(
    app: AppHandle,
    work_duration_ms: u64,
    break_duration_ms: u64,
) -> Result<(), String> {
    save_schedule(
        &app,
        setting_duration(work_duration_ms),
        setting_duration(break_duration_ms),
        true,
    )
}
