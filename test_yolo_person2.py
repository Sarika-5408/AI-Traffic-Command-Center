import cv2

from backend.modules.person1.yolo_tracker import YOLOVehicleTracker, VIDEO_PATH
from backend.modules.person2.risk_engine import compute_accident_risk


tracker = YOLOVehicleTracker()

cap = cv2.VideoCapture(str(VIDEO_PATH))

if not cap.isOpened():
    raise RuntimeError(f"Could not open video: {VIDEO_PATH}")


for _ in range(30):

    success, frame = cap.read()

    if not success:
        break

    vehicles = tracker.process_frame(frame)

    events, risk = compute_accident_risk(vehicles)

    print(
        f"Frame {tracker.frame_number}: "
        f"Vehicles={len(vehicles)}, "
        f"Risk={risk}, "
        f"Events={len(events)}"
    )


cap.release()

print("YOLO -> PERSON 2 INTEGRATION TEST COMPLETED")