import React from "react";
import "./EnvironmentPanels.css";

const WEATHER_ICON = {
  CLEAR: "\u2600", PARTLY_CLOUDY: "\u26C5", CLOUDY: "\u2601",
  FOG: "\u2592", DRIZZLE: "\u2614", RAIN: "\u2614", RAIN_SHOWERS: "\u2614",
  HEAVY_RAIN: "\u26C8", SNOW: "\u2744", HEAVY_SNOW: "\u2744", THUNDERSTORM: "\u26A1",
};

const ROAD_COLOR = { GOOD: "var(--status-low)", FAIR: "var(--status-medium)", POOR: "var(--status-high)", HAZARDOUS: "var(--status-critical)" };

export function WeatherPanel({ weather = {} }) {
  return (
    <div className="mini-panel">
      <div className="mini-panel-header">WEATHER &amp; ENVIRONMENT</div>
      <div className="mini-panel-body">
        <div className="mini-panel-icon">{WEATHER_ICON[weather.condition] || "\u2600"}</div>
        <div>
          <div className="mini-panel-main">{(weather.condition || "CLEAR").replace(/_/g, " ")}</div>
          <div className="mini-panel-sub">{weather.temperature_c}{"\u00B0"}C &middot; Visibility: {weather.visibility}</div>
        </div>
      </div>
    </div>
  );
}

export function RoadConditionPanel({ road = {} }) {
  const color = ROAD_COLOR[road.road_condition] || ROAD_COLOR.GOOD;
  return (
    <div className="mini-panel" style={{ borderColor: color }}>
      <div className="mini-panel-header">ROAD CONDITION</div>
      <div className="mini-panel-body">
        <div className="mini-panel-icon" style={{ color }}>{"\u2637"}</div>
        <div>
          <div className="mini-panel-main" style={{ color }}>{road.road_condition}</div>
          <div className="mini-panel-sub">{road.surface} Surface &middot; Friction: {road.friction}</div>
        </div>
      </div>
    </div>
  );
}

export function TimePanel({ time = {} }) {
  return (
    <div className="mini-panel mini-panel--amber">
      <div className="mini-panel-header">TIME ANALYSIS</div>
      <div className="mini-panel-body">
        <div className="mini-panel-icon">{"\u23F0"}</div>
        <div>
          <div className="mini-panel-main">{time.is_peak_hour ? "PEAK HOUR" : (time.time_of_day || "")}</div>
          <div className="mini-panel-sub">{time.is_peak_hour ? `${time.time_of_day || ""} \u2014 High Traffic Time` : "Normal traffic time"}</div>
        </div>
      </div>
    </div>
  );
}
