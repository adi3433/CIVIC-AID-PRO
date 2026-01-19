import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FocusRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface AgentFocusOverlayProps {
    isActive?: boolean;
}

export function AgentFocusOverlay({ isActive = true }: AgentFocusOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [focusRect, setFocusRect] = useState<FocusRect | null>(null);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentElementRef = useRef<HTMLElement | null>(null);

    // Clear any pending fade timeout
    const clearFadeTimeout = useCallback(() => {
        if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
            fadeTimeoutRef.current = null;
        }
    }, []);

    // Get precise element bounds with padding
    const getElementRect = useCallback((element: HTMLElement, padding: number = 6): FocusRect => {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.max(0, rect.left - padding),
            y: Math.max(0, rect.top - padding),
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        };
    }, []);

    // Find element by various methods
    const findTargetElement = useCallback((x: number, y: number, elementId?: string): HTMLElement | null => {
        let element: HTMLElement | null = null;

        // First try by data-agent-id
        if (elementId) {
            element = document.querySelector(`[data-agent-id="${elementId}"]`) as HTMLElement;
            if (element) return element;

            // Try by id attribute
            element = document.getElementById(elementId);
            if (element) return element;

            // Try partial match for dynamic IDs
            element = document.querySelector(`[id*="${elementId}"]`) as HTMLElement;
            if (element) return element;
        }

        // Fallback to elementFromPoint
        element = document.elementFromPoint(x, y) as HTMLElement;

        // If we got the blur overlay itself, try to find the actual element underneath
        if (element && element.closest('[class*="agent-focus"]')) {
            // Temporarily hide overlay and try again
            return null;
        }

        return element;
    }, []);

    // Handle focus event - show overlay immediately with the target element
    const handleCursorFocus = useCallback((e: CustomEvent<{ x: number; y: number; elementId?: string }>) => {
        clearFadeTimeout();

        const { x, y, elementId } = e.detail;
        const element = findTargetElement(x, y, elementId);

        if (element) {
            currentElementRef.current = element;
            const rect = getElementRect(element);
            setFocusRect(rect);
            setIsVisible(true);
        }
    }, [clearFadeTimeout, findTargetElement, getElementRect]);

    // Handle cursor move - update highlight smoothly (only if already visible)
    const handleCursorMove = useCallback((e: CustomEvent<{ x: number; y: number }>) => {
        // Only update if we already have a focus (don't show on move alone)
        if (!isVisible || !currentElementRef.current) return;

        // Keep the same element highlighted - don't jump around
        const rect = getElementRect(currentElementRef.current);
        setFocusRect(rect);
    }, [isVisible, getElementRect]);

    // Handle click event - flash effect
    const handleCursorClick = useCallback(() => {
        // Keep visible during click, the flash is handled by CSS
    }, []);

    // Handle complete - fade out after delay
    const handleCursorComplete = useCallback(() => {
        clearFadeTimeout();

        // Keep visible for a moment after completion for visual feedback
        fadeTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            setFocusRect(null);
            currentElementRef.current = null;
        }, 400);
    }, [clearFadeTimeout]);

    // Handle reset - immediately clear everything
    const handleReset = useCallback(() => {
        clearFadeTimeout();
        setIsVisible(false);
        setFocusRect(null);
        currentElementRef.current = null;
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
        <AnimatePresence>
            {isVisible && focusRect && (
                <>
                    {/* Backdrop blur overlay with cutout for the element */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="fixed inset-0 z-[9997] pointer-events-none"
                        style={{
                            background: "rgba(0, 0, 0, 0.65)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                            // Create spotlight cutout for the focused element
                            clipPath: `polygon(
                0% 0%,
                0% 100%,
                ${focusRect.x}px 100%,
                ${focusRect.x}px ${focusRect.y}px,
                ${focusRect.x + focusRect.width}px ${focusRect.y}px,
                ${focusRect.x + focusRect.width}px ${focusRect.y + focusRect.height}px,
                ${focusRect.x}px ${focusRect.y + focusRect.height}px,
                ${focusRect.x}px 100%,
                100% 100%,
                100% 0%
              )`,
                        }}
                    />

                    {/* Main focus ring - highlighted border around element */}
                    <motion.div
                        key="focus-ring"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed z-[9998] pointer-events-none"
                        style={{
                            left: focusRect.x,
                            top: focusRect.y,
                            width: focusRect.width,
                            height: focusRect.height,
                            borderRadius: "8px",
                            boxShadow: `
                0 0 0 3px hsl(210 100% 55%),
                0 0 15px 2px hsl(210 100% 55% / 0.6),
                0 0 30px 4px hsl(210 100% 55% / 0.3),
                inset 0 0 10px hsl(210 100% 55% / 0.1)
              `,
                        }}
                    />

                    {/* Pulsing glow ring */}
                    <motion.div
                        key="glow-ring"
                        animate={{
                            boxShadow: [
                                "0 0 0 2px hsl(210 100% 60% / 0.4), 0 0 20px hsl(210 100% 60% / 0.3)",
                                "0 0 0 4px hsl(210 100% 60% / 0.6), 0 0 35px hsl(210 100% 60% / 0.5)",
                                "0 0 0 2px hsl(210 100% 60% / 0.4), 0 0 20px hsl(210 100% 60% / 0.3)",
                            ],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="fixed z-[9997] pointer-events-none"
                        style={{
                            left: focusRect.x - 4,
                            top: focusRect.y - 4,
                            width: focusRect.width + 8,
                            height: focusRect.height + 8,
                            borderRadius: "12px",
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
