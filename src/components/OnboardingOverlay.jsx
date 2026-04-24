import React, { useEffect, useRef, useState } from "react";
import useRelativeNow from "../hooks/useRelativeNow";
import { OVERLAY_Z_INDEX } from "./OverlayShell";
import {
  getEffectiveOnboardingStep,
  ONBOARDING_STEPS,
  getOnboardingOverlayAnchor,
  getOnboardingSpotlightSelectors,
  getOnboardingStepMeta,
  isInfoOnlyOnboardingStep,
  isPostEchoOnboardingStep,
  shouldShowOnboardingGlossaryHint,
  shouldShowOnboardingSpotlightDuringInfoStep,
} from "../engine/onboarding/onboardingEngine";

function getScrollableAncestors(node) {
  const ancestors = [];
  let current = node?.parentElement || null;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = `${style.overflowY || ""} ${style.overflow || ""}`;
    const overflowX = `${style.overflowX || ""} ${style.overflow || ""}`;
    const canScrollY =
      /(auto|scroll|overlay)/.test(overflowY) &&
      current.scrollHeight > current.clientHeight + 1;
    const canScrollX =
      /(auto|scroll|overlay)/.test(overflowX) &&
      current.scrollWidth > current.clientWidth + 1;
    if (canScrollX || canScrollY) {
      ancestors.push({ node: current, canScrollX, canScrollY });
    }
    current = current.parentElement;
  }
  return ancestors;
}

function revealTargetInScrollContainers(target, { minViewportTop = 0, maxViewportBottom = window.innerHeight } = {}) {
  let adjusted = false;
  for (const entry of getScrollableAncestors(target)) {
    const container = entry.node;
    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    if (entry.canScrollY) {
      const visibleTop = Math.max(containerRect.top + 12, minViewportTop);
      const visibleBottom = Math.min(containerRect.bottom - 12, maxViewportBottom);

      if (visibleBottom > visibleTop + 24) {
        if (targetRect.top < visibleTop) {
          container.scrollBy({
            top: targetRect.top - visibleTop,
            behavior: "auto",
          });
          adjusted = true;
        } else if (targetRect.bottom > visibleBottom) {
          container.scrollBy({
            top: targetRect.bottom - visibleBottom,
            behavior: "auto",
          });
          adjusted = true;
        } else {
          const comfortTop = visibleTop + 24;
          const comfortBottom = visibleBottom - 24;
          const targetCenter = targetRect.top + (targetRect.height / 2);
          const comfortCenter = comfortTop + Math.max(0, (comfortBottom - comfortTop) / 2);
          const targetTooCloseToEdge =
            targetRect.height <= Math.max(120, (visibleBottom - visibleTop) * 0.35) &&
            (targetRect.top < comfortTop || targetRect.bottom > comfortBottom);

          if (targetTooCloseToEdge) {
            container.scrollBy({
              top: targetCenter - comfortCenter,
              behavior: "auto",
            });
            adjusted = true;
          }
        }
      }
    }

    if (entry.canScrollX) {
      const visibleLeft = containerRect.left + 12;
      const visibleRight = containerRect.right - 12;

      if (visibleRight > visibleLeft + 24) {
        if (targetRect.left < visibleLeft) {
          container.scrollBy({
            left: targetRect.left - visibleLeft,
            behavior: "auto",
          });
          adjusted = true;
        } else if (targetRect.right > visibleRight) {
          container.scrollBy({
            left: targetRect.right - visibleRight,
            behavior: "auto",
          });
          adjusted = true;
        } else {
          const comfortLeft = visibleLeft + 24;
          const comfortRight = visibleRight - 24;
          const targetCenter = targetRect.left + (targetRect.width / 2);
          const comfortCenter = comfortLeft + Math.max(0, (comfortRight - comfortLeft) / 2);
          const targetTooCloseToHorizontalEdge =
            targetRect.width <= Math.max(160, (visibleRight - visibleLeft) * 0.5) &&
            (targetRect.left < comfortLeft || targetRect.right > comfortRight);

          if (targetTooCloseToHorizontalEdge) {
            container.scrollBy({
              left: targetCenter - comfortCenter,
              behavior: "auto",
            });
            adjusted = true;
          }
        }
      }
    }
  }
  return adjusted;
}

