import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingPage.css";

const STEPS = [
  "Loading Vehicle Detection",
  "Connecting Accident Risk Engine",
  "Loading Traffic Intelligence",
  "Synchronizing Environmental Data",
  "Initializing Command Center",
  "System Ready",
];

const STEP_DURATION_MS = 480;

export default function LoadingPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (completed >= STEPS.length) {
      const t = setTimeout(() => navigate("/dashboard"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), STEP_DURATION_MS);
    return () => clearTimeout(t);
  }, [completed, navigate]);

  const progress = Math.round((completed / STEPS.length) * 100);

  return (
    <div className="loading-page">
      <div className="loading-panel">
        <div className="loading-badge">AI TRAFFIC COMMAND CENTER</div>
        <h1 className="loading-title">INITIALIZING TRAFFIC COMMAND CENTER</h1>

        <div className="loading-ring">
          <svg viewBox="0 0 120 120" className="loading-ring-svg">
            <circle cx="60" cy="60" r="52" className="loading-ring-track" />
            <circle
              cx="60"
              cy="60"
              r="52"
              className="loading-ring-progress"
              style={{
                strokeDasharray: 2 * Math.PI * 52,
                strokeDashoffset: 2 * Math.PI * 52 * (1 - progress / 100),
              }}
            />
          </svg>
          <div className="loading-ring-percent">{progress}%</div>
        </div>

        <ul className="loading-steps">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={
                i < completed ? "done" : i === completed ? "active" : "pending"
              }
            >
              <span className="loading-step-icon">
                {i < completed ? "\u2713" : i === completed ? "\u25CF" : "\u25CB"}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
