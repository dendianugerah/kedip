//! Window management.

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use urlencoding::encode;

#[cfg(target_os = "macos")]
use objc2::rc::Retained;
#[cfg(target_os = "macos")]
use objc2_app_kit::{
    NSApplication, NSApplicationPresentationOptions, NSWindow, NSWindowCollectionBehavior,
};
#[cfg(target_os = "macos")]
use objc2_foundation::MainThreadMarker;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg(target_os = "macos")]
const SHIELDING_WINDOW_LEVEL: isize = 2147483628;

const NOTIFICATION_WIDTH: f64 = 320.0;
const NOTIFICATION_HEIGHT: f64 = 136.0;
const NOTIFICATION_MARGIN: f64 = 20.0;
const NOTIFICATION_FALLBACK_X: f64 = 1560.0;
const NOTIFICATION_FALLBACK_Y: f64 = 20.0;

const REMINDER_WIDTH: f64 = 320.0;
const REMINDER_HEIGHT: f64 = 90.0;

const APP_WINDOW_WIDTH: f64 = 660.0;
const APP_WINDOW_HEIGHT: f64 = 520.0;
const APP_WINDOW_MIN_WIDTH: f64 = 580.0;
const APP_WINDOW_MIN_HEIGHT: f64 = 400.0;

pub fn show_notification(app: &AppHandle, time_remaining: u64) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.destroy();
    }

    let (x, y) = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| {
            let scale = m.scale_factor();
            let logical_width = m.size().width as f64 / scale;
            let logical_x = m.position().x as f64 / scale;
            let logical_y = m.position().y as f64 / scale;
            (
                logical_x + logical_width - NOTIFICATION_WIDTH - NOTIFICATION_MARGIN,
                logical_y + NOTIFICATION_MARGIN,
            )
        })
        .unwrap_or((NOTIFICATION_FALLBACK_X, NOTIFICATION_FALLBACK_Y));

    let url = format!("index.html?window=notification&time={}", time_remaining);

    if let Ok(window) = WebviewWindowBuilder::new(app, "notification", WebviewUrl::App(url.into()))
        .title("")
        .inner_size(NOTIFICATION_WIDTH, NOTIFICATION_HEIGHT)
        .position(x, y)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .accept_first_mouse(true)
        .shadow(false)
        .build()
    {
        let _ = window.show();
    }
}

pub fn close_notification(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.destroy();
    }
}

pub fn show_break(app: &AppHandle, time_remaining: u64) {
    close_notification(app);
    close_all_break_windows(app);

    let monitors: Vec<_> = app
        .available_monitors()
        .ok()
        .map(|m| m.into_iter().collect())
        .unwrap_or_default();

    let primary_monitor_name = app
        .primary_monitor()
        .ok()
        .flatten()
        .and_then(|m| m.name().map(|n| n.to_string()));

    for (index, monitor) in monitors.iter().enumerate() {
        let scale = monitor.scale_factor();
        let width = monitor.size().width as f64 / scale;
        let height = monitor.size().height as f64 / scale;
        let x = monitor.position().x as f64 / scale;
        let y = monitor.position().y as f64 / scale;

        let is_primary = match (&primary_monitor_name, monitor.name()) {
            (Some(primary), Some(name)) => primary == name,
            _ => index == 0,
        };

        let label = format!("break_{}", index);
        let url = format!(
            "index.html?window=break&time={}&primary={}",
            time_remaining, is_primary
        );

        if let Ok(window) = WebviewWindowBuilder::new(app, &label, WebviewUrl::App(url.into()))
            .title("")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .resizable(false)
            .skip_taskbar(true)
            .focused(is_primary)
            .visible_on_all_workspaces(true)
            .inner_size(width, height)
            .position(x, y)
            .build()
        {
            let _ = window.show();
            if is_primary {
                let _ = window.set_focus();
            }

            #[cfg(target_os = "macos")]
            {
                let _ = apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None);
                apply_macos_lock_behavior(&window);
            }
        }
    }
}

fn close_all_break_windows(app: &AppHandle) {
    for (label, window) in app.webview_windows() {
        if label.starts_with("break") {
            let _ = window.destroy();
        }
    }
}