function isVisibleOnboardingTarget(node, { requireViewportIntersection = false } = {}) {
  if (!(node instanceof HTMLElement)) return false;
  const rect = node.getBoundingClientRect();
  if (!(rect.width > 0 && rect.height > 0)) return false;
  const style = window.getComputedStyle(node);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity || 1) <= 0) return false;
  if (requireViewportIntersection) {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (
      rect.bottom <= 0 ||
      rect.top >= viewportHeight ||
      rect.right <= 0 ||
      rect.left >= viewportWidth
    ) {
      return false;
    }
  }
  return true;
}

function getFirstVisibleTargetForSelectors(selectors = [], options = {}) {
  return selectors
    .flatMap(selector => [...document.querySelectorAll(selector)])
    .find(node => isVisibleOnboardingTarget(node, options));
}

function resolveSanctuaryCorridorTarget(step, selectors = [], { preferViewport = false } = {}) {
  const visibilityOptions = preferViewport ? { requireViewportIntersection: true } : {};
  if (step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
    return (
      getFirstVisibleTargetForSelectors(['[data-onboarding-target="primary-sanctuary-tab"]'], visibilityOptions) ||
      getFirstVisibleTargetForSelectors(['[data-onboarding-target="close-laboratory"]'], visibilityOptions) ||
      getFirstVisibleTargetForSelectors(selectors, visibilityOptions)
    );
  }

  if (step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
    return (
      getFirstVisibleTargetForSelectors(['[data-onboarding-target="tutorial-distillery-bundle"]'], visibilityOptions) ||
      getFirstVisibleTargetForSelectors(['[data-onboarding-target="tutorial-distillery-start"]'], visibilityOptions) ||
      getFirstVisibleTargetForSelectors(selectors, visibilityOptions)
    );
  }

  return getFirstVisibleTargetForSelectors(selectors, visibilityOptions);
}

function getCorridorRetryConfig(step) {
  if (step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
    return { maxAttempts: 30, retryDelayMs: 75 };
  }
  if (step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
    return { maxAttempts: 56, retryDelayMs: 75 };
  }
  return { maxAttempts: 56, retryDelayMs: 80 };
}

