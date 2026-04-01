use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
};

#[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
pub enum TimerPhase {
    Idle,
    Working,
    Countdown,
    Break,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub phase: TimerPhase,
    pub time_remaining_ms: u64,
    pub work_duration_ms: u64,
    pub break_duration_ms: u64,
    pub countdown_duration_ms: u64,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            phase: TimerPhase::Working,
            time_remaining_ms: 20 * 60 * 1000, // 20 minutes
            work_duration_ms: 20 * 60 * 1000,  // 20 minutes
            break_duration_ms: 20 * 1000,      // 20 seconds
            countdown_duration_ms: 30 * 1000,  // 30 seconds
        }
    }
}

pub struct AppState {
    pub timer: Mutex<TimerState>,
    pub last_tick: Mutex<Instant>,
    pub is_paused: Mutex<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            timer: Mutex::new(TimerState::default()),
            last_tick: Mutex::new(Instant::now()),
            is_paused: Mutex::new(false),
        }
    }
}

fn format_time(ms: u64) -> String {
    let total_seconds = ms / 1000;
    let minutes = total_seconds / 60;
    let seconds = total_seconds % 60;
    format!("{:02}:{:02}", minutes, seconds)
}

fn update_tray_title(app: &AppHandle, state: &TimerState, paused: bool) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let title = if paused {
            "⏸".to_string()
        } else {
            match state.phase {
                TimerPhase::Idle => "👁".to_string(),
                TimerPhase::Working => format_time(state.time_remaining_ms),
                TimerPhase::Countdown => format!("⚠️ {}", format_time(state.time_remaining_ms)),
                TimerPhase::Break => format!("😌 {}", format_time(state.time_remaining_ms)),
            }
        };
        let _ = tray.set_title(Some(&title));
    }
}

fn show_notification_window(app: &AppHandle, time_remaining: u64) {
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

fn close_notification_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("notification") {
        let _ = window.close();
    }
}

fn show_break_window(app: &AppHandle, time_remaining: u64) {
    // Close notification first
    close_notification_window(app);
    
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

fn close_break_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("break") {
        let _ = window.close();
    }
}

fn show_settings_window(app: &AppHandle) {
    // If settings window exists, focus it
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    if let Ok(window) = WebviewWindowBuilder::new(app, "settings", WebviewUrl::App("index.html?window=settings".into()))
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

#[tauri::command]
fn get_timer_state(state: tauri::State<'_, Arc<AppState>>) -> TimerState {
    state.timer.lock().unwrap().clone()
}

#[tauri::command]
fn skip_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();
    close_break_window(&app);
    close_notification_window(&app);
    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = timer.work_duration_ms;
    *state.last_tick.lock().unwrap() = Instant::now();
}

#[tauri::command]
fn snooze_break(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();
    close_notification_window(&app);
    timer.phase = TimerPhase::Working;
    timer.time_remaining_ms = 5 * 60 * 1000; // Snooze for 5 minutes
    *state.last_tick.lock().unwrap() = Instant::now();
}

#[tauri::command]
fn start_break_now(app: AppHandle, state: tauri::State<'_, Arc<AppState>>) {
    let mut timer = state.timer.lock().unwrap();
    close_notification_window(&app);
    timer.phase = TimerPhase::Break;
    timer.time_remaining_ms = timer.break_duration_ms;
    *state.last_tick.lock().unwrap() = Instant::now();
    show_break_window(&app, timer.time_remaining_ms);
}

#[tauri::command]
fn toggle_pause(state: tauri::State<'_, Arc<AppState>>) -> bool {
    let mut paused = state.is_paused.lock().unwrap();
    *paused = !*paused;
    if !*paused {
        *state.last_tick.lock().unwrap() = Instant::now();
    }
    *paused
}

