//! Window management.

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
use objc2::rc::Retained;
#[cfg(target_os = "macos")]
use objc2_app_kit::{
    NSApplication, NSApplicationPresentationOptions, NSScreen, NSWindow, NSWindowCollectionBehavior,
};
#[cfg(target_os = "macos")]
use objc2_foundation::MainThreadMarker;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg(target_os = "macos")]
const SHIELDING_WINDOW_LEVEL: isize = 2147483628;

pub fn show_notification(app: &AppHandle, time_remaining: u64) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.destroy();
    }

    let width = 320.0_f64;
    let height = 136.0_f64;

    let (x, y) = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| {
            let scale = m.scale_factor();
            let logical_width = m.size().width as f64 / scale;
            let logical_x = m.position().x as f64 / scale;
            let logical_y = m.position().y as f64 / scale;
            (logical_x + logical_width - width - 20.0, logical_y + 20.0)
        })
        .unwrap_or((1560.0, 20.0));

    let url = format!("index.html?window=notification&time={}", time_remaining);

    if let Ok(window) = WebviewWindowBuilder::new(app, "notification", WebviewUrl::App(url.into()))
        .title("")
        .inner_size(width, height)
        .position(x, y)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
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

    if let Some(window) = app.get_webview_window("break") {
        let _ = window.destroy();
    }

    let url = format!("index.html?window=break&time={}", time_remaining);

    let monitors = app.available_monitors().ok();
    let (width, height) = monitors
        .and_then(|m| m.into_iter().next())
        .map(|m| {
            let s = m.size();
            (s.width as f64, s.height as f64)
        })
        .unwrap_or((1920.0, 1080.0));

    if let Ok(window) = WebviewWindowBuilder::new(app, "break", WebviewUrl::App(url.into()))
        .title("")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .focused(true)
        .visible_on_all_workspaces(true)
        .inner_size(width, height)
        .position(0.0, 0.0)
        .build()
    {
        let _ = window.show();
        let _ = window.set_focus();

        #[cfg(target_os = "macos")]
        {
            let _ = apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None);
            apply_macos_lock_behavior(&window);
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

        if let Some(screen) = NSScreen::mainScreen(mtm) {
            let frame = screen.frame();
            ns_window.setFrame_display(frame, true);
        }

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

    if let Some(window) = app.get_webview_window("break") {
        let _ = window.destroy();
    }

    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.hide();
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
