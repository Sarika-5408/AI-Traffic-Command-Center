import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const STATUS_ITEMS = [
  { key: "ai", label: "AI ENGINE", icon: "\u{1F9E0}" },
  { key: "cctv", label: "CCTV FEED", icon: "\u{1F4F9}" },
  { key: "risk", label: "RISK ENGINE", icon: "\u{1F4C8}" },
  { key: "traffic", label: "TRAFFIC MODULE", icon: "\u{1F697}" },
  { key: "env", label: "ENVIRONMENT DATA", icon: "\u2601" },
  { key: "db", label: "DATABASE", icon: "\u{1F5C4}" },
];

const FEATURES = [
  {
    key: "cctv",
    title: "CCTV MONITORING",
    desc: "Real-time video feed surveillance",
    icon: "\u{1F4F9}",
    color: "var(--cyan)",
  },
  {
    key: "risk",
    title: "RISK PREDICTION",
    desc: "AI-based accident risk prediction",
    icon: "\u26A0",
    color: "var(--purple)",
  },
  {
    key: "analytics",
    title: "TRAFFIC ANALYTICS",
    desc: "Traffic flow and density analysis",
    icon: "\u{1F4CA}",
    color: "var(--blue)",
  },
  {
    key: "env",
    title: "ENVIRONMENT DATA",
    desc: "Weather, road & time condition monitoring",
    icon: "\u2601",
    color: "var(--status-low)",
  },
  {
    key: "signal",
    title: "TRAFFIC CONTROL",
    desc: "Smart signal simulation and control",
    icon: "\u{1F6A6}",
    color: "var(--status-medium)",
  },
];

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Landing Page — rebuilt as real React + CSS components (not the reference
 * image). The reference image was used only as a visual guide for layout,
 * colors and content; every element below (logo, live clock, headline,
 * status panel, AI graphic, button, feature cards, quote) is a real DOM
 * element with real styling, not a screenshot.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const now = useLiveClock();

  const handleInitialize = () => {
    // Client-side navigation only — never a window.location reload.
    navigate("/loading");
  };

  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateString = now.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow--top" />
      <div className="landing-glow landing-glow--bottom" />

      <header className="landing-topbar">
        <div className="landing-logo">
          <svg className="landing-logo-mark" viewBox="0 0 40 40" fill="none">
            <path d="M20 3 L36 34 H4 Z" stroke="url(#logoGrad)" strokeWidth="3" strokeLinejoin="round" fill="rgba(34,211,238,0.08)" />
            <path d="M20 14 L28 30 H12 Z" stroke="url(#logoGrad)" strokeWidth="2" strokeLinejoin="round" fill="none" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="landing-logo-text">AI TRAFFIC COMMAND CENTER</span>
        </div>

        <div className="landing-clock">
          <span className="landing-clock-icon">{"\u23F0"}</span>
          <div>
            <div className="landing-clock-time">{timeString}</div>
            <div className="landing-clock-date">{dateString}</div>
          </div>
        </div>
      </header>

      <div className="landing-content">
        <div className="landing-left">
          <h1 className="landing-headline">
            <span className="headline-line">AI-POWERED</span>
            <span className="headline-line headline-line--gradient">INTELLIGENT TRAFFIC</span>
            <span className="headline-line">SAFETY SYSTEM</span>
          </h1>

          <div className="landing-tagline">
            <span className="tagline-word tagline-word--cyan">PREDICT</span>
            <span className="tagline-dot">&bull;</span>
            <span className="tagline-word tagline-word--purple">WARN</span>
            <span className="tagline-dot">&bull;</span>
            <span className="tagline-word tagline-word--green">PREVENT</span>
          </div>

          <div className="status-panel">
            <div className="status-panel-title">SYSTEM STATUS</div>
            <ul className="status-list">
              {STATUS_ITEMS.map((item) => (
                <li className="status-item" key={item.key}>
                  <span className="status-item-icon">{item.icon}</span>
                  <span className="status-item-label">{item.label}</span>
                  <span className="status-item-badge">
                    <svg viewBox="0 0 16 16" width="11" height="11" className="status-check">
                      <path d="M3 8.5 L6.5 12 L13 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    READY
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="landing-center">
          <div className="ai-graphic">
            <svg viewBox="0 0 260 260" className="ai-graphic-rings">
              <circle cx="130" cy="130" r="122" className="ring ring--outer" />
              <circle cx="130" cy="130" r="98" className="ring ring--mid" />
              <circle cx="130" cy="130" r="98" className="ring ring--arc" />
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * Math.PI * 2;
                const x1 = 130 + Math.cos(angle) * 122;
                const y1 = 130 + Math.sin(angle) * 122;
                const x2 = 130 + Math.cos(angle) * 132;
                const y2 = 130 + Math.sin(angle) * 132;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="ring-tick" />;
              })}
            </svg>
            <div className="ai-chip">
              <div className="ai-chip-inner">AI</div>
            </div>
          </div>

          <button type="button" className="initialize-btn" onClick={handleInitialize}>
            <svg viewBox="0 0 24 24" width="20" height="20" className="initialize-btn-icon">
              <path d="M12 3v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M6.5 6.5a8 8 0 1 0 11 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </svg>
            INITIALIZE SYSTEM
          </button>

          <p className="landing-quote">&ldquo;An intelligent system today, a safer tomorrow.&rdquo;</p>
        </div>

        <div className="landing-right">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.key} style={{ "--fcolor": f.color }}>
              <span className="feature-card-icon">{f.icon}</span>
              <div className="feature-card-text">
                <div className="feature-card-title">{f.title}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-skyline" aria-hidden="true">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
          {Array.from({ length: 28 }).map((_, i) => {
            const w = 30 + ((i * 37) % 50);
            const h = 40 + ((i * 53) % 100);
            const x = i * 52;
            return (
              <rect key={i} x={x} y={140 - h} width={w} height={h} className={i % 3 === 0 ? "building building--lit" : "building"} />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
