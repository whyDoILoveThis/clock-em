"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronRight, AlertCircle } from "lucide-react";
import { useUser, useSignIn, useClerk } from "@clerk/nextjs";

type DemoType = "company" | "employee" | "fresh";

const DEMO_CREDENTIALS = {
  company: {
    email: "demo-company@test.com",
    password: "DemoCompany123!",
    label: "Company",
  },
  employee: {
    email: "demo-employee@test.com",
    password: "DemoEmployee123!",
    label: "Employee",
  },
  fresh: {
    email: "demo-fresh@test.com",
    password: "DemoFresh123!",
    label: "Fresh Account",
  },
};

const DemoAccountToast = () => {
  const { user } = useUser();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useClerk();
  const [demoType, setDemoType] = useState<DemoType | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwitching, setIsSwitching] = useState<DemoType | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // ===========================================
  // GESTURE STATE & REFS
  // ===========================================

  // Visual state - whether toast is dismissed (swiped out/closed)
  const [swipedOut, setSwipedOut] = useState(true);

  // Ref to the main container for direct DOM manipulation (avoids React re-renders during drag)
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref to the swipe-back tab
  const tabRef = useRef<HTMLDivElement>(null);

  // Track if user prefers reduced motion
  const prefersReducedMotion = useRef(false);

  // Gesture tracking refs (using refs instead of state for 60fps performance)
  const gestureState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    isHorizontalGesture: null as boolean | null, // null = undetermined, true = horizontal, false = vertical
    pointerId: null as number | null,
  });

  // ===========================================
  // GESTURE CONSTANTS
  // ===========================================

  // Peek amount when visible but not hovered (px)
  const PEEK_WIDTH_VISIBLE = 16;

  // Distance threshold (px) - minimum swipe distance to trigger dismiss/restore
  const DISTANCE_THRESHOLD = 50;

  // Velocity threshold (px/ms) - fast swipes dismiss regardless of distance
  const VELOCITY_THRESHOLD = 0.35;

  // Lock angle (degrees) - gestures within this angle from horizontal are considered horizontal
  // tan(20°) ≈ 0.36, so if |deltaY/deltaX| < 0.36, it's horizontal
  const LOCK_ANGLE_TAN = 0.36;

  // Minimum movement (px) before we determine gesture direction
  const DIRECTION_LOCK_THRESHOLD = 12;

  // Animation duration for snap-back/dismiss (ms)
  const ANIMATION_DURATION = 300;

  // ===========================================
  // REDUCED MOTION DETECTION
  // ===========================================

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // ===========================================
  // TRANSFORM HELPERS
  // ===========================================

  /**
   * Apply transform directly to DOM element (no React re-render)
   * This is critical for 60fps smooth dragging
   */
  const applyTransform = useCallback(
    (
      element: HTMLElement | null,
      translateX: number,
      animate: boolean = false,
    ) => {
      if (!element) return;

      const duration = prefersReducedMotion.current
        ? "0ms"
        : `${ANIMATION_DURATION}ms`;
      element.style.transition = animate
        ? `transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        : "none";
      element.style.transform = `translateY(-50%) translateX(${translateX}px)`;
    },
    [],
  );

  /**
   * Calculate the base X position based on current state
   * When visible (not swiped out): shows PEEK_WIDTH_VISIBLE px peek
   * When swiped out: fully hidden minus minimal peek
   */
  const getBasePosition = useCallback(
    (isOut: boolean, containerWidth: number) => {
      if (isOut) {
        return -containerWidth + PEEK_WIDTH_VISIBLE; // Closed with small peek visible
      }
      return 0; // Fully visible
    },
    [],
  );

  // ===========================================
  // POINTER EVENT HANDLERS
  // ===========================================

  /**
   * Handle pointer down - start tracking gesture
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary pointer (left mouse button, single touch)
    if (!e.isPrimary) return;

    setUserInteracted(true);

    const gs = gestureState.current;

    // Initialize gesture tracking
    gs.isDragging = true;
    gs.startX = e.clientX;
    gs.startY = e.clientY;
    gs.currentX = e.clientX;
    gs.lastX = e.clientX;
    gs.lastTime = e.timeStamp;
    gs.velocity = 0;
    gs.isHorizontalGesture = null; // Reset direction lock
    gs.pointerId = e.pointerId;

    // Capture pointer for reliable tracking even if pointer leaves element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  /**
   * Handle pointer move - track drag position and velocity
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const gs = gestureState.current;

      // Ignore if not dragging or different pointer
      if (!gs.isDragging || e.pointerId !== gs.pointerId) return;

      const deltaX = e.clientX - gs.startX;
      const deltaY = e.clientY - gs.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // ===========================================
      // DIRECTION LOCK DETECTION
      // ===========================================
      // Wait for enough movement to determine if this is horizontal or vertical

      if (gs.isHorizontalGesture === null) {
        const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (totalMovement >= DIRECTION_LOCK_THRESHOLD) {
          // Check if movement is predominantly horizontal (within 20° of horizontal)
          if (absDeltaX > 0 && absDeltaY / absDeltaX <= LOCK_ANGLE_TAN) {
            gs.isHorizontalGesture = true;
          } else {
            // Vertical gesture - release and let page scroll
            gs.isHorizontalGesture = false;
            gs.isDragging = false;
            try {
              (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch (err) {
              // Safe to ignore
            }
            return;
          }
        } else {
          // Not enough movement yet
          return;
        }
      }

      // If vertical, ignore
      if (!gs.isHorizontalGesture) return;

      // Prevent default to stop scrolling
      e.preventDefault();

      // ===========================================
      // VELOCITY CALCULATION
      // ===========================================

      const now = e.timeStamp;
      const timeDelta = now - gs.lastTime;

      if (timeDelta > 0 && timeDelta < 100) {
        const moveDelta = e.clientX - gs.lastX;
        gs.velocity = 0.7 * (moveDelta / timeDelta) + 0.3 * gs.velocity;
      }

      gs.lastX = e.clientX;
      gs.lastTime = now;
      gs.currentX = e.clientX;

      // ===========================================
      // DIRECT DRAG TRANSFORM
      // ===========================================
      // Map drag movement to position in the range [closed peek, fully open]

      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const closedPos = -containerWidth + PEEK_WIDTH_VISIBLE; // Closed with small peek
      const openPos = 0; // Fully visible

      // Start position depends on current state
      const startPos = swipedOut ? closedPos : openPos;

      // Apply delta to start position and clamp to valid range
      let finalPos = startPos + deltaX;
      finalPos = Math.max(closedPos, Math.min(openPos, finalPos));

      // Apply directly to DOM
      applyTransform(container, finalPos, false);
    },
    [applyTransform, swipedOut],
  );

  /**
   * Handle pointer up - determine dismiss/restore and animate
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const gs = gestureState.current;

      // Ignore if not dragging or different pointer
      if (!gs.isDragging || e.pointerId !== gs.pointerId) return;

      gs.isDragging = false;

      // Release pointer capture
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe to ignore
      }

      // If we never determined direction (micro-tap), do nothing
      if (gs.isHorizontalGesture === null) {
        return;
      }

      // If it was a vertical gesture, we already released in move handler
      if (!gs.isHorizontalGesture) return;

      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const deltaX = gs.currentX - gs.startX;
      const velocity = gs.velocity;

      // ===========================================
      // SIMPLE DISMISS/RESTORE DECISION
      // ===========================================
      // Swipe left (negative delta or velocity) = close
      // Swipe right (positive delta or velocity) = open

      let shouldClose = false;
      let shouldOpen = false;

      // Check for fast swipe OR sufficient distance
      const fastLeftSwipe = velocity < -VELOCITY_THRESHOLD;
      const fastRightSwipe = velocity > VELOCITY_THRESHOLD;
      const leftDistance = deltaX < -DISTANCE_THRESHOLD;
      const rightDistance = deltaX > DISTANCE_THRESHOLD;

      shouldClose = fastLeftSwipe || leftDistance;
      shouldOpen = fastRightSwipe || rightDistance;

      // ===========================================
      // ANIMATE TO FINAL POSITION
      // ===========================================

      if (shouldClose) {
        // Animate to closed position with small peek
        applyTransform(container, -containerWidth + PEEK_WIDTH_VISIBLE, true);
        setSwipedOut(true);
        setIsHovered(false);
      } else if (shouldOpen) {
        // Animate to fully visible
        applyTransform(container, 0, true);
        setSwipedOut(false);
      } else {
        // Snap back to current state
        const targetPos = swipedOut ? -containerWidth + PEEK_WIDTH_VISIBLE : 0;
        applyTransform(container, targetPos, true);
      }

      // Reset gesture state
      gs.pointerId = null;
      gs.isHorizontalGesture = null;
    },
    [swipedOut, applyTransform],
  );

  /**
   * Handle pointer cancel (e.g., system gesture interruption)
   */
  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      const gs = gestureState.current;

      if (e.pointerId !== gs.pointerId) return;

      gs.isDragging = false;
      gs.pointerId = null;
      gs.isHorizontalGesture = null;

      // Snap back to current state
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        const basePos = getBasePosition(swipedOut, containerWidth);
        applyTransform(container, basePos, true);
      }
    },
    [swipedOut, applyTransform, getBasePosition],
  );

  // ===========================================
  // HOVER HANDLERS (Desktop only)
  // ===========================================

  const handleMouseEnter = useCallback(() => {
    // Don't change on hover if actively dragging
    if (gestureState.current.isDragging) return;

    const container = containerRef.current;
    if (!container) return;

    setUserInteracted(true);
    setIsHovered(true);
    // Smoothly slide fully open regardless of current state
    applyTransform(container, 0, true);
    setSwipedOut(false);
  }, [applyTransform]);

  const handleMouseLeave = useCallback(() => {
    if (gestureState.current.isDragging) return;
    setIsHovered(false);

    const container = containerRef.current;
    if (!container) return;

    // Smoothly slide back to closed with peek visible
    const containerWidth = container.offsetWidth;
    applyTransform(container, -containerWidth + PEEK_WIDTH_VISIBLE, true);
    setSwipedOut(true);
  }, [applyTransform]);

  // ===========================================
  // INITIAL POSITION SETUP
  // ===========================================

  useEffect(() => {
    // Set position after state changes
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.offsetWidth;

      // Simple: visible = 0, hidden = -width + peek
      const targetPos = swipedOut ? -containerWidth + PEEK_WIDTH_VISIBLE : 0;

      // Only apply animation if not currently dragging
      const shouldAnimate = !gestureState.current.isDragging;
      applyTransform(container, targetPos, shouldAnimate);
    }
  }, [swipedOut, applyTransform]);

  // ===========================================
  // SWIPE-BACK TAB HANDLERS
  // ===========================================

  const handleTabPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Delegate to main handler but we need to calculate delta relative to main container position
      handlePointerDown(e);
    },
    [handlePointerDown],
  );

  const handleTabPointerMove = useCallback(
    (e: React.PointerEvent) => {
      handlePointerMove(e);
    },
    [handlePointerMove],
  );

  const handleTabPointerUp = useCallback(
    (e: React.PointerEvent) => {
      handlePointerUp(e);
    },
    [handlePointerUp],
  );

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;
      if (email === DEMO_CREDENTIALS.company.email) {
        setDemoType("company");
      } else if (email === DEMO_CREDENTIALS.employee.email) {
        setDemoType("employee");
      } else if (email === DEMO_CREDENTIALS.fresh.email) {
        setDemoType("fresh");
      } else {
        setDemoType(null);
      }
    } else {
      setDemoType(null);
    }
  }, [user]);

  // Auto-close countdown timer
  useEffect(() => {
    if (!demoType || userInteracted) {
      setCountdown(null);
      return;
    }

    // Open the toast and start the countdown
    setSwipedOut(false);
    setCountdown(10);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [demoType, userInteracted]);

  // When countdown reaches 0, close the toast
  useEffect(() => {
    if (countdown === 0) {
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.offsetWidth;
        applyTransform(container, -containerWidth + PEEK_WIDTH_VISIBLE, true);
      }
      setSwipedOut(true);
      setCountdown(null);
    }
  }, [countdown, applyTransform]);

  if (!demoType) return null;

  const otherTypes = (Object.keys(DEMO_CREDENTIALS) as DemoType[]).filter(
    (t) => t !== demoType,
  );

  const handleSwitch = async (targetType: DemoType) => {
    if (!isLoaded || !signIn) return;

    setIsSwitching(targetType);
    localStorage.setItem("demo_switching", "true");

    try {
      const { email, password } = DEMO_CREDENTIALS[targetType];

      await signOut({ redirectUrl: undefined });

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        localStorage.removeItem("demo_switching");
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Switch account error:", error);
      localStorage.removeItem("demo_switching");
      window.location.href = "/";
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <>
      {/* Swipe-back tab visible when toast is swiped out (mobile) */}
      {swipedOut && (
        <div
          ref={tabRef}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 sm:hidden touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handleTabPointerDown}
          onPointerMove={handleTabPointerMove}
          onPointerUp={handleTabPointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="bg-amber-900/80 backdrop-blur-sm rounded-r-lg px-2 py-6 border-r border-t border-b border-amber-700/40">
            <ChevronRight size={16} className="text-amber-400" />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="fixed left-0 top-1/2 z-50 touch-none select-none"
        style={{
          transform: `translateY(-50%)`,
          willChange: "transform",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="bg-gradient-to-r from-amber-950/90 to-amber-900/90 dark:from-amber-900/95 dark:to-amber-950/95 backdrop-blur-xl border border-amber-700/40 dark:border-amber-600/40 rounded-r-2xl shadow-lg overflow-hidden">
          {/* Peek indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>

          <div className="pl-4 pr-4 py-4 min-w-[280px] flex flex-col gap-3 relative">
            {/* Countdown timer */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-amber-400/30 border border-amber-400/50 text-[10px] font-bold text-amber-300">
                {countdown}
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-2">
              <AlertCircle
                size={18}
                className="text-amber-400 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-50">
                  Demo Account
                </h4>
                <p className="text-xs text-amber-100/70 mt-0.5">
                  You&apos;re using the{" "}
                  <span className="font-medium capitalize">
                    {DEMO_CREDENTIALS[demoType].label}
                  </span>{" "}
                  demo
                </p>
              </div>
            </div>

            {/* Switch buttons */}
            <div className="flex flex-col gap-2">
              {otherTypes.map((targetType) => (
                <button
                  key={targetType}
                  onClick={() => handleSwitch(targetType)}
                  disabled={isSwitching !== null}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-700/40 hover:bg-amber-600/50 text-amber-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwitching === targetType ? (
                    "Switching..."
                  ) : (
                    <>
                      Switch to {DEMO_CREDENTIALS[targetType].label}
                      <ChevronRight size={12} />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoAccountToast;
