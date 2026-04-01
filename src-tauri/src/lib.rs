//! Kedip - A gentle eye care reminder app.
//!
//! Kedip helps protect your eyes by reminding you to take regular breaks
//! using the 20-20-20 rule: every 20 minutes, look at something 20 feet away
//! for 20 seconds.
//!
//! # Architecture
//!
//! The app is organized into the following modules:
//! - [`state`] - Timer state and app state management
//! - [`timer`] - Background timer loop and phase transitions
//! - [`windows`] - Window creation and management
//! - [`tray`] - System tray setup and event handling
//! - [`commands`] - Tauri command handlers for frontend communication

mod commands;
mod state;
mod timer;
mod tray;
mod windows;

use std::sync::Arc;

pub use state::{AppState, TimerPhase, TimerState};

/// Runs the Kedip application.
///
/// This is the main entry point that:
/// 1. Initializes plugins (store, opener)
/// 2. Sets up application state
/// 3. Configures the system tray
/// 4. Starts the background timer loop
/// 5. Registers all command handlers
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .setup(move |app| {
            // Set up system tray
            tray::setup(app, app_state.clone())?;

            // Start the background timer loop
            let handle = app.handle().clone();
            timer::start_loop(handle, app_state.clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_timer_state,
            commands::skip_break,
            commands::snooze_break,
            commands::start_break_now,
            commands::toggle_pause,
            commands::update_settings,
            commands::lock_screen,
            commands::add_break_time,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