export default function OnboardingOverlay({ state, dispatch, isMobile = false }) {
  const rawStep = state?.onboarding?.step || null;
  const needsLiveNow =
    rawStep === ONBOARDING_STEPS.DISTILLERY_READY ||
    rawStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY ||
    rawStep === ONBOARDING_STEPS.OPEN_DISTILLERY;
  const liveNow = useRelativeNow({
    intervalMs: 250,
    enabled: needsLiveNow,
  });
  const liveState =
    needsLiveNow
      ? { ...state, __liveNow: liveNow }
      : state;
  const step = getEffectiveOnboardingStep(rawStep, liveState);
  const meta = getOnboardingStepMeta(step, liveState);
  const anchor = getOnboardingOverlayAnchor(step, liveState);
  const infoOnly = isInfoOnlyOnboardingStep(step, liveState);
  const postEchoInfoStep = isPostEchoOnboardingStep(step);
  const showGlossaryHint = shouldShowOnboardingGlossaryHint(step);
  const infoSpotlightAllowed = shouldShowOnboardingSpotlightDuringInfoStep(step, liveState);
  const spotlightSelectors = getOnboardingSpotlightSelectors(step, liveState);
  const spotlightSelectorsKey = spotlightSelectors.join("|");
  const currentTab = state?.currentTab || "sanctuary";
  const backdrop = infoOnly ? "rgba(2,6,23,0.46)" : "rgba(2,6,23,0.24)";
  const [spotlightRects, setSpotlightRects] = useState([]);
  const [spotlightReady, setSpotlightReady] = useState(false);
  const [spotlightFailure, setSpotlightFailure] = useState(null);
  const [spotlightRetryNonce, setSpotlightRetryNonce] = useState(0);
  const [cardRect, setCardRect] = useState(null);
  const cardRef = useRef(null);
  const topOffset =
    anchor === "subnav"
      ? (isMobile ? "124px" : "144px")
      : (isMobile ? "78px" : "88px");
  const shouldLockScroll =
    Boolean(step) &&
    step !== ONBOARDING_STEPS.CHOOSE_CLASS &&
    step !== ONBOARDING_STEPS.CHOOSE_SPEC &&
    (infoOnly || (spotlightReady && !spotlightFailure));
  const sanctuaryCorridorClickThrough = [
    ONBOARDING_STEPS.OPEN_LABORATORY,
    ONBOARDING_STEPS.RESEARCH_DISTILLERY,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
  ].includes(step);

  useEffect(() => {
    setSpotlightFailure(null);
    setSpotlightRetryNonce(0);
  }, [step]);

  useEffect(() => {
    if (!shouldLockScroll) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;

    const preventScroll = event => {
      event.preventDefault();
    };

    const preventScrollKeys = event => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"].includes(event.key)) {
        event.preventDefault();
      }
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    window.addEventListener("wheel", preventScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", preventScroll, { passive: false, capture: true });
    window.addEventListener("keydown", preventScrollKeys, { capture: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("wheel", preventScroll, true);
      window.removeEventListener("touchmove", preventScroll, true);
      window.removeEventListener("keydown", preventScrollKeys, true);
    };
  }, [shouldLockScroll]);

  useEffect(() => {
    if (!step) {
      setSpotlightRects([]);
      setSpotlightReady(false);
      setSpotlightFailure(null);
      return undefined;
    }

    if (!spotlightSelectors.length) {
      setSpotlightRects([]);
      setSpotlightReady(true);
      setSpotlightFailure(null);
      return undefined;
    }

    if (infoOnly && !infoSpotlightAllowed) {
      setSpotlightReady(true);
    }

    if (!spotlightReady && !(infoOnly && infoSpotlightAllowed)) {
      setSpotlightRects([]);
      return undefined;
    }

    let frameId = null;
    let mutationObserver = null;
    const measure = () => {
      let rawRects = [];
      if (sanctuaryCorridorClickThrough) {
        const target =
          resolveSanctuaryCorridorTarget(step, spotlightSelectors, { preferViewport: true }) ||
          resolveSanctuaryCorridorTarget(step, spotlightSelectors);
        rawRects = target ? [target.getBoundingClientRect()] : [];
      } else {
        rawRects = spotlightSelectors.flatMap(selector =>
          [...document.querySelectorAll(selector)].map(node => node.getBoundingClientRect())
        );
      }
      const rects = rawRects
        .filter(rect => rect && rect.width > 0 && rect.height > 0)
        .map(rect => ({
          x: Math.max(0, rect.left - 10),
          y: Math.max(0, rect.top - 10),
          width: rect.width + 20,
          height: rect.height + 20,
          rx: 16,
        }));
      setSpotlightRects(rects);
      if (rects.length > 0 && spotlightFailure) {
        setSpotlightFailure(null);
      }
    };

    const scheduleMeasure = () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    if (typeof MutationObserver !== "undefined" && document?.body) {
      mutationObserver = new MutationObserver(() => {
        scheduleMeasure();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "data-onboarding-target"],
      });
    }
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [currentTab, infoOnly, infoSpotlightAllowed, sanctuaryCorridorClickThrough, spotlightFailure, spotlightReady, spotlightRetryNonce, spotlightSelectorsKey, step]);

  useEffect(() => {
    if (!step) {
      setSpotlightReady(false);
      setSpotlightFailure(null);
      return undefined;
    }

    if (!spotlightSelectors.length || postEchoInfoStep || (infoOnly && !infoSpotlightAllowed)) {
      setSpotlightReady(true);
      setSpotlightFailure(null);
      return undefined;
    }

    if (!cardRect?.height) {
      setSpotlightReady(false);
      return undefined;
    }

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;
    const corridorRetryConfig = getCorridorRetryConfig(step);
    const maxAttempts = sanctuaryCorridorClickThrough
      ? corridorRetryConfig.maxAttempts
      : 8;
    const retryDelayMs = sanctuaryCorridorClickThrough
      ? corridorRetryConfig.retryDelayMs
      : 90;
    const maxWaitMs = sanctuaryCorridorClickThrough ? 3200 : 1600;
    const startedAt = Date.now();
    const failSpotlight = reason => {
      setSpotlightFailure(current => {
        if (current?.step === step && current?.reason === reason) return current;
        return { step, reason, at: Date.now() };
      });
      setSpotlightReady(true);
    };
    setSpotlightFailure(null);
    setSpotlightReady(false);
    const scrollTargetIntoView = () => {
      if (Date.now() - startedAt > maxWaitMs) {
        failSpotlight("timeout");
        return;
      }

      const target = sanctuaryCorridorClickThrough
        ? (
          resolveSanctuaryCorridorTarget(step, spotlightSelectors, { preferViewport: true }) ||
          resolveSanctuaryCorridorTarget(step, spotlightSelectors)
        )
        : getFirstVisibleTargetForSelectors(spotlightSelectors);
      if (!target) {
        attempts += 1;
        if (attempts < maxAttempts && Date.now() - startedAt <= maxWaitMs) {
          timeoutId = window.setTimeout(() => {
            frameId = requestAnimationFrame(scrollTargetIntoView);
          }, retryDelayMs);
        } else {
          failSpotlight("target_not_found");
        }
        return;
      }

      const targetStyle = window.getComputedStyle(target);
      if (targetStyle.position === "fixed") {
        setSpotlightFailure(null);
        setSpotlightReady(true);
        return;
      }

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
      const adjustedInnerScroll = revealTargetInScrollContainers(target, {
        minViewportTop: visibleTop,
        maxViewportBottom: visibleBottom,
      });
      const targetRect = target.getBoundingClientRect();
      let adjusted = adjustedInnerScroll;

      if (targetRect.top < visibleTop) {
        window.scrollBy({
          top: targetRect.top - visibleTop,
          behavior: "auto",
        });
        adjusted = true;
      } else if (targetRect.bottom > visibleBottom) {
        window.scrollBy({
          top: targetRect.bottom - visibleBottom,
          behavior: "auto",
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
          behavior: "auto",
        });
        adjusted = true;
      }

      if (!adjusted) {
        setSpotlightFailure(null);
        setSpotlightReady(true);
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts && Date.now() - startedAt <= maxWaitMs) {
        timeoutId = window.setTimeout(() => {
          frameId = requestAnimationFrame(scrollTargetIntoView);
        }, retryDelayMs);
      } else {
        failSpotlight("scroll_timeout");
      }
    };

    frameId = requestAnimationFrame(scrollTargetIntoView);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [anchor, cardRect?.height, currentTab, infoOnly, infoSpotlightAllowed, isMobile, postEchoInfoStep, sanctuaryCorridorClickThrough, spotlightRetryNonce, spotlightSelectorsKey, step]);

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
  const overlayPointerEvents = spotlightFailure ? "none" : "auto";

  const handleRetrySpotlight = () => {
    setSpotlightFailure(null);
    setSpotlightRects([]);
    setSpotlightReady(false);
    setSpotlightRetryNonce(current => current + 1);
  };

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
    <div style={{ position: "fixed", inset: 0, zIndex: OVERLAY_Z_INDEX.hard, pointerEvents: "none" }}>
      {spotlightRect && spotlightReady ? (
        <>
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: `${Math.max(0, spotlightRect.y)}px`,
              background: backdrop,
              pointerEvents: overlayPointerEvents,
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
              pointerEvents: overlayPointerEvents,
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
              pointerEvents: overlayPointerEvents,
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
              pointerEvents: overlayPointerEvents,
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: backdrop,
            pointerEvents: overlayPointerEvents,
          }}
        />
      )}
      <div
        ref={cardRef}
        style={{
          position: "fixed",
          zIndex: 2,
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
          pointerEvents: infoOnly || Boolean(spotlightFailure) ? "auto" : "none",
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
        {spotlightFailure && !infoOnly && (
          <div style={{ display: "grid", gap: "8px", border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.12)", color: "var(--tone-warning, #f59e0b)", borderRadius: "12px", padding: "8px 10px" }}>
            <div style={{ fontSize: "0.68rem", lineHeight: 1.35, fontWeight: "800" }}>
              No pudimos enfocar el objetivo. Puedes continuar manualmente y reintentar cuando quieras.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleRetrySpotlight}
                style={{
                  border: "1px solid rgba(245,158,11,0.45)",
                  background: "#ffffff",
                  color: "var(--tone-warning, #b45309)",
                  borderRadius: "10px",
                  padding: "7px 10px",
                  fontSize: "0.64rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Reintentar foco
              </button>
            </div>
          </div>
        )}
        {infoOnly && showGlossaryHint && (
          <div style={{ fontSize: "0.7rem", lineHeight: 1.45, color: "var(--color-text-tertiary, #64748b)", paddingTop: "2px", borderTop: "1px solid var(--color-border-primary, #e2e8f0)" }}>
            En Mas &gt; Glosario podes ver mas.
          </div>
        )}
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
