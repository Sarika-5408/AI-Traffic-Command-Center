# AI-Powered Intelligent Traffic Monitoring and Accident Risk Prediction System

An intelligent traffic command center that monitors vehicles, detects dangerous
driving situations, analyzes traffic/environmental conditions, calculates
accident risk, and presents everything through a real-time dashboard.

```
Landing Page → Initialize System → Loading → Dashboard
                                                 │
                     ┌───────────────┬───────────┴───────────┐
                     ▼               ▼                       ▼
                 Person 1        Person 2                Person 3
              Vehicle Detection  Accident Risk        Traffic + Environment
                     └───────────────┴───────────┬───────────┘
                                                  ▼
                                             Person 4
                                        Command Center Dashboard
                                                  │
                                                  ▼
                                           Overall Risk Level
```

---

## 0. Project status & an important note on source material

This repository was built from **three supplied files**: a Landing Page
reference image, a Dashboard reference image, and one Python script
(`integrate_person1.py`, which is actually Person 2's near-miss detection
logic — it consumes Person 1's *output*, not produces it). No existing
project folder, README, `package.json`, real Person 1 (YOLO) implementation,
or Person 3 implementation was supplied.

To deliver a complete, runnable, end-to-end system, the following are
**clearly-labelled placeholders** built to the exact contract a real module
would satisfy — swapping in real implementations later requires no changes
anywhere else in the codebase:

| Module | Status | Notes |
|---|---|---|
| Person 1 (vehicle detection) | **Simulated** | `backend/modules/person1/simulator.py`. No YOLO weights/video were supplied. Produces output in the exact schema a real detector would. |
| Person 2 (accident risk) | **Real algorithm, adapted** | `backend/modules/person2/risk_engine.py` — the near-miss distance check is the *same* algorithm from your `integrate_person1.py` (kept unmodified at `backend/modules/person2/original_person2_script.py` for reference), adapted from a batch CSV job into a live per-frame function, and extended with braking/swerving/unsafe-distance detection. |
| Person 3 (traffic/environment) | **Built new** | Density, congestion, weather (Open-Meteo, free/no key), road condition, signal simulation, time-of-day, external risk — fully implemented per spec. |
| Person 4 (dashboard/frontend) | **Built new** | Full React dashboard, wired to live backend data every 2 seconds. |

See §9 for exactly how to swap the Person 1 simulator for a real YOLO pipeline.

---

## 1. Architecture

```
traffic-command-center/
├── backend/
│   ├── app.py                  # single Flask app; runs the simulation loop
│   ├── config.py                # central config (thresholds, junction id, etc.)
│   ├── requirements.txt
│   ├── routes/                  # one file per route group, registered in __init__.py
│   ├── modules/
│   │   ├── person1/simulator.py         # vehicle detection (simulated)
│   │   ├── person2/risk_engine.py       # near-miss / braking / swerving / risk
│   │   ├── person2/original_person2_script.py  # your original script, unmodified
│   │   └── person3/                     # density, weather, road, signal, time, external risk
│   ├── services/
│   │   ├── state.py             # thread-safe shared simulation state
│   │   └── overall_risk.py      # combines Person 1+2+3 into final risk
│   └── utils/helpers.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/                # LandingPage, LoadingPage, Dashboard
│   │   ├── components/           # Sidebar, Header, StatCard, LiveTrafficFeed, ...
│   │   ├── services/             # api.js + one service per data domain
│   │   ├── hooks/useDashboardData.js   # polling + fallback-to-mock logic
│   │   ├── utils/mockData.js     # fallback data if backend is unreachable
│   │   └── assets/               # the two reference images, used directly
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

There is **one** Flask application and **one** React application — no
per-person sub-projects, no duplicate servers.

---

## 2. Data flow

```
Person 1 (every ~1.5s tick)
   → produces: [{vehicle_id, type, speed, direction, x, y, ...}, ...]
   ↓
Person 2 (same tick)
   → near-miss / sudden-braking / sudden-swerving / unsafe-distance detection
   → produces: risk events + accident_risk_score (0-100)
   ↓
Person 3 (same tick)
   → traffic density & congestion (from Person 1's vehicle list)
   → weather (Open-Meteo, cached 2 min, safe fallback if unreachable)
   → road condition (derived from weather)
   → traffic signal state (automatic cycle or manual override)
   → time of day / peak-hour flag
   → external_risk_score (0-100, weighted combination — see §5)
   ↓
Overall Risk (services/overall_risk.py)
   → combines accident_risk_score (55%) + external_risk_score (30%)
     + vehicle volume (15%) — see §5 for the documented rationale
   ↓
services/state.py holds the latest snapshot of everything above
   ↓
Frontend polls GET /api/dashboard every 2s and renders it
```

---

## 3. API reference

All routes are served by the single Flask app on port 5000.

| Method | Route | Returns |
|---|---|---|
| GET | `/api/health` | System status, junction id, module states |
| GET | `/api/vehicles` | Person 1 output: current vehicle list, counts by type |
| GET | `/api/risk` | Person 2 output: accident risk score, recent events, TTC |
| GET | `/api/traffic` | Person 3 output: density, congestion, weather, road, signal, time, external risk |
| GET | `/api/dashboard` | Combined payload of all of the above + overall risk (what the frontend actually polls) |
| GET | `/api/alerts` | Recent risk events formatted as human-readable alerts |
| GET | `/api/weather` | Just the weather sub-object |
| GET | `/api/road-condition` | Just the road-condition sub-object |
| GET | `/api/traffic-signal` | Current signal state |
| POST | `/api/traffic-signal/override` | Body `{"state": "RED"\|"YELLOW"\|"GREEN"\|null}` — manual override, `null` clears it |
| POST | `/api/traffic-context` | Body `{"road_capacity": <int>}` — updates the density calculation's capacity |

---

## 4. Fallback & error handling

- If Person 1's data is momentarily empty, `/api/vehicles` and `/api/dashboard`
  simply return an empty vehicle list — no crash.
- If the weather API is unreachable (no internet, timeout, bad response),
  `weather_service.py` returns a fixed safe fallback reading instead of
  raising. This was tested by disabling network access — confirmed working.
- On the frontend, `useDashboardData.js` polls the backend every 2 seconds.
  If a request fails, it keeps showing the last successful snapshot; if it
  has *never* had real data yet (e.g. backend not started), it shows
  built-in mock data instead of a blank screen, and displays a small
  "backend unreachable" banner.
- Real Person 1/2/3 data is always preferred over fallback data whenever the
  backend responds successfully.

---

## 5. Risk scoring — documented rationale

**Person 2 — accident risk per frame** (`risk_engine.py`): the highest
individual event score, plus a small bonus for multiple concurrent risk
events (a junction with 3 simultaneous near-misses is more dangerous than
one with a single equally-severe event).

**Person 3 — external risk score** (`risk_calculator.py`), weighted:
- Congestion 35% — most direct traffic-context driver of collisions.
- Road condition 25% — directly affects vehicle control/stopping distance.
- Weather 20% — affects visibility/reaction time; overlaps partly with road
  condition, hence a smaller independent weight.
- Time of day 10% — peak hours / night driving carry modestly higher risk.
- Signal state 10% — RED/YELLOW transitions carry slightly more risk than
  steady GREEN.

**Overall junction risk** (`overall_risk.py`), weighted:
- Person 2 accident risk 55% — the most direct, immediate signal.
- Person 3 external risk 30% — conditions that make an accident more likely.
- Person 1 vehicle volume 15% — deliberately small, since raw vehicle count
  already feeds into Person 3's congestion score; this avoids double-counting
  it while still nudging the score up when the junction is simply busy.

All three are simple weighted sums, not blind averages, and every weight is
commented in code next to where it's used.

---

## 6. Setup & running

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Runs on `http://localhost:5000`. The simulation loop starts automatically
and produces a new frame every 1.5 seconds.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite dev server), with `/api/*` requests
proxied to the backend on port 5000 (see `vite.config.js`).

For a production build:

```bash
npm run build
npm run preview
```

### Environment variables (all optional — sensible defaults exist)

| Variable | Default | Purpose |
|---|---|---|
| `HOST` | `0.0.0.0` | Flask bind host |
| `PORT` | `5000` | Flask port |
| `ROAD_CAPACITY` | `40` | Vehicles considered "at capacity" for density calc |
| `WEATHER_LAT` / `WEATHER_LON` | Chennai coords | Location used for the weather API |

---

## 7. Frontend flow (no page reloads)

`Landing → Initialize System → Loading → Dashboard` is implemented with
`react-router-dom`'s client-side navigation (`useNavigate()`), never
`window.location.href`. Every page — including the Landing Page — is built
from real React components and CSS (headline, live clock, animated AI
graphic, system-status panel, feature cards, skyline) using the two
supplied reference images only as a **visual design guide** during
development, not as rendered content: no `<img>` tag displays either
reference image anywhere in the app. The Landing Page's clock is a real
`useState`/`useEffect`-driven live clock updating every second — the time
shown in the reference image was only an example to match the *style* of,
never a value to hard-code.

### Full route map

Every sidebar item in the Dashboard is a real route, not a placeholder:

| Route | Page | Backend data used |
|---|---|---|
| `/` | Landing Page | — |
| `/loading` | Loading Page | — |
| `/dashboard` | Dashboard | `/api/dashboard`, `/api/alerts` |
| `/live-monitor` | Live Monitor | Person 1 vehicle list + type breakdown table |
| `/traffic-analytics` | Traffic Analytics | Person 3 density/congestion/speed + vehicle mix |
| `/risk-prediction` | Risk Prediction | Person 2 accident risk gauge + recent event list |
| `/risk-zones` | Risk Zones | Overall risk combination (Person 1+2+3) with weights shown |
| `/environment` | Environment | Weather / road condition / time-of-day + external risk factor breakdown |
| `/traffic-control` | Traffic Control | Signal state + manual override (`POST /api/traffic-signal/override`) |
| `/alerts` | Alerts | Full alert feed from `/api/alerts` |
| `/reports` | Reports | Live session summary built from `/api/dashboard` |
| `/settings` | Settings | Road-capacity control (`POST /api/traffic-context`) + junction info |

All of these share one `AppLayout` component (Header + Sidebar + Footer),
so every page visually belongs to the same command center, and one
`DashboardProvider` context so there is a single shared poll of
`/api/dashboard` + `/api/alerts` per page — not one poller per component.
The Sidebar's active-item highlight and browser back/forward both derive
from the real URL (`useLocation`), so they always stay in sync.

## 8. Dashboard — what's real vs. simulated

- **Live Traffic Feed**: no camera/video source was supplied, so this
  renders Person 1's actual live tracking output (vehicle_id, type, speed,
  direction, x/y) as bounding boxes on a road-grid — i.e. exactly what a
  real detector overlay draws, minus the underlying camera frame.
