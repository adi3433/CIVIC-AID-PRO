import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, MousePointer2, Sparkles } from "lucide-react";

type AgentState = "idle" | "focusing" | "acting" | "complete";

interface AgentModeIndicatorProps {
    isActive?: boolean;
}

export function AgentModeIndicator({ isActive = true }: AgentModeIndicatorProps) {
    const [state, setState] = useState<AgentState>("idle");
    const [actionText, setActionText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear any pending hide timeout
    const clearHideTimeout = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    }, []);

    // Keep track of state in ref to avoid re-creating event listeners on state change
    const stateRef = useRef<AgentState>("idle");
    useEffect(() => { stateRef.current = state; }, [state]);

    // Handle focus event - AI is targeting an element
    const handleCursorFocus = useCallback(() => {
        clearHideTimeout();
        setState("focusing");
        setActionText("Targeting element...");
        setIsVisible(true);
    }, [clearHideTimeout]);

    // Handle cursor move - AI is moving to target
    const handleCursorMove = useCallback(() => {
        clearHideTimeout();
        // Check ref instead of state to keep dependency stable
        if (stateRef.current === "idle") {
            setState("focusing");
            setActionText("Moving to target...");
            setIsVisible(true);
        }
    }, [clearHideTimeout]);

    // Handle click event - AI is clicking
    const handleCursorClick = useCallback(() => {
        clearHideTimeout();
        setState("acting");
        setActionText("Clicking...");
    }, [clearHideTimeout]);

    // Handle complete - action finished
    const handleCursorComplete = useCallback(() => {
        clearHideTimeout();
        setState("complete");
        setActionText("Done!");

        // Hide after showing completion
        hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            setState("idle");
            setActionText("");
        }, 1200);
    }, [clearHideTimeout]);

    // Handle reset - immediately clear everything
    const handleReset = useCallback(() => {
        clearHideTimeout();
        setIsVisible(false);
        setState("idle");
        setActionText("");
    }, [clearHideTimeout]);

    useEffect(() => {
        if (!isActive) return;

        window.addEventListener("agent:cursor-focus", handleCursorFocus as EventListener);
        window.addEventListener("agent:cursor-move", handleCursorMove as EventListener);
        window.addEventListener("agent:cursor-click", handleCursorClick as EventListener);
        window.addEventListener("agent:cursor-complete", handleCursorComplete as EventListener);
        window.addEventListener("agent:reset", handleReset as EventListener);

        return () => {
            clearHideTimeout();
            window.removeEventListener("agent:cursor-focus", handleCursorFocus as EventListener);
            window.removeEventListener("agent:cursor-move", handleCursorMove as EventListener);
            window.removeEventListener("agent:cursor-click", handleCursorClick as EventListener);
            window.removeEventListener("agent:cursor-complete", handleCursorComplete as EventListener);
            window.removeEventListener("agent:reset", handleReset as EventListener);
        };
    }, [isActive, handleCursorFocus, handleCursorMove, handleCursorClick, handleCursorComplete, handleReset, clearHideTimeout]);

    if (!isActive) return null;

    const getStateConfig = () => {
        switch (state) {
            case "focusing":
                return {
                    icon: <Brain className="w-4 h-4" />,
                    color: "from-purple-500/30 to-blue-500/20 border-purple-400/50",
                    textColor: "text-purple-200",
                    glow: "0 0 30px hsl(270 80% 60% / 0.4)",
                };
            case "acting":
                return {
                    icon: <MousePointer2 className="w-4 h-4" />,
                    color: "from-blue-500/30 to-cyan-500/20 border-blue-400/50",
                    textColor: "text-blue-200",
                    glow: "0 0 30px hsl(210 100% 50% / 0.4)",
                };
            case "complete":
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: "from-green-500/30 to-emerald-500/20 border-green-400/50",
                    textColor: "text-green-200",
                    glow: "0 0 30px hsl(150 80% 50% / 0.4)",
                };
            default:
                return {
                    icon: <Sparkles className="w-4 h-4" />,
                    color: "from-gray-500/30 to-gray-600/20 border-gray-400/50",
                    textColor: "text-gray-200",
                    glow: "0 0 20px rgba(0, 0, 0, 0.3)",
                };
        }
    };

    const config = getStateConfig();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000]"
                >
                    <motion.div
                        layout
                        className={`
              flex items-center gap-3 px-5 py-2.5
              rounded-full backdrop-blur-xl
              bg-gradient-to-r ${config.color}
              border shadow-2xl
            `}
                        style={{ boxShadow: config.glow }}
                    >
                        {/* Animated icon */}
                        <motion.div
                            animate={state === "focusing" ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 0.8, repeat: state === "focusing" ? Infinity : 0 }}
                            className={config.textColor}
                        >
                            {config.icon}
                        </motion.div>

                        {/* Status text */}
                        <motion.span
                            key={actionText}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`text-sm font-medium ${config.textColor} whitespace-nowrap`}
                        >
                            {actionText}
                        </motion.span>

                        {/* Thinking dots for focusing state */}
                        {state === "focusing" && (
                            <div className="flex gap-1 ml-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-purple-400"
                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
