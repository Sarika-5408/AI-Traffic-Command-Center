"""
services/state.py

A single, thread-safe, in-memory state store shared by Person 1, Person 2 and
Person 3 modules. A background thread advances the simulation on a fixed
interval so that every API route reads a consistent snapshot instead of each
route generating its own random data independently.

NOTE ON PERSON 1:
No real YOLO / video-based detector was supplied with this project (only
`integrate_person1.py`, which is actually Person 2's near-miss script that
consumes Person 1's CSV *output*). To keep the full pipeline
(Person 1 -> Person 2 -> Person 3 -> Dashboard) runnable end-to-end, Person 1
is implemented here as a physics-based *simulator* that produces data in
exactly the schema Person 1's real detector is expected to produce. Swapping
in a real YOLO pipeline later only requires replacing
`modules/person1/simulator.py`'s `tick()` output — nothing downstream needs
to change, since Person 2 and Person 3 only depend on the schema, not on how
it was produced.
"""

import threading
import time
from collections import deque

from config import Config


class SimulationState:
    def __init__(self):
        self._lock = threading.RLock()
        self.frame_count = 0
        self.vehicles = []              # current Person 1 output (list of dicts)
        self.risk_events = deque(maxlen=50)   # rolling Person 2 output
        self.overall_risk = {}          # last computed overall risk snapshot
        self.traffic_context = {}       # last computed Person 3 output
        self.started_at = time.time()
        self._running = False
        self._thread = None

    # ---- generic accessors (thread-safe) ----
    def snapshot(self):
        with self._lock:
            return {
                "frame_count": self.frame_count,
                "vehicles": list(self.vehicles),
                "risk_events": list(self.risk_events),
                "overall_risk": dict(self.overall_risk),
                "traffic_context": dict(self.traffic_context),
                "uptime_seconds": round(time.time() - self.started_at, 1),
            }

    def update(self, vehicles=None, new_risk_events=None, overall_risk=None, traffic_context=None):
        with self._lock:
            self.frame_count += 1
            if vehicles is not None:
                self.vehicles = vehicles
            if new_risk_events:
                for ev in new_risk_events:
                    self.risk_events.appendleft(ev)
            if overall_risk is not None:
                self.overall_risk = overall_risk
            if traffic_context is not None:
                self.traffic_context = traffic_context

    def start(self, tick_fn):
        """Start the background simulation loop. tick_fn() performs one full
        Person1 -> Person2 -> Person3 -> overall-risk cycle and returns None
        (it updates state itself)."""
        if self._running:
            return
        self._running = True

        def loop():
            while self._running:
                try:
                    tick_fn()
                except Exception as exc:  # pragma: no cover - defensive
                    print(f"[simulation loop] tick error: {exc}")
                time.sleep(Config.SIMULATION_FRAME_INTERVAL_SECONDS)

        self._thread = threading.Thread(target=loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False


state = SimulationState()
