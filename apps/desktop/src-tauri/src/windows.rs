//! Window management.

use std::sync::mpsc;
use tauri::{
    AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize, Position, Size, WebviewUrl,
    WebviewWindowBuilder,
};

#[cfg(target_os = "linux")]
use gtk::prelude::GtkWindowExt;
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
pub const PRIMARY_BREAK_LABEL: &str = "break_primary";

const APP_WINDOW_WIDTH: f64 = 660.0;
const APP_WINDOW_HEIGHT: f64 = 520.0;
const APP_WINDOW_MIN_WIDTH: f64 = 580.0;
const APP_WINDOW_MIN_HEIGHT: f64 = 400.0;

fn displays(app: &AppHandle) -> (Option<Monitor>, Vec<Monitor>) {
    let (sender, receiver) = mpsc::sync_channel(1);
    let handle = app.clone();
    if app
        .run_on_main_thread(move || {
            let primary = handle.primary_monitor().ok().flatten();
            let monitors = handle.available_monitors().unwrap_or_default();
            let _ = sender.send((primary, monitors));
        })
        .is_err()
    {
        return (None, Vec::new());
    }
    receiver.recv().unwrap_or_default()
}

pub fn show_notification(app: &AppHandle, time_remaining: u64) {
    if app.get_webview_window("notification").is_some() {
        return;
    }

    let (primary, monitors) = displays(app);
    let monitor = primary.or_else(|| monitors.into_iter().next());
    let url = format!("index.html?window=notification&time={}", time_remaining);

    if let Ok(window) = WebviewWindowBuilder::new(app, "notification", WebviewUrl::App(url.into()))
        .title("Kedip reminder")
        .inner_size(NOTIFICATION_WIDTH, NOTIFICATION_HEIGHT)
        .visible(false)
        .focused(false)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .accept_first_mouse(true)
        .shadow(false)
        .build()
    {
        if let Some(monitor) = monitor {
            let area = monitor.work_area();
            let scale = monitor.scale_factor();
            let size = PhysicalSize::new(
                (NOTIFICATION_WIDTH * scale).round() as u32,
                (NOTIFICATION_HEIGHT * scale).round() as u32,
            );
            let position = notification_position(area.position, area.size, size, scale);
            let _ = window.set_position(position);
            let _ = window.set_size(size);
        }
        #[cfg(target_os = "linux")]
        {
            let reminder = window.clone();
            let _ = window.run_on_main_thread(move || {
                if let Ok(gtk_window) = reminder.gtk_window() {
                    gtk_window.set_focus_on_map(false);
                }
                let _ = reminder.show();
            });
        }
        #[cfg(not(target_os = "linux"))]
        let _ = window.show();
    }
}

fn notification_position(
    origin: PhysicalPosition<i32>,
    area: PhysicalSize<u32>,
    size: PhysicalSize<u32>,
    scale: f64,
) -> PhysicalPosition<i32> {
    let margin = (NOTIFICATION_MARGIN * scale).round() as u32;
    PhysicalPosition::new(
        origin.x + area.width.saturating_sub(size.width + margin) as i32,
        origin.y + margin.min(area.height.saturating_sub(size.height)) as i32,
    )
}

pub fn close_notification(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.destroy();
    }
}

pub fn show_break(app: &AppHandle, time_remaining: u64) {
    let (primary, mut monitors) = displays(app);
    if monitors.is_empty() {
        monitors.extend(primary.clone());
    }
    let primary_index = primary
        .and_then(|p| {
            monitors
                .iter()
                .position(|m| m.position() == p.position() && m.size() == p.size())
        })
        .unwrap_or(0);

    for (index, monitor) in monitors
        .iter()
        .enumerate()
        .filter(|(index, _)| *index != primary_index)
    {
        show_break_window(
            app,
            &format!("break_{index}"),
            Some(monitor),
            time_remaining,
            false,
        );
    }
    show_break_window(
        app,
        PRIMARY_BREAK_LABEL,
        monitors.get(primary_index),
        time_remaining,
        true,
    );
}

