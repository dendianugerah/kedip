//! Kedip - A gentle eye care reminder app.
//!
//! Helps protect your eyes using the 20-20-20 rule: every 20 minutes,
//! look at something 20 feet away for 20 seconds.

mod commands;
mod state;
mod timer;
mod tray;
mod windows;

use std::sync::Arc;

pub use state::{AppState, TimerPhase, TimerState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .setup(move |app| {
            tray::setup(app, app_state.clone())?;
            timer::start_loop(app.handle().clone(), app_state.clone());
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
