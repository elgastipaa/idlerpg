import { useEffect, useState } from "react";

export function isMobileViewport(breakpoint = 768) {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoint;
}

export function getViewportWidth() {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
}

export default function useViewport({ breakpoint = 768 } = {}) {
  const [viewportWidth, setViewportWidth] = useState(() => getViewportWidth());
  const isMobile = viewportWidth < breakpoint;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return { isMobile, viewportWidth };
}
