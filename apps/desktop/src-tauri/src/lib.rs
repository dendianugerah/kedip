//! Kedip - A gentle eye care reminder app.
//!

mod commands;
mod state;
mod timer;
mod tray;
mod windows;

use std::sync::Arc;
use tauri_plugin_store::StoreExt;

pub use state::{AppState, TimerPhase, TimerState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .setup(move |app| {
            let _onboarding_complete = if let Ok(store) = app.store("kedip.json") {
                let mut timer = app_state.timer.lock().unwrap();
                if let Some(ms) = store.get("work_duration_ms").and_then(|v| v.as_u64()) {
                    timer.work_duration_ms = ms;
                    timer.time_remaining_ms = ms;
                }
                if let Some(ms) = store.get("break_duration_ms").and_then(|v| v.as_u64()) {
                    timer.break_duration_ms = ms;
                }
                store
                    .get("onboarding_complete")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            } else {
                false
            };

            tray::setup(app, app_state.clone())?;
            timer::start_loop(app.handle().clone(), app_state.clone());
            windows::show_settings(app.handle());

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_update(handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_timer_state,
            commands::skip_break,
            commands::snooze_break,
            commands::start_break_now,
            commands::toggle_pause,
            commands::update_settings,
            commands::add_break_time,
            commands::is_onboarding_complete,
            commands::complete_onboarding,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app, event| {
            // Keep the app alive in the tray when all windows are closed.
            // The tray "Quit" item calls app.exit(0) which bypasses this.
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}

async fn check_for_update(app: tauri::AppHandle) {
    use tauri_plugin_updater::UpdaterExt;

    let Ok(updater) = app.updater() else { return };
    let Ok(Some(update)) = updater.check().await else {
        return;
    };
    let _ = update.download_and_install(|_, _| {}, || {}).await;
    app.restart();
}
