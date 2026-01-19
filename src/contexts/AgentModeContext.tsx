import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AgentModeContextType {
    isAgentModeActive: boolean;
    enableAgentMode: () => void;
    disableAgentMode: () => void;
    toggleAgentMode: () => void;
}

const AgentModeContext = createContext<AgentModeContextType | undefined>(undefined);

interface AgentModeProviderProps {
    children: ReactNode;
}

export function AgentModeProvider({ children }: AgentModeProviderProps) {
    const [isAgentModeActive, setIsAgentModeActive] = useState(false);

    // Check localStorage for persisted state
    useEffect(() => {
        const stored = localStorage.getItem("fullAgenticMode");
        if (stored === "true") {
            setIsAgentModeActive(true);
        }
    }, []);

    // Apply/remove agent-mode class to document
    useEffect(() => {
        const root = document.documentElement;
        if (isAgentModeActive) {
            root.classList.add("agent-mode");
            root.classList.add("dark"); // Agent mode looks best in dark mode
        } else {
            root.classList.remove("agent-mode");
        }
    }, [isAgentModeActive]);

    const enableAgentMode = () => {
        setIsAgentModeActive(true);
        localStorage.setItem("fullAgenticMode", "true");
    };

    const disableAgentMode = () => {
        setIsAgentModeActive(false);
        localStorage.setItem("fullAgenticMode", "false");
    };

    const toggleAgentMode = () => {
        if (isAgentModeActive) {
            disableAgentMode();
        } else {
            enableAgentMode();
        }
    };

    return (
        <AgentModeContext.Provider
            value={{
                isAgentModeActive,
                enableAgentMode,
                disableAgentMode,
                toggleAgentMode,
            }}
        >
            {children}
        </AgentModeContext.Provider>
    );
}

export function useAgentMode() {
    const context = useContext(AgentModeContext);
    if (context === undefined) {
        throw new Error("useAgentMode must be used within an AgentModeProvider");
    }
    return context;
}
