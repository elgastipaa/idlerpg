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
  const infoOnly = isInfoOnlyOnboardingStep(step, state);
  const spotlightSelectors = getOnboardingSpotlightSelectors(step, state);
  const spotlightSelectorsKey = spotlightSelectors.join("|");
  const currentTab = state?.currentTab || "sanctuary";
  const backdrop = infoOnly ? "rgba(2,6,23,0.46)" : "rgba(2,6,23,0.24)";
  const [spotlightRects, setSpotlightRects] = useState([]);
  const [spotlightReady, setSpotlightReady] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const cardRef = useRef(null);
  const topOffset =
    anchor === "subnav"
      ? (isMobile ? "124px" : "144px")
      : (isMobile ? "78px" : "88px");

  useEffect(() => {
    if (!step) {
      setSpotlightRects([]);
      setSpotlightReady(false);
      return undefined;
    }

    if (!spotlightSelectors.length) {
      setSpotlightRects([]);
      setSpotlightReady(true);
      return undefined;
    }

    if (infoOnly) {
      setSpotlightReady(true);
    }

    if (!spotlightReady && !infoOnly) {
      setSpotlightRects([]);
      return undefined;
    }

    let frameId = null;
    const measure = () => {
      const rects = spotlightSelectors.flatMap(selector =>
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
  }, [currentTab, infoOnly, spotlightReady, spotlightSelectorsKey, step]);

  useEffect(() => {
    if (!step) {
      setSpotlightReady(false);
      return undefined;
    }

    if (!spotlightSelectors.length || infoOnly) {
      setSpotlightReady(true);
      return undefined;
    }

    if (!cardRect?.height) {
      setSpotlightReady(false);
      return undefined;
    }

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;
    setSpotlightReady(false);
    const scrollTargetIntoView = () => {
      const target = [...spotlightSelectors]
        .reverse()
        .flatMap(selector => [...document.querySelectorAll(selector)])
        .find(node => node instanceof HTMLElement && node.offsetParent !== null);
      if (!target) {
        attempts += 1;
        if (attempts < 8) {
          timeoutId = window.setTimeout(() => {
            frameId = requestAnimationFrame(scrollTargetIntoView);
          }, 90);
        } else {
          setSpotlightReady(true);
        }
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const headerOffset = anchor === "subnav"
        ? (isMobile ? 72 : 80)
        : (isMobile ? 68 : 76);
      const navOffset = isMobile ? 86 : 24;
      const cardHeight = Math.max(0, Number(cardRect?.height || 0));
      const safeTop = anchor === "bottom"
        ? headerOffset + 12
        : headerOffset + Math.min(cardHeight + 22, Math.round(window.innerHeight * 0.42));
      const safeBottom = anchor === "bottom"
        ? navOffset + cardHeight + 28
        : navOffset + 12;
      const extraTopGuard = [...document.querySelectorAll("[data-onboarding-top-guard]")]
        .filter(node => node instanceof HTMLElement && node.offsetParent !== null)
        .map(node => node.getBoundingClientRect().bottom)
        .reduce((maxBottom, bottom) => Math.max(maxBottom, bottom), 0);
      const visibleTop = Math.max(12, safeTop, extraTopGuard > 0 ? extraTopGuard + 12 : 0);
      const visibleBottom = Math.max(visibleTop + 48, window.innerHeight - safeBottom);
      let adjusted = false;

      if (targetRect.top < visibleTop) {
        window.scrollBy({
          top: targetRect.top - visibleTop,
          behavior: attempts === 0 ? "auto" : "smooth",
        });
        adjusted = true;
      } else if (targetRect.bottom > visibleBottom) {
        window.scrollBy({
          top: targetRect.bottom - visibleBottom,
          behavior: attempts === 0 ? "auto" : "smooth",
        });
        adjusted = true;
      }

      const comfortTop = visibleTop + 28;
      const comfortBottom = visibleBottom - 28;
      const targetCenter = targetRect.top + (targetRect.height / 2);
      const comfortCenter = comfortTop + Math.max(0, (comfortBottom - comfortTop) / 2);
      const targetTooCloseToEdge =
        !adjusted &&
        targetRect.height <= Math.max(120, window.innerHeight * 0.24) &&
        (
          targetRect.top < comfortTop ||
          targetRect.bottom > comfortBottom
        );

      if (targetTooCloseToEdge) {
        window.scrollBy({
          top: targetCenter - comfortCenter,
          behavior: attempts === 0 ? "auto" : "smooth",
        });
        adjusted = true;
      }

      if (!adjusted) {
        setSpotlightReady(true);
        return;
      }

      attempts += 1;
      if (attempts < 8) {
        timeoutId = window.setTimeout(() => {
          frameId = requestAnimationFrame(scrollTargetIntoView);
        }, 90);
      } else {
        setSpotlightReady(true);
      }
    };

    frameId = requestAnimationFrame(scrollTargetIntoView);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [anchor, cardRect?.height, currentTab, infoOnly, isMobile, spotlightSelectorsKey, step]);

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
  }, [isMobile, meta?.actionLabel, meta?.body, meta?.title, step]);

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
      {spotlightRect && !infoOnly && spotlightReady ? (
        <>
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: `${Math.max(0, spotlightRect.y)}px`,
              background: backdrop,
              pointerEvents: "auto",
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
              pointerEvents: "auto",
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
              pointerEvents: "auto",
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
              pointerEvents: "auto",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: backdrop,
            pointerEvents: "auto",
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
          opacity: 1,
        }}
      >
        <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
          Tutorial
        </div>
        <div style={{ fontSize: "0.96rem", fontWeight: "900" }}>{meta.title}</div>
        <div style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "var(--color-text-secondary, #475569)" }}>
          {meta.body}
        </div>
        {infoOnly && (
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
              {meta.actionLabel || "Seguir"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
