import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

interface TrailDot {
    id: number;
    x: number;
    y: number;
}

interface GhostCursorProps {
    isActive?: boolean;
}

export function GhostCursor({ isActive = true }: GhostCursorProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [trail, setTrail] = useState<TrailDot[]>([]);
    const trailIdRef = useRef(0);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use motion values for smooth spring animation
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    // Spring physics - tuned for smooth but responsive movement
    const springX = useSpring(cursorX, { damping: 30, stiffness: 250, mass: 0.8 });
    const springY = useSpring(cursorY, { damping: 30, stiffness: 250, mass: 0.8 });

    // Clear any pending fade timeout
    const clearFadeTimeout = useCallback(() => {
        if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
            fadeTimeoutRef.current = null;
        }
    }, []);

    // Handle focus event - cursor appears at target position
    const handleCursorFocus = useCallback((e: CustomEvent<{ x: number; y: number; elementId?: string }>) => {
        clearFadeTimeout();
        const { x, y } = e.detail;

        // Set initial position without animation for first appearance
        cursorX.set(x);
        cursorY.set(y);
        setIsVisible(true);
    }, [cursorX, cursorY, clearFadeTimeout]);

    // Handle cursor move - animate to new position with trail
    const handleCursorMove = useCallback((e: CustomEvent<{ x: number; y: number }>) => {
        clearFadeTimeout();
        const { x, y } = e.detail;

        // If not visible yet, just set position
        if (!isVisible) {
            cursorX.set(x);
            cursorY.set(y);
            setIsVisible(true);
            return;
        }

        // Animate to new position
        cursorX.set(x);
        cursorY.set(y);

        // Add trail dot
        trailIdRef.current += 1;
        const newDot: TrailDot = {
            id: trailIdRef.current,
            x,
            y,
        };

        setTrail((prev) => [...prev.slice(-6), newDot]);

        // Remove old trail dots
        setTimeout(() => {
            setTrail((prev) => prev.filter((dot) => dot.id !== newDot.id));
        }, 300);
    }, [cursorX, cursorY, isVisible, clearFadeTimeout]);

    // Handle cursor click - show ripple effect
    const handleCursorClick = useCallback(() => {
        setIsClicking(true);

        // Reset click animation
        setTimeout(() => {
            setIsClicking(false);
        }, 450);
    }, []);

    // Handle complete event - fade out cursor
    const handleCursorComplete = useCallback(() => {
        clearFadeTimeout();

        // Delay fade out to let the click effect finish
        fadeTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            setTrail([]);
        }, 400);
    }, [clearFadeTimeout]);

    // Handle reset event - immediately clear everything
    const handleReset = useCallback(() => {
        clearFadeTimeout();
        setIsVisible(false);
        setIsClicking(false);
        setTrail([]);
    }, [clearFadeTimeout]);

    useEffect(() => {
        if (!isActive) return;

        window.addEventListener("agent:cursor-focus", handleCursorFocus as EventListener);
        window.addEventListener("agent:cursor-move", handleCursorMove as EventListener);
        window.addEventListener("agent:cursor-click", handleCursorClick as EventListener);
        window.addEventListener("agent:cursor-complete", handleCursorComplete as EventListener);
        window.addEventListener("agent:reset", handleReset as EventListener);

        return () => {
            clearFadeTimeout();
            window.removeEventListener("agent:cursor-focus", handleCursorFocus as EventListener);
            window.removeEventListener("agent:cursor-move", handleCursorMove as EventListener);
            window.removeEventListener("agent:cursor-click", handleCursorClick as EventListener);
            window.removeEventListener("agent:cursor-complete", handleCursorComplete as EventListener);
            window.removeEventListener("agent:reset", handleReset as EventListener);
        };
    }, [isActive, handleCursorFocus, handleCursorMove, handleCursorClick, handleCursorComplete, handleReset, clearFadeTimeout]);

    if (!isActive) return null;

    return (
        <>
            {/* Trail dots */}
            <AnimatePresence>
                {trail.map((dot, index) => (
                    <motion.div
                        key={dot.id}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0.2, scale: 0.5 }}
                        exit={{ opacity: 0, scale: 0.2 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed pointer-events-none z-[99998]"
                        style={{
                            left: dot.x,
                            top: dot.y,
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: `hsl(210 100% 60% / ${0.5 - index * 0.06})`,
                            transform: "translate(-50%, -50%)",
                            boxShadow: `0 0 6px hsl(210 100% 60% / 0.4)`,
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Main cursor */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className="agent-cursor"
                        style={{
                            left: springX,
                            top: springY,
                        }}
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.3 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {/* Outer pulsing ring */}
                        <motion.div
                            className="agent-cursor-ring"
                            animate={
                                isClicking
                                    ? { scale: 2.5, opacity: 0 }
                                    : { scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }
                            }
                            transition={
                                isClicking
                                    ? { duration: 0.35, ease: "easeOut" }
                                    : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                            }
                        />

                        {/* Inner glowing dot */}
                        <motion.div
                            className="agent-cursor-dot"
                            animate={isClicking ? { scale: 1.3 } : { scale: 1 }}
                            transition={{ duration: 0.1 }}
                        />

                        {/* Primary click ripple */}
                        <AnimatePresence>
                            {isClicking && (
                                <motion.div
                                    className="absolute top-1/2 left-1/2"
                                    initial={{ width: 16, height: 16, opacity: 1 }}
                                    animate={{ width: 70, height: 70, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    style={{
                                        transform: "translate(-50%, -50%)",
                                        borderRadius: "50%",
                                        border: "2px solid hsl(210 100% 60%)",
                                        boxShadow: "0 0 25px hsl(210 100% 60% / 0.6)",
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Secondary ripple */}
                        <AnimatePresence>
                            {isClicking && (
                                <motion.div
                                    className="absolute top-1/2 left-1/2"
                                    initial={{ width: 16, height: 16, opacity: 0.7 }}
                                    animate={{ width: 90, height: 90, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                                    style={{
                                        transform: "translate(-50%, -50%)",
                                        borderRadius: "50%",
                                        border: "1px solid hsl(270 80% 60%)",
                                        boxShadow: "0 0 15px hsl(270 80% 60% / 0.4)",
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