#[tauri::command]
fn update_settings(
    state: tauri::State<'_, Arc<AppState>>,
    work_duration_ms: u64,
    break_duration_ms: u64,
    countdown_duration_ms: u64,
) {
    let mut timer = state.timer.lock().unwrap();
    timer.work_duration_ms = work_duration_ms;
    timer.break_duration_ms = break_duration_ms;
    timer.countdown_duration_ms = countdown_duration_ms;
    
    // Reset timer with new work duration if currently working
    if timer.phase == TimerPhase::Working || timer.phase == TimerPhase::Idle {
        timer.time_remaining_ms = timer.work_duration_ms;
        timer.phase = TimerPhase::Working;
    }
}

#[tauri::command]
fn lock_screen() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("pmset")
            .args(["displaysleepnow"])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn start_timer_loop(app: AppHandle, state: Arc<AppState>) {
    let app_clone = app.clone();
    
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(Duration::from_millis(100));
            
            let paused = *state.is_paused.lock().unwrap();
            if paused {
                update_tray_title(&app_clone, &state.timer.lock().unwrap(), true);
                continue;
            }

            let elapsed = {
                let mut last_tick = state.last_tick.lock().unwrap();
                let now = Instant::now();
                let elapsed = now.duration_since(*last_tick);
                *last_tick = now;
                elapsed.as_millis() as u64
            };

            let mut timer = state.timer.lock().unwrap();

            if timer.time_remaining_ms > elapsed {
                timer.time_remaining_ms -= elapsed;
            } else {
                timer.time_remaining_ms = 0;
            }

            // Phase transitions
            if timer.time_remaining_ms == 0 {
                match timer.phase {
                    TimerPhase::Idle => {
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                    }
                    TimerPhase::Working => {
                        timer.phase = TimerPhase::Countdown;
                        timer.time_remaining_ms = timer.countdown_duration_ms;
                        show_notification_window(&app_clone, timer.time_remaining_ms);
                    }
                    TimerPhase::Countdown => {
                        timer.phase = TimerPhase::Break;
                        timer.time_remaining_ms = timer.break_duration_ms;
                        show_break_window(&app_clone, timer.time_remaining_ms);
                    }
                    TimerPhase::Break => {
                        timer.phase = TimerPhase::Working;
                        timer.time_remaining_ms = timer.work_duration_ms;
                        close_break_window(&app_clone);
                    }
                }
            }

            // Emit state updates to windows
            let current_state = timer.clone();
            drop(timer);
            
            let _ = app_clone.emit("timer-update", &current_state);
            update_tray_title(&app_clone, &current_state, false);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .setup(move |app| {
            // Create tray menu
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

            // Build tray icon with timer display
            let icon = app.default_window_icon().cloned().expect("no default icon");
            let _tray = TrayIconBuilder::with_id("main-tray")
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
                        show_settings_window(app);
                    }
                })
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "settings" => {
                        show_settings_window(app);
                    }
                    "pause" => {
                        if let Some(state) = app.try_state::<Arc<AppState>>() {
                            let mut paused = state.is_paused.lock().unwrap();
                            *paused = !*paused;
                            if !*paused {
                                *state.last_tick.lock().unwrap() = Instant::now();
                            }
                        }
                    }
                    "skip" => {
                        if let Some(state) = app.try_state::<Arc<AppState>>() {
                            let mut timer = state.timer.lock().unwrap();
                            close_break_window(app);
                            close_notification_window(app);
                            timer.phase = TimerPhase::Working;
                            timer.time_remaining_ms = timer.work_duration_ms;
                            *state.last_tick.lock().unwrap() = Instant::now();
                        }
                    }
                    "break_now" => {
                        if let Some(state) = app.try_state::<Arc<AppState>>() {
                            let mut timer = state.timer.lock().unwrap();
                            close_notification_window(app);
                            timer.phase = TimerPhase::Break;
                            timer.time_remaining_ms = timer.break_duration_ms;
                            *state.last_tick.lock().unwrap() = Instant::now();
                            show_break_window(app, timer.time_remaining_ms);
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            // Start the timer loop
            let handle = app.handle().clone();
            start_timer_loop(handle, app_state.clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_timer_state,
            skip_break,
            snooze_break, 
            start_break_now,
            toggle_pause,
            update_settings,
            lock_screen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