#[cfg(target_os = "macos")]
fn apply_macos_lock_behavior(window: &tauri::WebviewWindow) {
    use tauri::Emitter;

    let Some(mtm) = MainThreadMarker::new() else {
        return;
    };

    let Ok(ns_window_ptr) = window.ns_window() else {
        return;
    };

    unsafe {
        let Some(ns_window) = Retained::retain(ns_window_ptr as *mut NSWindow) else {
            return;
        };

        ns_window.setHasShadow(false);
        ns_window.setLevel(SHIELDING_WINDOW_LEVEL);

        let behavior = NSWindowCollectionBehavior::CanJoinAllSpaces
            | NSWindowCollectionBehavior::Stationary
            | NSWindowCollectionBehavior::IgnoresCycle
            | NSWindowCollectionBehavior::FullScreenDisallowsTiling;
        ns_window.setCollectionBehavior(behavior);
        ns_window.setMovable(false);
        ns_window.makeKeyAndOrderFront(None);
        ns_window.setIgnoresMouseEvents(false);

        let app = NSApplication::sharedApplication(mtm);
        let options = NSApplicationPresentationOptions::HideDock
            | NSApplicationPresentationOptions::HideMenuBar
            | NSApplicationPresentationOptions::DisableProcessSwitching;
        app.setPresentationOptions(options);
    }

    let _ = window.emit("lock-active", true);
}

pub fn close_break(app: &AppHandle) {
    #[cfg(target_os = "macos")]
    restore_macos_presentation();

    close_all_break_windows(app);

    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.hide();
    }

    #[cfg(target_os = "macos")]
    {
        if let Some(mtm) = MainThreadMarker::new() {
            NSApplication::sharedApplication(mtm).hide(None);
        }
    }
}

#[cfg(target_os = "macos")]
fn restore_macos_presentation() {
    if let Some(mtm) = MainThreadMarker::new() {
        let app = NSApplication::sharedApplication(mtm);
        app.setPresentationOptions(NSApplicationPresentationOptions::empty());
    }
}

pub fn show_settings(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let builder = WebviewWindowBuilder::new(
        app,
        "settings",
        WebviewUrl::App("index.html?window=settings".into()),
    )
    .title("")
    .inner_size(APP_WINDOW_WIDTH, APP_WINDOW_HEIGHT)
    .min_inner_size(APP_WINDOW_MIN_WIDTH, APP_WINDOW_MIN_HEIGHT)
    .transparent(true)
    .resizable(true)
    .center();

    #[cfg(target_os = "macos")]
    let builder = builder
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .traffic_light_position(tauri::LogicalPosition::new(12.0, 20.0));

    if let Ok(window) = builder.build() {
        let _ = window.show();
        let _ = window.set_focus();

        // Intercept the close button so the app keeps running in the tray.
        // Destroying the window frees all associated WebKit processes.
        let w = window.clone();
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = w.destroy();
            }
        });
    }
}

pub fn show_reminder(app: &AppHandle, name: &str, message: &str) {
    if let Some(window) = app.get_webview_window("reminder") {
        let _ = window.destroy();
    }

    let (x, y) = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| {
            let scale = m.scale_factor();
            let logical_width = m.size().width as f64 / scale;
            let logical_x = m.position().x as f64 / scale;
            (
                logical_x + logical_width - REMINDER_WIDTH - NOTIFICATION_MARGIN,
                NOTIFICATION_MARGIN,
            )
        })
        .unwrap_or((NOTIFICATION_FALLBACK_X, NOTIFICATION_FALLBACK_Y));

    let url = format!(
        "index.html?window=reminder&name={}&message={}",
        encode(name),
        encode(message)
    );

    if let Ok(window) = WebviewWindowBuilder::new(app, "reminder", WebviewUrl::App(url.into()))
        .title("")
        .inner_size(REMINDER_WIDTH, REMINDER_HEIGHT)
        .position(x, y)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .accept_first_mouse(true)
        .shadow(false)
        .build()
    {
        let _ = window.show();
    }
}

pub fn close_reminder(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("reminder") {
        let _ = window.destroy();
    }
}
