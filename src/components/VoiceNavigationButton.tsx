import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Loader2, X, CheckCircle, AlertCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { processVoiceNavigation } from "@/lib/voiceNavigationService";
import { useTheme } from "@/contexts/ThemeContext";
import { chatbotService } from "@/lib/chatbotService";
import { scanPage } from "@/lib/agent/pageScanner";
import { executeAction } from "@/lib/agent/agentExecutor";
import { AgentContext } from "@/lib/agent/types";

export function VoiceNavigationButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { toggleTheme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const stopAgentRef = useRef(false);

  // Elder mode state
  const [elderlyMode, setElderlyMode] = useState(() => {
    return localStorage.getItem("elderlyMode") === "true";
  });

  useEffect(() => {
    if (elderlyMode) {
      document.documentElement.classList.add("elderly-mode");
      document.documentElement.style.fontSize = "18px";
    } else {
      document.documentElement.classList.remove("elderly-mode");
      document.documentElement.style.fontSize = "16px";
    }
    localStorage.setItem("elderlyMode", elderlyMode.toString());
  }, [elderlyMode]);

  const handleStopAgent = () => {
    stopAgentRef.current = true;
    setAgentStatus("Stopping...");
  };

  const runAgentLoop = async (userGoal: string) => {
    setIsProcessing(true);
    setAgentStatus("Analyzing request...");
    stopAgentRef.current = false;

    let history: string[] = [];
    const MAX_STEPS = 10;
    let steps = 0;

    try {
      while (steps < MAX_STEPS && !stopAgentRef.current) {
        // 1. Persevere: Scan the page
        const pageElements = scanPage();
        const context: AgentContext = {
          currentUrl: window.location.pathname,
          pageTitle: document.title,
          interactiveElements: pageElements
        };

        // 2. Reason: Ask AI what to do
        setAgentStatus(`Thinking... (Step ${steps + 1})`);
        const decision = await chatbotService.decideNextStep(userGoal, context, history);

        console.log("Agent Decision:", decision);
        history.push(`Step ${steps + 1}: Thought: "${decision.thoughtProcess}" -> Action: ${decision.action.type} on ${JSON.stringify(decision.action.parameters)}`);

        if (decision.action.type === "none") {
          setAgentStatus("Task completed");
          break;
        }

        // 3. Act: Execute the command
        setAgentStatus(`Executing: ${decision.action.type}...`);

        // Special internal actions handling (theme/mode)
        if (decision.action.type === "click_element" && decision.action.parameters.id === "toggle-theme-btn") {
          toggleTheme();
        } else if (decision.action.type === "click_element" && decision.action.parameters.id === "elderly-mode-btn") {
          setElderlyMode(!elderlyMode);
        } else {
          // General executor
          const result = await executeAction(decision.action);

          if (!result.success && decision.action.type === "navigate") {
            // Handle navigation specifically if executor didn't (usually executor returns true for nav)
            if (decision.action.parameters.route) {
              navigate(decision.action.parameters.route);
              // Allow time for page load
              await new Promise(r => setTimeout(r, 1500));
            }
          } else if (!result.success) {
            console.warn("Action failed:", result.message);
            // history.push(`Error: ${result.message}`);
          }
        }

        // Wait a bit for UI to settle
        await new Promise(r => setTimeout(r, 1000));
        steps++;
      }

      setAgentStatus(null);
      setFeedbackType("success");
      setShowFeedback(true);

    } catch (error) {
      console.error("Agent Loop Error:", error);
      setAgentStatus("Error occurred");
      setFeedbackType("error");
      setShowFeedback(true);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN"; // India English

      recognition.onstart = () => {
        setIsListening(true);
        setAgentStatus("Listening...");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Heard:", transcript);

        const isFullAgentic = localStorage.getItem("fullAgenticMode") === "true";

        if (isFullAgentic) {
          // New Autonomous Mode (K2 Thinking)
          runAgentLoop(transcript);
        } else {
          // Old/Standard Mode (Simple Intent Matching)
          setIsProcessing(true);
          setAgentStatus("Processing command...");

          try {
            // Use the existing voice service
            const result = await processVoiceNavigation(transcript);

            if (result.success) {
              if (result.action) {
                // Some basic actions might need handling if not pure navigation
                if (result.action === "theme_toggle") toggleTheme();
                // etc...
              }
              if (result.route) {
                navigate(result.route);
              }
              setFeedbackType("success");
              setShowFeedback(true);
            } else {
              setFeedbackType("error");
              setShowFeedback(true);
              toast({
                title: "Could not understand",
                description: "Try saying 'Report a pothole' or 'Go to Safety'",
                variant: "destructive"
              });
            }
          } catch (err) {
            console.error("Standard voice processing error", err);
            setFeedbackType("error");
            setShowFeedback(true);
          } finally {
            setIsProcessing(false);
            setTimeout(() => setShowFeedback(false), 3000);
          }
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("Speech error", event);
        setIsListening(false);
        setAgentStatus(null);
        toast({ title: "Error", description: "Could not hear you. Try again.", variant: "destructive" });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({ title: "Not Supported", description: "Voice recognition not supported in this browser.", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Floating Status / Feedback for Agent */}
      {(isProcessing || showFeedback) && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${feedbackType === "error" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            }`}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium text-sm">{agentStatus || "Processing..."}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 hover:bg-white/20 rounded-full"
                  onClick={handleStopAgent}
                  title="Stop Agent"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {feedbackType === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="font-medium text-sm">
                  {feedbackType === "success" ? "Done!" : "Something went wrong"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <Button
        size="lg"
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl transition-all duration-300 z-50 ${isListening
          ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
          : "bg-primary hover:bg-primary/90 hover:scale-105"
          }`}
        onClick={isListening ? () => { } : startListening}
      >
        {isListening ? (
          <Mic className="h-6 w-6 text-white animate-bounce" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
        <span className="sr-only">Voice Navigation</span>
      </Button>
    </>
  );
}
