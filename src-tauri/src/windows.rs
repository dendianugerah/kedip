//! Window management utilities.
//!
//! This module handles creating, showing, and closing the various windows
//! in the application: notification, break, and settings windows.

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

/// Shows the countdown notification window.
///
/// This is a small floating window that appears before a break starts,
/// giving the user a chance to snooze, skip, or start the break early.
pub fn show_notification(app: &AppHandle, time_remaining: u64) {
    // Close existing notification if any
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.close();
    }

    let url = format!("index.html?window=notification&time={}", time_remaining);

    if let Ok(window) = WebviewWindowBuilder::new(app, "notification", WebviewUrl::App(url.into()))
        .title("Break Coming")
        .inner_size(400.0, 100.0)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .center()
        .build()
    {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/// Closes the notification window if it exists.
pub fn close_notification(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.close();
    }
}

/// Shows the fullscreen break window.
///
/// This window takes over the entire screen to encourage the user
/// to actually take a break. It's always on top and visible on all workspaces.
pub fn show_break(app: &AppHandle, time_remaining: u64) {
    // Close notification first
    close_notification(app);

    // Close existing break window if any
    if let Some(window) = app.get_webview_window("break") {
        let _ = window.close();
    }

    let url = format!("index.html?window=break&time={}", time_remaining);

    if let Ok(window) = WebviewWindowBuilder::new(app, "break", WebviewUrl::App(url.into()))
        .title("")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .focused(true)
        .visible_on_all_workspaces(true)
        .fullscreen(true)
        .build()
    {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.set_always_on_top(true);

        // macOS: Keep window visible on all workspaces
        #[cfg(target_os = "macos")]
        {
            let _ = window.set_visible_on_all_workspaces(true);
        }
    }
}

/// Closes the break window if it exists.
pub fn close_break(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("break") {
        let _ = window.close();
    }
}

/// Shows or focuses the settings window.
///
/// If the settings window already exists, it will be focused.
/// Otherwise, a new settings window will be created.
pub fn show_settings(app: &AppHandle) {
    // If settings window exists, focus it
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    if let Ok(window) = WebviewWindowBuilder::new(
        app,
        "settings",
        WebviewUrl::App("index.html?window=settings".into()),
    )
    .title("Kedip")
    .inner_size(380.0, 520.0)
    .decorations(true)
    .transparent(false)
    .resizable(false)
    .center()
    .build()
    {
        let _ = window.show();
        let _ = window.set_focus();
    }
}