- **Risk Zone Map**: only shows JUNCTION_1, the one zone this system
  actually monitors. It does not invent risk levels for neighbouring
  junctions that have no live feed.
- **Weather / Road Condition / Time / Signal**: all real, computed from
  Person 3's live logic (weather via Open-Meteo where internet is available).
- **AI Recommendation**: short rule-based lines generated deterministically
  from the current traffic context (not a black-box call) — every line is
  traceable to a real threshold in the code.

## 9. Swapping in a real Person 1 (YOLO) implementation later

1. Keep `backend/modules/person1/simulator.py`'s output schema unchanged:
   `vehicle_id, type, speed, direction, x, y, x_center, y_center,
   speed_pixels_per_sec, frame, history`.
2. Replace the body of `VehicleSimulator.tick()` (or `app.py`'s call to it)
   with code that reads YOLO's per-frame detections/tracks and maps them
   onto this schema.
3. Nothing in Person 2, Person 3, the routes, or the frontend needs to
   change — they only depend on the schema, not on how it was produced.

## 10. Testing performed

- Backend: every route smoke-tested live via curl, including the manual
  signal override and traffic-context update POST routes; weather fallback
  tested by simulating an unreachable API.
- Frontend: production build (`npm run build`) completed with no errors;
  Landing, Loading, and Dashboard pages visually verified with a headless
  browser against the reference images at multiple viewport widths
  (1700px, 1600px, 1280px) — dashboard confirmed to receive and render live
  data end-to-end (vehicle count, risk scores, alerts, weather, signal
  state, and the manual-override control all confirmed working against the
  running backend).

## 11. Stack

- Frontend: React 18, Vite 5, React Router 6, plain CSS (no UI framework)
- Backend: Python 3, Flask, Flask-CORS, Requests
- No database, no authentication, no unnecessary dependencies — kept simple
  and explainable for a college project, per the brief.
