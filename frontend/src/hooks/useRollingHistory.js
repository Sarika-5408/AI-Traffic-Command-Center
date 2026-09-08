import { useRef } from "react";

const MAX_HISTORY = 24;

/**
 * Keeps a small rolling window of recent numeric values for sparkline
 * charts, without needing any backend history endpoint — each page just
 * feeds its latest polled value in on every render.
 */
export function useRollingHistory(value, maxLength = MAX_HISTORY) {
  const ref = useRef([]);
  if (typeof value === "number" && !Number.isNaN(value)) {
    ref.current = [...ref.current, value].slice(-maxLength);
  }
  return ref.current;
}
