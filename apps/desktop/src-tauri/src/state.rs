use crate::clock::{Clock, TimerPhase};
use crate::timer::Action;
use serde::Serialize;
use std::sync::{mpsc, Mutex};
use std::time::Instant;

#[derive(Clone, Serialize)]
pub struct TimerState {
    phase: &'static str,
    time_remaining_ms: u64,
    phase_duration_ms: u64,
    work_duration_ms: u64,
    break_duration_ms: u64,
    is_paused: bool,
}

impl TimerState {
    pub fn new(clock: &Clock, now: Instant) -> Self {
        Self {
            phase: match clock.phase {
                TimerPhase::Working => "Working",
                TimerPhase::Break => "Break",
            },
            time_remaining_ms: clock.remaining(now).as_millis() as u64,
            phase_duration_ms: clock.total.as_millis() as u64,
            work_duration_ms: clock.work.as_millis() as u64,
            break_duration_ms: clock.rest.as_millis() as u64,
            is_paused: clock.paused,
        }
    }
}

pub struct AppState {
    pub clock: Mutex<Clock>,
    pub actions: mpsc::Sender<Action>,
}

impl AppState {
    pub fn new() -> (Self, mpsc::Receiver<Action>) {
        let (actions, receiver) = mpsc::channel();
        (
            Self {
                clock: Mutex::new(Clock::default()),
                actions,
            },
            receiver,
        )
    }
}
