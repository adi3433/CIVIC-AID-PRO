import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, MousePointer2 } from "lucide-react";

interface AgentModeTransitionProps {
    isActive?: boolean;
}

export function AgentModeTransition({ isActive = true }: AgentModeTransitionProps) {
    const [showTransition, setShowTransition] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState<"entering" | "active" | "exiting">("entering");

    // Listen for agent mode start event
    const handleAgentStart = useCallback(() => {
        setTransitionPhase("entering");
        setShowTransition(true);

        // Phase 2: Active (show "Auto Mode" text)
        setTimeout(() => {
            setTransitionPhase("active");
        }, 400);

        // Phase 3: Exit transition
        setTimeout(() => {
            setTransitionPhase("exiting");
        }, 1400);

        // Hide completely
        setTimeout(() => {
            setShowTransition(false);
        }, 2000);
    }, []);

    useEffect(() => {
        if (!isActive) return;

        window.addEventListener("agent:mode-start", handleAgentStart as EventListener);

        return () => {
            window.removeEventListener("agent:mode-start", handleAgentStart as EventListener);
        };
    }, [isActive, handleAgentStart]);

    if (!isActive) return null;

    return (
        <AnimatePresence>
            {showTransition && (
                <>
                    {/* Full screen overlay with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: transitionPhase === "exiting" ? 0 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[10001] pointer-events-none"
                        style={{
                            background: "radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)",
                            backdropFilter: "blur(8px)",
                        }}
                    />

                    {/* Central animation container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: transitionPhase === "exiting" ? 0 : 1,
                            scale: transitionPhase === "exiting" ? 1.2 : 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="fixed inset-0 z-[10002] flex items-center justify-center pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-6">
                            {/* Animated icon ring */}
                            <div className="relative">
                                {/* Outer rotating ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-32 h-32 rounded-full"
                                    style={{
                                        background: "conic-gradient(from 0deg, transparent, hsl(210 100% 50%), transparent)",
                                        filter: "blur(2px)",
                                    }}
                                />

                                {/* Inner pulsing circle */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        boxShadow: [
                                            "0 0 30px hsl(210 100% 50% / 0.5)",
                                            "0 0 60px hsl(210 100% 50% / 0.8)",
                                            "0 0 30px hsl(210 100% 50% / 0.5)",
                                        ],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="relative w-32 h-32 rounded-full flex items-center justify-center"
                                    style={{
                                        background: "linear-gradient(135deg, hsl(210 100% 15%) 0%, hsl(270 80% 20%) 100%)",
                                        border: "2px solid hsl(210 100% 50% / 0.5)",
                                    }}
                                >
                                    {/* Phase-based icon */}
                                    <AnimatePresence mode="wait">
                                        {transitionPhase === "entering" && (
                                            <motion.div
                                                key="cpu"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Cpu className="w-14 h-14 text-blue-400" />
                                            </motion.div>
                                        )}
                                        {transitionPhase === "active" && (
                                            <motion.div
                                                key="zap"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Zap className="w-14 h-14 text-yellow-400" />
                                            </motion.div>
                                        )}
                                        {transitionPhase === "exiting" && (
                                            <motion.div
                                                key="cursor"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <MousePointer2 className="w-14 h-14 text-purple-400" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Particle effects */}
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0.5, 1, 0.5],
                                            x: Math.cos((i * Math.PI * 2) / 8) * 80,
                                            y: Math.sin((i * Math.PI * 2) / 8) * 80,
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                        className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-blue-400"
                                        style={{
                                            marginLeft: -4,
                                            marginTop: -4,
                                            boxShadow: "0 0 10px hsl(210 100% 60%)",
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Status text */}
                            <AnimatePresence mode="wait">
                                {transitionPhase === "entering" && (
                                    <motion.div
                                        key="text1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center"
                                    >
                                        <div className="text-xl font-semibold text-blue-400">
                                            Activating Agent
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            Switching to autonomous mode...
                                        </div>
                                    </motion.div>
                                )}
                                {transitionPhase === "active" && (
                                    <motion.div
                                        key="text2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                        >
                                            AUTO MODE
                                        </motion.div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            AI is now in control
                                        </div>
                                    </motion.div>
                                )}
                                {transitionPhase === "exiting" && (
                                    <motion.div
                                        key="text3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center"
                                    >
                                        <div className="text-xl font-semibold text-purple-400">
                                            Ghost Cursor Active
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            Executing your command...
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress bar */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "200px" }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="h-1 rounded-full overflow-hidden"
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                }}
                            >
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="h-full w-full"
                                    style={{
                                        background: "linear-gradient(90deg, hsl(210 100% 50%), hsl(270 80% 60%))",
                                    }}
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Dispatch agent mode start event
 * Call this when voice command or chat command triggers agentic mode
 */
export function dispatchAgentModeStart() {
    const event = new CustomEvent("agent:mode-start");
    window.dispatchEvent(event);
}
