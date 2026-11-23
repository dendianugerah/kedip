//! Deadline scheduler and timer actions shared by the webviews and tray.

use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};

use crate::clock::{TimerPhase, Transition};
use crate::state::{AppState, TimerState};
use crate::{tray, windows};

pub enum Action {
    Refresh,
    OpenSettings,
    Skip,
    Snooze(Duration),
    BreakNow,
    TogglePause,
    SetSchedule {
        work: Duration,
        rest: Duration,
        demo: bool,
    },
    Extend(Duration),
    Stop,
}

pub fn send(app: &AppHandle, action: Action) {
    let _ = app.state::<AppState>().actions.send(action);
}

pub fn start(app: AppHandle, actions: Receiver<Action>) {
    std::thread::spawn(move || {
        let mut wake = None::<Instant>;
        let mut tray_status = None;
        loop {
            let action = match wake {
                Some(at) => {
                    match actions.recv_timeout(at.saturating_duration_since(Instant::now())) {
                        Ok(action) => action,
                        Err(RecvTimeoutError::Timeout) => Action::Refresh,
                        Err(RecvTimeoutError::Disconnected) => break,
                    }
                }
                None => match actions.recv() {
                    Ok(action) => action,
                    Err(_) => break,
                },
            };
            if matches!(action, Action::Stop) {
                break;
            }
            wake = apply(&app, action, &mut tray_status);
        }
    });
}

fn apply(
    app: &AppHandle,
    action: Action,
    tray_status: &mut Option<tray::Status>,
) -> Option<Instant> {
    let state = app.state::<AppState>();
    let now = Instant::now();
    let (snapshot, remaining, phase, paused, warning, show_warning, show_break, close_break) = {
        let mut clock = state.clock.lock().unwrap();
        let was_break = clock.phase == TimerPhase::Break;
        let was_warning = clock.warning;
        match action {
            Action::Skip => clock.reset(now),
            Action::Snooze(duration) if was_warning => clock.postpone(now, duration),
            Action::BreakNow if !was_break => clock.take_break(now),
            Action::TogglePause => clock.toggle_pause(now),
            Action::SetSchedule { work, rest, demo } => {
                clock.work = work;
                clock.rest = rest;
                if demo {
                    clock.activate(now, Duration::from_secs(40));
                } else if !was_break {
                    clock.reset(now);
                }
            }
            Action::Extend(duration) => clock.add_time(now, duration),
            _ => {}
        }
        let transition = clock.advance(now);
        let is_break = clock.phase == TimerPhase::Break;
        (
            TimerState::new(&clock, now),
            clock.remaining(now),
            clock.phase,
            clock.paused,
            clock.warning,
            transition == Some(Transition::Warn),
            is_break && !was_break,
            !is_break && was_break,
        )
    };

    if !warning {
        windows::close_notification(app);
    }
    if close_break {
        windows::close_break(app);
    }
    if show_break {
        windows::show_break(app, remaining.as_millis() as u64);
    } else if show_warning {
        windows::show_notification(app, remaining.as_millis() as u64);
    }
    if matches!(action, Action::OpenSettings) {
        windows::show_settings(app);
    }

    let mut countdown_visible = false;
    let mut script = None;
    for label in ["settings", "notification", windows::PRIMARY_BREAK_LABEL] {
        if let Some(window) = app.get_webview_window(label) {
            if window.is_visible().unwrap_or(true) && !window.is_minimized().unwrap_or(false) {
                countdown_visible = true;
                let script = script.get_or_insert_with(|| {
                    format!(
                        "window.dispatchEvent(new CustomEvent('kedip:timer-update', {{ detail: {} }}))",
                        serde_json::to_string(&snapshot).expect("timer snapshot is serializable")
                    )
                });
                let _ = window.eval(script.as_str());
            }
        }
    }

    tray::update_status(app, tray_status, phase, paused, remaining);
    let next_wake =
        state
            .clock
            .lock()
            .unwrap()
            .next_wake(now, countdown_visible, cfg!(target_os = "macos"));
    next_wake
}
