//! System tray setup and event handling.

use std::sync::Arc;
use std::time::Instant;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App,
};

use crate::state::{AppState, TimerPhase};
use crate::windows;

pub fn setup(app: &App, state: Arc<AppState>) -> Result<(), Box<dyn std::error::Error>> {
    let quit_item = MenuItem::with_id(app, "quit", "Quit Kedip", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let pause_item = MenuItem::with_id(app, "pause", "Pause", true, None::<&str>)?;
    let skip_item = MenuItem::with_id(app, "skip", "Skip This Break", true, None::<&str>)?;
    let break_now_item = MenuItem::with_id(app, "break_now", "Take Break Now", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &break_now_item,
            &skip_item,
            &pause_item,
            &settings_item,
            &quit_item,
        ],
    )?;

    let icon = app
        .default_window_icon()
        .cloned()
        .expect("no default icon configured");

    TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .title("20:00")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                windows::show_settings(app);
            }
        })
        .on_menu_event(move |app, event| {
            handle_menu_event(app, &event.id.0, &state);
        })
        .build(app)?;

    Ok(())
}

fn handle_menu_event(app: &tauri::AppHandle, event_id: &str, state: &Arc<AppState>) {
    match event_id {
        "quit" => {
            app.exit(0);
        }
        "settings" => {
            windows::show_settings(app);
        }
        "pause" => {
            let mut paused = state.is_paused.lock().unwrap();
            *paused = !*paused;
            if !*paused {
                *state.last_tick.lock().unwrap() = Instant::now();
            }
        }
        "skip" => {
            let mut timer = state.timer.lock().unwrap();
            windows::close_break(app);
            windows::close_notification(app);
            timer.phase = TimerPhase::Working;
            timer.time_remaining_ms = timer.work_duration_ms;
            *state.last_tick.lock().unwrap() = Instant::now();
        }
        "break_now" => {
            let mut timer = state.timer.lock().unwrap();
            windows::close_notification(app);
            timer.phase = TimerPhase::Break;
            timer.time_remaining_ms = timer.break_duration_ms;
            *state.last_tick.lock().unwrap() = Instant::now();
            windows::show_break(app, timer.time_remaining_ms);
        }
        _ => {}
    }
}
