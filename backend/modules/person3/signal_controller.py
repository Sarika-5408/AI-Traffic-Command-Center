"""
modules/person3/signal_controller.py

PERSON 3 — Traffic Signal simulation.

States: RED, YELLOW, GREEN. A simple fixed-duration cycle, advanced once per
simulation tick. Supports a manual override matching the Dashboard reference
image's "MANUAL OVERRIDE" control.
"""

import time

from click import command

CYCLE = [
    ("GREEN", 8),
    ("YELLOW", 2),
    ("RED", 6),
]


class SignalController:
    def __init__(self):
        self._index = 0
        self._state, self._duration = CYCLE[self._index]
        self._state_started_at = time.time()
        self._manual_state = None  # if set, overrides the automatic cycle
        self._ai_command = None
    def set_manual_override(self, state):
        if state is None:
            self._manual_state = None
            return
        state = state.upper()
        if state not in ("RED", "YELLOW", "GREEN"):
            raise ValueError("state must be RED, YELLOW or GREEN")
        self._manual_state = state
    def apply_ai_command(self, command):
        if command in ("HOLD_RED", "EXTEND_GREEN"):
           self._ai_command = command
        else:
           self._ai_command = None
    def tick(self):
        if self._manual_state:
            return self.status()
        if self._ai_command == "HOLD_RED":
            self._state = "RED"
            return self.status()

        if self._ai_command == "EXTEND_GREEN":
            self._state = "GREEN"
            self._duration = 12
        elapsed = time.time() - self._state_started_at
        if elapsed >= self._duration:
            self._index = (self._index + 1) % len(CYCLE)
            self._state, self._duration = CYCLE[self._index]
            self._state_started_at = time.time()

        return self.status()

    def status(self):
        if self._manual_state:
            return {
                "signal_state": self._manual_state,
                "mode": "MANUAL_OVERRIDE",
                "auto_hold": "STANDBY",
            }
        return {
            "signal_state": self._state,
            "mode": "AUTOMATIC",
            "auto_hold": "READY",
        }


controller = SignalController()
