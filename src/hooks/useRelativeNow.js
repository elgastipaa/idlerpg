import { useEffect, useState } from "react";

export default function useRelativeNow({ intervalMs = 1000, enabled = true } = {}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);

  return now;
}
