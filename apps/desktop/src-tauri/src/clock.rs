use std::time::{Duration, Instant};

const SECOND: Duration = Duration::from_secs(1);
const WARNING: Duration = Duration::from_secs(30);
const MINUTE: Duration = Duration::from_secs(60);

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TimerPhase {
    Working,
    Break,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Transition {
    Warn,
    StartBreak,
    EndBreak,
}

pub struct Clock {
    pub phase: TimerPhase,
    pub work: Duration,
    pub rest: Duration,
    pub paused: bool,
    pub warning: bool,
    pub total: Duration,
    onboarded: bool,
    deadline: Option<Instant>,
    frozen: Duration,
}

impl Default for Clock {
    fn default() -> Self {
        Self {
            phase: TimerPhase::Working,
            work: Duration::from_secs(1200),
            rest: Duration::from_secs(20),
            paused: false,
            warning: false,
            total: Duration::from_secs(1200),
            onboarded: false,
            deadline: None,
            frozen: Duration::from_secs(1200),
        }
    }
}

impl Clock {
    pub fn remaining(&self, now: Instant) -> Duration {
        self.deadline.map_or(self.frozen, |deadline| {
            deadline.saturating_duration_since(now)
        })
    }

    fn start(&mut self, now: Instant, phase: TimerPhase, duration: Duration) {
        self.phase = phase;
        self.warning = false;
        self.total = duration;
        self.frozen = duration;
        self.deadline = (phase == TimerPhase::Break || (self.onboarded && !self.paused))
            .then(|| now + duration);
    }

    pub fn activate(&mut self, now: Instant, duration: Duration) {
        self.onboarded = true;
        self.postpone(now, duration);
    }

    pub fn reset(&mut self, now: Instant) {
        self.postpone(now, self.work);
    }

    pub fn postpone(&mut self, now: Instant, duration: Duration) {
        self.start(now, TimerPhase::Working, duration);
    }

    pub fn take_break(&mut self, now: Instant) {
        self.start(now, TimerPhase::Break, self.rest);
    }

    pub fn add_time(&mut self, now: Instant, duration: Duration) {
        if self.phase == TimerPhase::Break {
            let remaining = self.remaining(now);
            let extended = (remaining + duration).min(Duration::from_secs(86_400));
            self.total += extended - remaining;
            self.deadline = Some(now + extended);
        }
    }

    pub fn toggle_pause(&mut self, now: Instant) {
        if self.phase != TimerPhase::Working || !self.onboarded {
            return;
        }
        if self.paused {
            self.deadline = Some(now + self.frozen);
        } else {
            self.frozen = self.remaining(now);
            self.deadline = None;
            self.warning = false;
        }
        self.paused = !self.paused;
    }

    pub fn advance(&mut self, now: Instant) -> Option<Transition> {
        let remaining = self.deadline?.saturating_duration_since(now);
        if remaining.is_zero() {
            return Some(match self.phase {
                TimerPhase::Working => {
                    self.take_break(now);
                    Transition::StartBreak
                }
                TimerPhase::Break => {
                    self.reset(now);
                    Transition::EndBreak
                }
            });
        }
        if self.phase == TimerPhase::Working && !self.warning && remaining <= WARNING {
            self.warning = true;
            return Some(Transition::Warn);
        }
        None
    }

    pub fn next_wake(
        &self,
        now: Instant,
        countdown_visible: bool,
        tray_minutes: bool,
    ) -> Option<Instant> {
        let deadline = self.deadline?;
        let transition = if self.phase == TimerPhase::Working && !self.warning {
            deadline.checked_sub(WARNING).unwrap_or(now).max(now)
        } else {
            deadline
        };
        let precision = if countdown_visible {
            SECOND
        } else if tray_minutes {
            MINUTE
        } else {
            return Some(transition);
        };
        let until_change = self.remaining(now).as_nanos() % precision.as_nanos();
        let interval = if until_change == 0 {
            precision
        } else {
            Duration::from_nanos(until_change as u64)
        };
        Some(transition.min(now + interval))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn warning_and_phase_changes_are_scheduled_without_idle_polling() {
        let start = Instant::now();
        let mut clock = Clock::default();
        assert_eq!(clock.next_wake(start, false, false), None);
        clock.activate(start, clock.work);
        let warning = start + clock.work - WARNING;
        assert_eq!(clock.next_wake(start, false, false), Some(warning));
        assert_eq!(clock.next_wake(start, false, true), Some(start + MINUTE));
        assert_eq!(clock.next_wake(start, true, false), Some(start + SECOND));
        assert_eq!(clock.advance(warning), Some(Transition::Warn));
        assert_eq!(clock.advance(warning + SECOND), None);
        let break_start = start + clock.work;
        assert_eq!(clock.next_wake(warning, false, false), Some(break_start));
        assert_eq!(clock.advance(break_start), Some(Transition::StartBreak));
        let break_end = break_start + clock.rest;
        assert_eq!(clock.next_wake(break_start, false, false), Some(break_end));
        assert_eq!(clock.advance(break_end), Some(Transition::EndBreak));
        assert_eq!(clock.remaining(break_end), clock.work);
    }

    #[test]
    fn late_wake_starts_full_break_without_showing_a_stale_warning() {
        let start = Instant::now();
        let mut clock = Clock::default();
        clock.activate(start, clock.work);
        let late = start + clock.work + MINUTE;
        assert_eq!(clock.advance(late), Some(Transition::StartBreak));
        assert_eq!(clock.remaining(late), clock.rest);
    }

    #[test]
    fn pause_preserves_time_and_manual_break_leaves_reminders_paused() {
        let start = Instant::now();
        let mut clock = Clock::default();
        clock.activate(start, clock.work);
        clock.toggle_pause(start + MINUTE);
        assert_eq!(clock.next_wake(start + MINUTE, true, true), None);
        assert_eq!(clock.remaining(start + clock.work), clock.work - MINUTE);
        clock.toggle_pause(start + clock.work);
        assert_eq!(clock.remaining(start + clock.work), clock.work - MINUTE);
        clock.toggle_pause(start + clock.work);
        clock.take_break(start + clock.work);
        let end = start + clock.work + clock.rest;
        assert_eq!(clock.advance(end), Some(Transition::EndBreak));
        assert!(clock.paused);
        assert_eq!(clock.next_wake(end, true, true), None);
    }

    #[test]
    fn snooze_and_extend_reschedule_their_deadlines() {
        let start = Instant::now();
        let mut clock = Clock::default();
        clock.activate(start, WARNING);
        assert_eq!(clock.advance(start), Some(Transition::Warn));
        clock.postpone(start, 5 * MINUTE);
        assert!(!clock.warning);
        assert_eq!(
            clock.next_wake(start, false, false),
            Some(start + 5 * MINUTE - WARNING)
        );
        clock.take_break(start);
        clock.add_time(start + SECOND, MINUTE);
        assert_eq!(
            clock.next_wake(start + SECOND, false, false),
            Some(start + clock.rest + MINUTE)
        );
    }
}
