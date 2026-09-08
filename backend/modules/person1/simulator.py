"""
modules/person1/simulator.py

PERSON 1 — Vehicle Detection, Classification, Tracking, Speed & Direction.

IMPORTANT: The real Person 1 implementation (YOLO weights + video pipeline)
was not included in the files provided for this integration. This module is
a clearly-labelled SIMULATED replacement that produces output in the exact
schema the real module is expected to produce, so the rest of the system
(Person 2, Person 3, the Dashboard) can be built and demoed end-to-end.

To integrate the real Person 1 module later:
  1. Keep the output schema below unchanged (vehicle_id, type, speed,
     direction, x, y, x_center, y_center, speed_pixels_per_sec, frame).
  2. Replace VehicleSimulator.tick() with code that reads YOLO's per-frame
     detections/tracks and maps them onto this schema.
  3. Nothing in Person 2, Person 3 or the frontend needs to change.

Output vehicle schema (per vehicle):
{
  "vehicle_id": "V001",
  "type": "car",
  "speed": 48,                 # km/h, for display
  "direction": "north",
  "x": 420,
  "y": 280,
  "x_center": 420,             # alias of x, kept for Person 2 compatibility
  "y_center": 280,             # alias of y, kept for Person 2 compatibility
  "speed_pixels_per_sec": 71.0,# internal unit Person 2's algorithm expects
  "frame": 118,
  "history": [ ... ]           # last few (speed, direction, x, y) samples
}
"""

import random

VEHICLE_TYPES = ["car", "bike", "bus", "truck", "auto", "other"]
DIRECTIONS = ["north", "south", "east", "west"]

# Rough plausible speed ranges (km/h) per vehicle type, used only by the
# simulator to keep generated data believable.
SPEED_RANGE_KMH = {
    "car": (20, 65),
    "bike": (15, 45),
    "bus": (15, 40),
    "truck": (10, 35),
    "auto": (10, 35),
    "other": (5, 25),
}

FRAME_WIDTH = 960
FRAME_HEIGHT = 540


class VehicleSimulator:
    def __init__(self, max_vehicles=28, seed=None):
        self.max_vehicles = max_vehicles
        self.frame = 0
        self._next_id = 1
        self.vehicles = {}  # vehicle_id -> full mutable vehicle state
        if seed is not None:
            random.seed(seed)

    def _spawn_vehicle(self):
        vtype = random.choice(VEHICLE_TYPES)
        direction = random.choice(DIRECTIONS)
        vehicle_id = f"V{self._next_id:03d}"
        self._next_id += 1

        if direction == "north":
            x, y = random.randint(50, FRAME_WIDTH - 50), FRAME_HEIGHT - 10
        elif direction == "south":
            x, y = random.randint(50, FRAME_WIDTH - 50), 10
        elif direction == "east":
            x, y = 10, random.randint(50, FRAME_HEIGHT - 50)
        else:
            x, y = FRAME_WIDTH - 10, random.randint(50, FRAME_HEIGHT - 50)

        lo, hi = SPEED_RANGE_KMH[vtype]
        speed = random.randint(lo, hi)

        self.vehicles[vehicle_id] = {
            "vehicle_id": vehicle_id,
            "type": vtype,
            "direction": direction,
            "x": x,
            "y": y,
            "speed": speed,
            "history": [],
            "age": 0,
        }

    def _move_vehicle(self, v):
        step = max(2, int(v["speed"] / 6))
        if v["direction"] == "north":
            v["y"] -= step
        elif v["direction"] == "south":
            v["y"] += step
        elif v["direction"] == "east":
            v["x"] += step
        else:
            v["x"] -= step

        # Occasionally simulate a real speed change event (braking / accelerating)
        r = random.random()
        if r < 0.06:
            v["speed"] = max(3, int(v["speed"] * random.uniform(0.35, 0.6)))  # sudden brake
        elif r < 0.10:
            v["speed"] = min(90, int(v["speed"] * random.uniform(1.2, 1.4)))  # sudden accel
        else:
            v["speed"] = max(3, v["speed"] + random.randint(-3, 3))

        # Occasionally simulate a swerve (direction jitter within lane, tracked via x/y jump)
        if random.random() < 0.05:
            v["x"] += random.randint(-25, 25)
            v["y"] += random.randint(-25, 25)

        v["age"] += 1

    def _out_of_bounds(self, v):
        return v["x"] < -20 or v["x"] > FRAME_WIDTH + 20 or v["y"] < -20 or v["y"] > FRAME_HEIGHT + 20

    def tick(self):
        """Advance one simulated frame and return the current Person 1 output."""
        self.frame += 1

        # Spawn new vehicles up to max_vehicles
        if len(self.vehicles) < self.max_vehicles and random.random() < 0.6:
            self._spawn_vehicle()

        # Move existing, drop ones that left the frame
        for vid in list(self.vehicles.keys()):
            v = self.vehicles[vid]
            prev_speed = v["speed"]
            self._move_vehicle(v)

            v["history"].append({
                "frame": self.frame,
                "speed": prev_speed,
                "direction": v["direction"],
                "x": v["x"],
                "y": v["y"],
            })
            v["history"] = v["history"][-8:]  # keep short rolling window

            if self._out_of_bounds(v):
                del self.vehicles[vid]

        output = []
        for v in self.vehicles.values():
            speed_kmh = v["speed"]
            output.append({
                "vehicle_id": v["vehicle_id"],
                "type": v["type"],
                "speed": speed_kmh,
                "direction": v["direction"],
                "x": v["x"],
                "y": v["y"],
                "x_center": v["x"],
                "y_center": v["y"],
                "speed_pixels_per_sec": round(speed_kmh * 1.6, 2),  # display->px/s unit for Person 2 math
                "frame": self.frame,
                "history": list(v["history"]),
            })

        return output


# Module-level singleton used by app.py's simulation loop
simulator = VehicleSimulator()
