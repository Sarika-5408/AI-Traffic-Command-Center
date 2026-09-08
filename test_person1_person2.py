
"""
Person 1 -> Person 2 Compatibility Test

Checks whether YOLOVehicleTracker produces
the history format expected by Person 2 risk_engine.py.
"""

import cv2

from backend.modules.person1.yolo_tracker import YOLOVehicleTracker


VIDEO_PATH = "traffic.mp4"


def main():

    print("=" * 60)
    print("PERSON 1 -> PERSON 2 COMPATIBILITY TEST")
    print("=" * 60)

    tracker = YOLOVehicleTracker()

    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        print("ERROR: Could not open traffic.mp4")
        return

    vehicles = []

    # Process enough frames so vehicles have history
    for _ in range(20):

        success, frame = cap.read()

        if not success:
            break

        vehicles = tracker.process_frame(frame)

    cap.release()

    print()
    print("Frames processed:", tracker.frame_number)
    print("Vehicles detected:", len(vehicles))
    print()

    if not vehicles:
        print("ERROR: No vehicles detected.")
        return

    # Check first few vehicles
    checked = 0

    for vehicle in vehicles:

        history = vehicle.get("history", [])

        print("-" * 60)
        print("Vehicle ID:", vehicle["vehicle_id"])
        print("Type:", vehicle["type"])
        print("Current speed:", vehicle["speed"])
        print("History length:", len(history))

        if not history:
            print("❌ FAIL: History is empty")
            continue

        print("Latest history item:")
        print(history[-1])

        # -------------------------------------------------
        # PERSON 2 EXPECTATIONS
        # -------------------------------------------------

        valid = True

        for item in history:

            if not isinstance(item, dict):
                print("❌ FAIL: History item is not a dictionary")
                valid = False
                break

            required_keys = {"speed", "x", "y"}

            if not required_keys.issubset(item.keys()):
                print(
                    "❌ FAIL: Missing required keys.",
                    "Found:",
                    item.keys()
                )
                valid = False
                break

        if valid:
            print("✅ History format is Person 2 compatible")

            if len(history) >= 2:

                previous = history[-2]
                current = history[-1]

                print()
                print("Person 2 test:")
                print("Previous:", previous)
                print("Current :", current)

                dx = current["x"] - previous["x"]
                dy = current["y"] - previous["y"]

                print("dx =", round(dx, 2))
                print("dy =", round(dy, 2))

                print("Previous speed:", previous["speed"])
                print("Current speed :", current["speed"])

                print("✅ Person 2 history access works")

            else:
                print(
                    "⚠️ Only one history item available."
                )

        checked += 1

        if checked >= 3:
            break

    print()
    print("=" * 60)
    print("PERSON 1 -> PERSON 2 TEST COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    main()

