//! Kedip - A gentle eye care reminder app.
//!

mod clock;
mod commands;
mod state;
mod timer;
mod tray;
mod windows;

use std::time::Instant;
use tauri::{Manager, WindowEvent};
use tauri_plugin_store::StoreExt;

use state::AppState;
use timer::Action;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (app_state, actions) = AppState::new();

    let builder = tauri::Builder::default();
    #[cfg(target_os = "linux")]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _, _| {
        timer::send(app, Action::OpenSettings);
    }));

    builder
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .setup(move |app| {
            let state = app.state::<AppState>();
            let onboarded = if let Ok(store) = app.store("kedip.json") {
                let mut clock = state.clock.lock().unwrap();
                if let Some(ms) = store.get("work_duration_ms").and_then(|v| v.as_u64()) {
                    clock.work = commands::setting_duration(ms);
                }
                if let Some(ms) = store.get("break_duration_ms").and_then(|v| v.as_u64()) {
                    clock.rest = commands::setting_duration(ms);
                }
                let complete = store
                    .get("onboarding_complete")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);
                if complete {
                    let work = clock.work;
                    clock.activate(Instant::now(), work);
                }
                complete
            } else {
                false
            };

            let tray = tray::setup(app);
            if let Err(error) = &tray {
                eprintln!("Could not set up the Kedip tray icon: {error}");
            }
            timer::start(app.handle().clone(), actions);
            timer::send(
                app.handle(),
                if onboarded && tray.is_ok() {
                    Action::Refresh
                } else {
                    Action::OpenSettings
                },
            );

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_update(handle).await;
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "settings"
                && matches!(event, WindowEvent::Focused(_) | WindowEvent::Destroyed)
            {
                timer::send(window.app_handle(), Action::Refresh);
            }
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
        .run(|app, event| match event {
            tauri::RunEvent::ExitRequested {
                api, code: None, ..
            } => api.prevent_exit(),
            tauri::RunEvent::Exit => timer::send(app, Action::Stop),
            _ => {}
        });
}

async fn check_for_update(app: tauri::AppHandle) {
    use tauri_plugin_updater::UpdaterExt;

    let Ok(updater) = app.updater() else { return };
    let Ok(Some(update)) = updater.check().await else {
        return;
    };
    if update.download_and_install(|_, _| {}, || {}).await.is_ok() {
        app.restart();
    }
}
