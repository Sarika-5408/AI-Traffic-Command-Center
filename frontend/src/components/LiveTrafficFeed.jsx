import React from "react";
import "./LiveTrafficFeed.css";

const TYPE_COLOR = {
  car: "#22d3ee",
  bike: "#f59e0b",
  bus: "#a855f7",
  truck: "#ef4444",
  auto: "#22c55e",
  other: "#94a3b8",
};

const FRAME_W = 960;
const FRAME_H = 540;

export default function LiveTrafficFeed({ vehicles = [], isLive }) {
  const maxX = Math.max(...vehicles.map(v => Number(v.x) || 0), 2160);
  const maxY = Math.max(...vehicles.map(v => Number(v.y) || 0), 3840);

  return (
    <div className="panel traffic-feed-panel">
      <div className="panel-header">
        <span>LIVE TRAFFIC FEED</span>

        <span
          className={`feed-live-badge ${
            isLive ? "" : "feed-live-badge--offline"
          }`}
        >
          <span className="feed-live-dot" />
          {isLive ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      <div className="traffic-feed-canvas">
        <svg
          viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020817" />
              <stop offset="50%" stopColor="#062b4a" />
              <stop offset="100%" stopColor="#020817" />
            </linearGradient>

            <linearGradient id="road1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#071a2e" />
              <stop offset="50%" stopColor="#102b43" />
              <stop offset="100%" stopColor="#071a2e" />
            </linearGradient>

            <linearGradient id="road2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#071a2e" />
              <stop offset="50%" stopColor="#102b43" />
              <stop offset="100%" stopColor="#071a2e" />
            </linearGradient>

            <pattern
              id="techGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(34,211,238,0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* AI BLUE BACKGROUND */}
          <rect width="960" height="540" fill="url(#bg)" />
          <rect width="960" height="540" fill="url(#techGrid)" />

          {/* TOP ROAD */}
          <rect
            x="0"
            y="70"
            width="960"
            height="150"
            rx="8"
            fill="url(#road1)"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="2"
          />

          {/* BOTTOM ROAD */}
          <rect
            x="0"
            y="320"
            width="960"
            height="150"
            rx="8"
            fill="url(#road2)"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="2"
          />

          {/* TOP ROAD LANE LINES */}
          <line
            x1="0"
            y1="120"
            x2="960"
            y2="120"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="2"
            strokeDasharray="18 14"
          />

          <line
            x1="0"
            y1="170"
            x2="960"
            y2="170"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="2"
            strokeDasharray="18 14"
          />

          {/* BOTTOM ROAD LANE LINES */}
          <line
            x1="0"
            y1="370"
            x2="960"
            y2="370"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="2"
            strokeDasharray="18 14"
          />

          <line
            x1="0"
            y1="420"
            x2="960"
            y2="420"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="2"
            strokeDasharray="18 14"
          />

          {/* ROAD EDGES */}
          <line
            x1="0"
            y1="70"
            x2="960"
            y2="70"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
          />

          <line
            x1="0"
            y1="220"
            x2="960"
            y2="220"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
          />

          <line
            x1="0"
            y1="320"
            x2="960"
            y2="320"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
          />

          <line
            x1="0"
            y1="470"
            x2="960"
            y2="470"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
          />

          {/* CENTER DIVIDER */}
          <rect
            x="0"
            y="245"
            width="960"
            height="50"
            fill="rgba(168,85,247,0.08)"
          />

          <line
            x1="0"
            y1="270"
            x2="960"
            y2="270"
            stroke="rgba(168,85,247,0.55)"
            strokeWidth="2"
            strokeDasharray="14 10"
          />

          {/* VEHICLES */}
          {vehicles.map((v) => {
            const color = TYPE_COLOR[v.type] || TYPE_COLOR.other;

            const px = ((Number(v.x) || 0) / maxX) * 900 + 30;
            const rawY = ((Number(v.y) || 0) / maxY) * 480 + 30;

            const py =
              rawY < 270
                ? 100 + (rawY % 100)
                : 340 + (rawY % 100);

            const w = 64;
            const h = 38;

            const x = Math.max(
              5,
              Math.min(960 - w - 5, px - w / 2)
            );

            const y = Math.max(
              75,
              Math.min(470 - h, py - h / 2)
            );

            return (
              <g key={v.vehicle_id}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="5"
                  fill="rgba(2,6,23,0.78)"
                  stroke={color}
                  strokeWidth="2.5"
                />

                <rect
                  x={x}
                  y={y}
                  width="5"
                  height={h}
                  rx="2"
                  fill={color}
                />

                <text
                  x={x + 10}
                  y={y - 7}
                  fill={color}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  #{v.vehicle_id}
                </text>

                <text
                  x={x + 10}
                  y={y + 16}
                  fill="#e2e8f0"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {(v.type || "other").toUpperCase()}
                </text>

                <text
                  x={x + 10}
                  y={y + 30}
                  fill={color}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {Number(v.speed || 0).toFixed(1)} km/h
                </text>
              </g>
            );
          })}

          {/* CAMERA LABELS */}
          <text
            x="18"
            y="55"
            fill="#22d3ee"
            fontSize="11"
            fontWeight="700"
            fontFamily="monospace"
          >
            CAM_01 • NORTHBOUND
          </text>

          <text
            x="18"
            y="510"
            fill="#22d3ee"
            fontSize="11"
            fontWeight="700"
            fontFamily="monospace"
          >
            CAM_01 • SOUTHBOUND
          </text>

          <text
            x="780"
            y="285"
            fill="#a855f7"
            fontSize="10"
            fontWeight="700"
            fontFamily="monospace"
          >
            AI TRAFFIC ZONE
          </text>
        </svg>
      </div>

      <div className="traffic-feed-meta">
        <span>Camera: CAM_01</span>
        <span>Resolution: 960x540</span>
        <span>Tracked: {vehicles.length}</span>
        <span>Detector: YOLOv8 + ByteTrack</span>
      </div>
    </div>
  );
}