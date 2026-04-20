import React, { useEffect, useRef, useState } from "react";
import {
  getOnboardingOverlayAnchor,
  getOnboardingSpotlightSelectors,
  getOnboardingStepMeta,
  isInfoOnlyOnboardingStep,
} from "../engine/onboarding/onboardingEngine";

export default function OnboardingOverlay({ state, dispatch, isMobile = false }) {
  const step = state?.onboarding?.step || null;
  const meta = getOnboardingStepMeta(step, state);
  const anchor = getOnboardingOverlayAnchor(step);
  const infoOnly = isInfoOnlyOnboardingStep(step);
  const backdrop = infoOnly ? "rgba(2,6,23,0.46)" : "rgba(2,6,23,0.24)";
  const [spotlightRects, setSpotlightRects] = useState([]);
  const [cardRect, setCardRect] = useState(null);
  const cardRef = useRef(null);
  const topOffset =
    anchor === "subnav"
      ? (isMobile ? "124px" : "144px")
      : (isMobile ? "78px" : "88px");

  useEffect(() => {
    if (!step) {
      setSpotlightRects([]);
      return undefined;
    }

    const selectors = getOnboardingSpotlightSelectors(step);
    if (!selectors.length) {
      setSpotlightRects([]);
      return undefined;
    }

    let frameId = null;
    const measure = () => {
      const rects = selectors.flatMap(selector =>
        [...document.querySelectorAll(selector)].map(node => node.getBoundingClientRect())
      )
        .filter(rect => rect && rect.width > 0 && rect.height > 0)
        .map(rect => ({
          x: Math.max(0, rect.left - 10),
          y: Math.max(0, rect.top - 10),
          width: rect.width + 20,
          height: rect.height + 20,
          rx: 16,
        }));
      setSpotlightRects(rects);
    };

    const scheduleMeasure = () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [step]);

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const spotlightRect = spotlightRects.length
    ? spotlightRects.reduce(
        (acc, rect) => ({
          x: Math.min(acc.x, rect.x),
          y: Math.min(acc.y, rect.y),
          width: Math.max(acc.x + acc.width, rect.x + rect.width) - Math.min(acc.x, rect.x),
          height: Math.max(acc.y + acc.height, rect.y + rect.height) - Math.min(acc.y, rect.y),
        }),
        { ...spotlightRects[0] }
      )
    : null;

  useEffect(() => {
    if (!step) {
      setCardRect(null);
      return undefined;
    }

    let frameId = null;
    const measureCard = () => {
      const node = cardRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setCardRect({
        width: rect.width,
        height: rect.height,
      });
    };

    const scheduleMeasure = () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureCard);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [step, meta?.title, meta?.body, meta?.actionLabel, isMobile]);

  useEffect(() => {
    if (!step) return undefined;

    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, [step]);

  if (!step || !meta) return null;

  const cardWidth = Math.min(560, Math.max(0, viewportWidth - (isMobile ? 24 : 40)));
  const defaultLeft = Math.max(isMobile ? 12 : 20, Math.round((viewportWidth - cardWidth) / 2));
  const gap = 16;
  let cardTop = anchor === "bottom" ? null : parseInt(topOffset, 10);
  let cardBottom = anchor === "bottom" ? (isMobile ? 86 : 24) : null;

  if (spotlightRect && cardRect) {
    const availableAbove = spotlightRect.y - gap;
    const availableBelow = viewportHeight - (spotlightRect.y + spotlightRect.height) - gap;
    const canPlaceAbove = availableAbove >= cardRect.height + 12;
    const canPlaceBelow = availableBelow >= cardRect.height + 12;

    if (anchor === "bottom") {
      if (canPlaceAbove) {
        cardTop = Math.max(12, Math.round(spotlightRect.y - cardRect.height - gap));
        cardBottom = null;
      }
    } else if (anchor === "subnav" || anchor === "top") {
      const defaultWouldOverlap =
        cardTop != null &&
        cardTop + cardRect.height > spotlightRect.y - 8;

      if (defaultWouldOverlap) {
        if (canPlaceBelow) {
          cardTop = Math.min(
            viewportHeight - cardRect.height - 12,
            Math.round(spotlightRect.y + spotlightRect.height + gap)
          );
          cardBottom = null;
        } else if (canPlaceAbove) {
          cardTop = Math.max(12, Math.round(spotlightRect.y - cardRect.height - gap));
          cardBottom = null;
        }
      }
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9800, pointerEvents: "none" }}>
      {spotlightRect ? (
        <>
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: `${Math.max(0, spotlightRect.y)}px`,
              background: backdrop,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              top: `${Math.max(0, spotlightRect.y)}px`,
              width: `${Math.max(0, spotlightRect.x)}px`,
              height: `${Math.max(0, spotlightRect.height)}px`,
              background: backdrop,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: `${Math.min(viewportWidth, spotlightRect.x + spotlightRect.width)}px`,
              top: `${Math.max(0, spotlightRect.y)}px`,
              right: 0,
              height: `${Math.max(0, spotlightRect.height)}px`,
              background: backdrop,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              top: `${Math.min(viewportHeight, spotlightRect.y + spotlightRect.height)}px`,
              width: "100%",
              bottom: 0,
              background: backdrop,
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: backdrop,
          }}
        />
      )}
      <div
        ref={cardRef}
        style={{
          position: "fixed",
          left: `${defaultLeft}px`,
          width: `${cardWidth}px`,
          top: cardTop != null ? `${cardTop}px` : "auto",
          bottom: cardBottom != null ? `${cardBottom}px` : "auto",
          maxWidth: "560px",
          background: "var(--color-background-secondary, #ffffff)",
          color: "var(--color-text-primary, #1e293b)",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          borderRadius: "16px",
          boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
          padding: "14px 16px",
          display: "grid",
          gap: "10px",
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
          Tutorial
        </div>
        <div style={{ fontSize: "0.96rem", fontWeight: "900" }}>{meta.title}</div>
        <div style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "var(--color-text-secondary, #475569)" }}>
          {meta.body}
        </div>
        {infoOnly && meta.actionLabel && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => dispatch({ type: "ACK_ONBOARDING_STEP" })}
              style={{
                border: "1px solid var(--tone-accent, #4338ca)",
                background: "var(--tone-accent-soft, #eef2ff)",
                color: "var(--tone-accent, #4338ca)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "0.72rem",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              {meta.actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
