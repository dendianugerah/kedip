//! System tray setup and event handling.

use std::time::Duration;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle,
};

use crate::clock::TimerPhase;
use crate::timer::{self, Action};

pub fn setup(app: &App) -> Result<(), Box<dyn std::error::Error>> {
    let quit_item = MenuItem::with_id(app, "quit", "Quit Kedip", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, None::<&str>)?;
    let pause_item = MenuItem::with_id(app, "pause", "Pause", true, None::<&str>)?;
    let skip_item = MenuItem::with_id(app, "skip", "Skip This Break", true, None::<&str>)?;
    let break_now_item = MenuItem::with_id(app, "break_now", "Take Break Now", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    let menu = Menu::with_items(
        app,
        &[
            &break_now_item,
            &skip_item,
            &pause_item,
            &settings_item,
            &separator,
            &quit_item,
        ],
    )?;

    let icon = app
        .default_window_icon()
        .cloned()
        .expect("no default icon configured");

    TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .tooltip("Kedip")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                timer::send(tray.app_handle(), Action::OpenSettings);
            }
        })
        .on_menu_event(|app, event| {
            let action = match event.id.as_ref() {
                "quit" => return app.exit(0),
                "settings" => Action::OpenSettings,
                "pause" => Action::TogglePause,
                "skip" => Action::Skip,
                "break_now" => Action::BreakNow,
                _ => return,
            };
            timer::send(app, action);
        })
        .build(app)?;

    Ok(())
}

#[derive(PartialEq)]
pub enum Status {
    #[cfg(not(target_os = "macos"))]
    Working,
    Paused,
    Break,
    #[cfg(target_os = "macos")]
    Minutes(u64),
}

pub fn update_status(
    app: &AppHandle,
    last_status: &mut Option<Status>,
    phase: TimerPhase,
    paused: bool,
    _remaining: Duration,
) {
    let status = if phase == TimerPhase::Break {
        Status::Break
    } else if paused {
        Status::Paused
    } else {
        #[cfg(target_os = "macos")]
        {
            let seconds = _remaining.as_secs() + u64::from(_remaining.subsec_nanos() != 0);
            Status::Minutes((seconds + 59) / 60)
        }
        #[cfg(not(target_os = "macos"))]
        Status::Working
    };
    if last_status.as_ref() == Some(&status) {
        return;
    }
    if let Some(tray) = app.tray_by_id("main-tray") {
        let menu_hint = match phase {
            TimerPhase::Break => "Kedip — On a break",
            TimerPhase::Working if paused => "Kedip — Reminders paused",
            TimerPhase::Working => "Kedip — Reminders on",
        };
        let _ = tray.set_tooltip(Some(menu_hint));
        #[cfg(target_os = "macos")]
        {
            let title = match status {
                Status::Paused => "⏸".into(),
                Status::Break => "Break".into(),
                Status::Minutes(minutes) => format!("{minutes}m"),
            };
            let _ = tray.set_title(Some(title));
        }
    }
    *last_status = Some(status);
}
