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
const SOURCE_W = 2160;
const SOURCE_H = 3840;

/**
 * Live Traffic Feed panel.
 *
 * No real camera/video source was provided with this project (only
 * Person 1's expected output schema). Rather than faking a camera image,
 * this renders Person 1's actual live vehicle-tracking output (x, y, type,
 * speed, direction, vehicle_id) as bounding boxes on a road-grid canvas —
 * i.e. exactly what a real detector overlay would draw, just without an
 * underlying video frame. Swapping in a real camera feed later only means
 * rendering this same overlay on top of a <video>/<img> element instead of
 * the grid background.
 */
export default function LiveTrafficFeed({ vehicles = [], isLive }) {
  return (
    <div className="panel traffic-feed-panel">
      <div className="panel-header">
        <span>LIVE TRAFFIC FEED</span>
        <span className={`feed-live-badge ${isLive ? "" : "feed-live-badge--offline"}`}>
          <span className="feed-live-dot" /> {isLive ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      <div className="traffic-feed-canvas">
        <svg viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={FRAME_W} height={FRAME_H} fill="url(#grid)" />
          <line x1={FRAME_W / 2} y1="0" x2={FRAME_W / 2} y2={FRAME_H} stroke="rgba(148,163,184,0.12)" strokeDasharray="6 8" />
          <line x1="0" y1={FRAME_H / 2} x2={FRAME_W} y2={FRAME_H / 2} stroke="rgba(148,163,184,0.12)" strokeDasharray="6 8" />

          {vehicles.map((v) => {
            const color = TYPE_COLOR[v.type] || TYPE_COLOR.other;
            const w = 46, h = 30;
            const displayX = (v.x / SOURCE_W) * FRAME_W;
            const displayY = (v.y / SOURCE_H) * FRAME_H;
            const x = Math.max(0, Math.min(FRAME_W - w, displayX - w / 2));
            const y = Math.max(0, Math.min(FRAME_H - h, displayY - h / 2));
            return (
              <g key={v.vehicle_id}>
                <rect x={x} y={y} width={w} height={h} rx="4" fill="none" stroke={color} strokeWidth="2" />
                <text x={x} y={y - 6} fill={color} fontSize="11" fontFamily="var(--font-mono)">
                  {v.vehicle_id} {v.type.toUpperCase()}
                </text>
                <text x={x} y={y + h + 13} fill={color} fontSize="10" fontFamily="var(--font-mono)" opacity="0.85">
                  {v.speed} km/h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="traffic-feed-meta">
        <span>Camera: CAM_01</span>
        <span>Resolution: {FRAME_W}x{FRAME_H}</span>
        <span>Tracked: {vehicles.length}</span>
        <span>Detector: YOLOv8 + ByteTrack</span>
      </div>
    </div>
  );
}
