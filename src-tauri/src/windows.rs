//! Window management.

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
use cocoa::base::id;
#[cfg(target_os = "macos")]
use objc::{class, msg_send, sel, sel_impl};
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub fn show_notification(app: &AppHandle, time_remaining: u64) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.destroy();
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
            let _ = apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(12.0));
            apply_macos_lock_behavior(&window);
        }
    }
}

#[cfg(target_os = "macos")]
fn apply_macos_lock_behavior(window: &tauri::WebviewWindow) {
    use tauri::Emitter;

    if let Ok(ns_window) = window.ns_window() {
        let ns_window = ns_window as id;

        unsafe {
            // Get main screen frame to cover entire display
            let screen: id = msg_send![class!(NSScreen), mainScreen];
            let frame: cocoa::foundation::NSRect = msg_send![screen, frame];
            let _: () = msg_send![ns_window, setFrame: frame display: true];

            // CGShieldingWindowLevel - highest level used by screen savers
            let shielding_level: i64 = 2147483628;
            let _: () = msg_send![ns_window, setLevel: shielding_level];

            // Collection behavior flags:
            // CanJoinAllSpaces | Stationary | IgnoresCycle | FullScreenDisallowsTiling
            let behavior: u64 = (1 << 0) | (1 << 4) | (1 << 6) | (1 << 11);
            let _: () = msg_send![ns_window, setCollectionBehavior: behavior];
            let _: () = msg_send![ns_window, setMovable: false];
            let _: () = msg_send![ns_window, makeKeyAndOrderFront: cocoa::base::nil];
            let _: () = msg_send![ns_window, setIgnoresMouseEvents: false];

            // Presentation options: HideDock | HideMenuBar | DisableProcessSwitching
            let app: id = msg_send![class!(NSApplication), sharedApplication];
            let options: u64 = (1 << 1) | (1 << 3) | (1 << 5);
            let _: () = msg_send![app, setPresentationOptions: options];
        }
    }

    // Emit event to frontend that lock is active
    let _ = window.emit("lock-active", true);
}

pub fn close_break(app: &AppHandle) {
    #[cfg(target_os = "macos")]
    {
        restore_macos_presentation();
    }

    if let Some(window) = app.get_webview_window("break") {
        let _ = window.destroy();
    }

    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.hide();
    }
}

#[cfg(target_os = "macos")]
fn restore_macos_presentation() {
    unsafe {
        let app: id = msg_send![class!(NSApplication), sharedApplication];
        let _: () = msg_send![app, setPresentationOptions: 0u64];
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
