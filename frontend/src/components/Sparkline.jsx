import React from "react";

/**
 * Minimal inline SVG sparkline. Pure presentation — takes an array of
 * numbers and draws a smoothed line, used as the small "activity" chart
 * inside stat cards and the overall risk panel, matching the reference
 * dashboard's mini charts.
 */
export default function Sparkline({ values = [], color = "var(--cyan)", width = 100, height = 30 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}
