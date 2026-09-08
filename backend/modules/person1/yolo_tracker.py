
"""
Person 1 - Real YOLOv8 Vehicle Detection + ByteTrack Tracking

Output schema is compatible with Person 2 risk engine.
"""

from collections import defaultdict, deque
from pathlib import Path
import math

from ultralytics import YOLO


# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

MODEL_PATH = Path(r"D:\projects\traffic and accident\traffic-command-center\person 2 done\yolov8m.pt")
VIDEO_PATH = Path(r"D:\projects\traffic and accident\traffic-command-center\traffic.mp4")
TRACKER_PATH = Path(r"D:\projects\traffic and accident\traffic-command-center\bytetrack_custom.yaml")

CONFIDENCE = 0.35

# COCO vehicle classes used by YOLO
VEHICLE_CLASSES = {
    1: "bike",       # bicycle
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# Recent history kept for Person 2
HISTORY_LENGTH = 10

# Current video FPS
FPS = 30.0


# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------

def calculate_direction(old_x, old_y, new_x, new_y):
    """
    Estimate movement direction from center-point movement.
    """

    dx = new_x - old_x
    dy = new_y - old_y

    movement = math.sqrt(dx * dx + dy * dy)

    # Vehicle almost stationary
    if movement < 2:
        return "unknown"

    # Vertical movement
    if abs(dy) > abs(dx):
        if dy < 0:
            return "north"
        return "south"

    # Horizontal movement
    if dx > 0:
        return "east"

    return "west"


def pixel_speed(old_x, old_y, new_x, new_y):
    """
    Calculate movement speed in pixels/second.
    """

    distance = math.sqrt(
        (new_x - old_x) ** 2 +
        (new_y - old_y) ** 2
    )

    return round(distance * FPS, 2)


def pixels_to_kmh(speed_pixels_per_sec):
    """
    Approximate pixel speed to km/h.

    This is an initial project-level estimate.
    Later this can be calibrated using camera geometry.
    """

    return round(speed_pixels_per_sec / 1.6, 2)


# ---------------------------------------------------------
# YOLO TRACKER
# ---------------------------------------------------------

class YOLOVehicleTracker:

    def __init__(
        self,
        model_path=MODEL_PATH,
        tracker_path=TRACKER_PATH,
        confidence=CONFIDENCE,
    ):

        self.model = YOLO(str(model_path))

        self.tracker_path = str(tracker_path)
        self.confidence = confidence

        # Position history per vehicle ID
        self.position_history = defaultdict(
            lambda: deque(maxlen=HISTORY_LENGTH)
        )

        # Speed history per vehicle ID
        self.speed_history = defaultdict(
            lambda: deque(maxlen=HISTORY_LENGTH)
        )

        self.frame_number = 0

    # -----------------------------------------------------
    # PROCESS ONE FRAME
    # -----------------------------------------------------

    def process_frame(self, frame):

        self.frame_number += 1

        results = self.model.track(
            source=frame,
            tracker=self.tracker_path,
            conf=self.confidence,
            persist=True,
            verbose=False,
        )

        if not results:
            return []

        result = results[0]

        if result.boxes is None:
            return []

        vehicles = []

        boxes = result.boxes

        for box in boxes:

            # Need tracking ID
            if box.id is None:
                continue

            track_id = int(box.id.item())

            class_id = int(box.cls.item())

            # Ignore persons and other non-vehicle objects
            if class_id not in VEHICLE_CLASSES:
                continue

            vehicle_type = VEHICLE_CLASSES[class_id]

            # -------------------------------------------------
            # BOUNDING BOX
            # -------------------------------------------------

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            # Center point
            x_center = (x1 + x2) / 2
            y_center = (y1 + y2) / 2

            # -------------------------------------------------
            # SPEED + DIRECTION
            # -------------------------------------------------

            previous = None

            if self.position_history[track_id]:
                previous = self.position_history[track_id][-1]

            direction = "unknown"
            speed_pixels = 0.0

            if previous is not None:

                old_x, old_y = previous

                direction = calculate_direction(
                    old_x,
                    old_y,
                    x_center,
                    y_center,
                )

                speed_pixels = pixel_speed(
                    old_x,
                    old_y,
                    x_center,
                    y_center,
                )

            speed_kmh = pixels_to_kmh(speed_pixels)

            # -------------------------------------------------
            # SAVE POSITION
            # -------------------------------------------------

            self.position_history[track_id].append(
                (x_center, y_center)
            )

            # -------------------------------------------------
            # SAVE SPEED
            # -------------------------------------------------

            self.speed_history[track_id].append(
                speed_kmh
            )

            # -------------------------------------------------
            # BUILD PERSON 2 COMPATIBLE HISTORY
            # -------------------------------------------------
            #
            # Person 2 expects:
            #
            # history[-2]["speed"]
            # history[-2]["x"]
            # history[-2]["y"]
            #
            # Therefore each history item is a dictionary.
            #

            history = []

            for i in range(
                len(self.position_history[track_id])
            ):

                position = self.position_history[track_id][i]
                speed = self.speed_history[track_id][i]

                history.append({
                    "speed": speed,
                    "x": round(position[0], 2),
                    "y": round(position[1], 2),
                })

            # -------------------------------------------------
            # PERSON 2 COMPATIBLE VEHICLE DATA
            # -------------------------------------------------

            vehicle = {
                "vehicle_id": track_id,

                "type": vehicle_type,

                "speed": speed_kmh,

                "direction": direction,

                # Bounding-box top-left position
                "x": round(x_center, 2),
                "y": round(y_center, 2),

                # Center position
                "x_center": round(x_center, 2),
                "y_center": round(y_center, 2),

                "speed_pixels_per_sec": speed_pixels,

                # IMPORTANT:
                # History contains speed + x + y
                # for Person 2 risk engine.
                "history": history,

                "frame": self.frame_number,
            }

            vehicles.append(vehicle)

        return vehicles


# ---------------------------------------------------------
# SIMPLE SINGLETON
# ---------------------------------------------------------

tracker = YOLOVehicleTracker()


# ---------------------------------------------------------
# STANDALONE VIDEO TEST
# ---------------------------------------------------------

def run_video(video_path=VIDEO_PATH):

    import cv2

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: {video_path}"
        )

    print("YOLO REAL VEHICLE TRACKER STARTED")
    print(f"Video: {video_path}")

    while True:

        success, frame = cap.read()

        if not success:
            break

        vehicles = tracker.process_frame(frame)

        print(
            f"Frame {tracker.frame_number}: "
            f"{len(vehicles)} vehicles"
        )

        for vehicle in vehicles:

            print(
                f"  ID={vehicle['vehicle_id']} "
                f"Type={vehicle['type']} "
                f"Speed={vehicle['speed']} km/h "
                f"Direction={vehicle['direction']} "
                f"Position=({vehicle['x_center']}, "
                f"{vehicle['y_center']})"
            )

    cap.release()

    print("YOLO REAL VEHICLE TRACKER COMPLETED")


# ---------------------------------------------------------
# DIRECT EXECUTION
# ---------------------------------------------------------

if __name__ == "__main__":
    run_video()