fn show_break_window(
    app: &AppHandle,
    label: &str,
    monitor: Option<&Monitor>,
    time_remaining: u64,
    primary: bool,
) {
    let url = format!("index.html?window=break&time={time_remaining}&primary={primary}");
    if let Ok(window) = WebviewWindowBuilder::new(app, label, WebviewUrl::App(url.into()))
        .title("Kedip break")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .focused(false)
        .visible(false)
        .visible_on_all_workspaces(true)
        .build()
    {
        if let Some(monitor) = monitor {
            let (position, size) = break_bounds(
                *monitor.position(),
                *monitor.size(),
                cfg!(target_os = "macos").then(|| monitor.scale_factor()),
            );
            let _ = window.set_position(position);
            let _ = window.set_size(size);
        } else {
            let _ = window.set_fullscreen(true);
        }
        let _ = window.show();
        if primary {
            let _ = window.set_focus();
        }

        #[cfg(target_os = "macos")]
        {
            let overlay = window.clone();
            let _ = window.run_on_main_thread(move || {
                let _ = apply_vibrancy(&overlay, NSVisualEffectMaterial::HudWindow, None, None);
                apply_macos_lock_behavior(&overlay, primary);
            });
        }
    }
}

fn break_bounds(
    position: PhysicalPosition<i32>,
    size: PhysicalSize<u32>,
    macos_target_scale: Option<f64>,
) -> (Position, Size) {
    if let Some(scale) = macos_target_scale {
        // AppKit uses points; Tao otherwise converts using the overlay's initial screen.
        (
            position.to_logical::<f64>(scale).into(),
            size.to_logical::<f64>(scale).into(),
        )
    } else {
        (position.into(), size.into())
    }
}

fn close_all_break_windows(app: &AppHandle) {
    for (label, window) in app.webview_windows() {
        if label.starts_with("break_") {
            let _ = window.destroy();
        }
    }
}

#[cfg(target_os = "macos")]
fn apply_macos_lock_behavior(window: &tauri::WebviewWindow, primary: bool) {
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
        ns_window.setIgnoresMouseEvents(false);

        if primary {
            ns_window.makeKeyAndOrderFront(None);
            let app = NSApplication::sharedApplication(mtm);
            let options = NSApplicationPresentationOptions::HideDock
                | NSApplicationPresentationOptions::HideMenuBar
                | NSApplicationPresentationOptions::DisableProcessSwitching;
            app.setPresentationOptions(options);
        }
    }
}

pub fn close_break(app: &AppHandle) {
    close_all_break_windows(app);

    #[cfg(target_os = "macos")]
    {
        let handle = app.clone();
        let _ = app.run_on_main_thread(move || restore_macos_presentation(&handle));
    }
}

#[cfg(target_os = "macos")]
fn restore_macos_presentation(handle: &AppHandle) {
    if let Some(mtm) = MainThreadMarker::new() {
        let app = NSApplication::sharedApplication(mtm);
        app.setPresentationOptions(NSApplicationPresentationOptions::empty());

        if app.isActive()
            && !handle.webview_windows().iter().any(|(label, window)| {
                !label.starts_with("break_")
                    && window.is_visible().unwrap_or(true)
                    && !window.is_minimized().unwrap_or(false)
            })
        {
            app.deactivate();
        }
    }
}

pub fn show_settings(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.unminimize();
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
    .resizable(true)
    .center();

    #[cfg(target_os = "macos")]
    let builder = builder
        .transparent(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .traffic_light_position(tauri::LogicalPosition::new(12.0, 20.0));

    if let Ok(window) = builder.build() {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn macos_break_uses_target_screen_points() {
        let (position, size) = break_bounds(
            PhysicalPosition::new(3840, -100),
            PhysicalSize::new(2880, 1800),
            Some(2.0),
        );
        assert_eq!(position, tauri::LogicalPosition::new(1920.0, -50.0).into());
        assert_eq!(size, tauri::LogicalSize::new(1440.0, 900.0).into());
    }

    #[test]
    fn break_bounds_keep_physical_pixels_off_macos() {
        let position = PhysicalPosition::new(-2560, 0);
        let size = PhysicalSize::new(2560, 1440);
        assert_eq!(
            break_bounds(position, size, None),
            (position.into(), size.into())
        );
    }

    #[test]
    fn notification_uses_physical_work_area_origin_and_scaled_size() {
        let position = notification_position(
            PhysicalPosition::new(-2560, 64),
            PhysicalSize::new(2560, 1376),
            PhysicalSize::new(480, 204),
            1.5,
        );
        assert_eq!(position, PhysicalPosition::new(-510, 94));
    }

    #[test]
    fn notification_starts_in_work_area_on_tiny_displays() {
        let origin = PhysicalPosition::new(0, -100);
        let position = notification_position(
            origin,
            PhysicalSize::new(200, 100),
            PhysicalSize::new(320, 136),
            1.0,
        );
        assert_eq!(position, origin);
    }
}
