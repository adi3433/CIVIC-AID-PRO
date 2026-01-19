import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { processVoiceNavigation } from "@/lib/voiceNavigationService";
import { useTheme } from "@/contexts/ThemeContext";
import { chatbotService } from "@/lib/chatbotService";
import { scanPage } from "@/lib/agent/pageScanner";
import { executeAction } from "@/lib/agent/agentExecutor";
import { AgentContext } from "@/lib/agent/types";
import { dispatchAgentModeStart } from "@/components/agent";

export function VoiceNavigationButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { toggleTheme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );
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

  // OPTIMIZED: Smart wait for element to appear (instead of fixed delays)
  const waitForElement = async (selector: string, timeout = 500): Promise<boolean> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (document.querySelector(selector)) return true;
      await new Promise(r => setTimeout(r, 50)); // Check every 50ms
    }
    return false;
  };

  // SMART: Wait for page content to fully load
  // - Waits for loading spinners/skeletons to disappear
  // - Waits for element count to stabilize (DOM settled)
  const waitForPageReady = async (maxWait = 300): Promise<void> => {
    const start = Date.now();
    let lastElementCount = 0;
    let stableFrames = 0;

    // First, wait for any visible loading indicators
    while (Date.now() - start < maxWait) {
      // Common loading patterns
      const hasLoading = document.querySelector(
        '[data-loading], .loading, [aria-busy="true"], .animate-spin, .skeleton, [class*="loader"]'
      );

      if (!hasLoading) break;
      await new Promise(r => setTimeout(r, 100));
    }

    // Second, wait for DOM to stabilize (element count stops changing)
    // This catches async-rendered content like API data
    while (Date.now() - start < maxWait) {
      const currentCount = document.querySelectorAll(
        'button, a[href], input, [role="button"], [data-agent-id]'
      ).length;

      if (currentCount === lastElementCount) {
        stableFrames++;
        if (stableFrames >= 3) {
          // DOM stable for 3 checks (~150ms)
          return;
        }
      } else {
        stableFrames = 0;
        lastElementCount = currentCount;
      }

      await new Promise(r => setTimeout(r, 50));
    }
  };

  const runAgentLoop = async (userGoal: string) => {
    // Trigger the "Switching to Auto Mode" transition animation
    dispatchAgentModeStart();

    // Wait for transition animation to complete before starting
    await new Promise(r => setTimeout(r, 2000));

    setIsProcessing(true);
    setAgentStatus("Analyzing request...");
    stopAgentRef.current = false;

    // Import cache for invalidation
    const { agentCache } = await import("@/lib/agent/agentCache");

    let history: string[] = [];
    const MAX_STEPS = 10;
    let steps = 0;
    let forceRefreshNextScan = false; // Flag to force fresh DOM scan

    try {
      while (steps < MAX_STEPS && !stopAgentRef.current) {
        // 1. Scan the page (force refresh after navigation)
        const pageElements = scanPage(forceRefreshNextScan);
        forceRefreshNextScan = false; // Reset flag

        const context: AgentContext = {
          currentUrl: window.location.pathname,
          pageTitle: document.title,
          interactiveElements: pageElements,
        };

        console.log(`📍 Step ${steps + 1}: On ${context.currentUrl}, found ${pageElements.length} elements`);

        // 2. Ask AI what to do
        setAgentStatus(`Thinking... (Step ${steps + 1})`);
        const decision = await chatbotService.decideNextStep(
          userGoal,
          context,
          history,
        );

        console.log("Agent Decision:", decision);
        history.push(
          `Step ${steps + 1}: On page "${context.currentUrl}" → Action: ${decision.action.type}(${JSON.stringify(decision.action.parameters)})`,
        );

        if (decision.action.type === "none") {
          setAgentStatus("Task completed");
          break;
        }

        // 3. Execute the command
        setAgentStatus(`Executing: ${decision.action.type}...`);

        // Special internal actions handling (theme/mode)
        if (
          decision.action.type === "click_element" &&
          decision.action.parameters.id === "toggle-theme-btn"
        ) {
          toggleTheme();
        } else if (
          decision.action.type === "click_element" &&
          decision.action.parameters.id === "elderly-mode-btn"
        ) {
          setElderlyMode(!elderlyMode);
        } else if (decision.action.type === "navigate") {
          // Handle navigation with cache invalidation
          if (decision.action.parameters.route) {
            navigate(decision.action.parameters.route);

            // CRITICAL: Clear ALL cache after navigation (URL changed!)
            agentCache.clear();

            // Force fresh page scan on next iteration
            forceRefreshNextScan = true;

            // Wait longer for new page to fully load
            // React needs time to mount + API calls need to complete + re-render with data
            await waitForPageReady(2000);

            // Add explicit history entry so AI knows navigation succeeded
            history.push(`✅ Navigation successful: Now on ${decision.action.parameters.route}`);
          }
        } else {
          // General executor (click, type)
          const result = await executeAction(decision.action);

          if (!result.success) {
            console.warn("Action failed:", result.message);
            history.push(`⚠️ Action failed: ${result.message}`);
          } else {
            // Successful action might have changed page state
            agentCache.invalidatePageContext();
          }
        }

        // Wait for UI to settle
        await waitForPageReady(300);
        steps++;
      }

      // Task completed - let AgentModeIndicator handle the visual feedback
      // (Removed duplicate setFeedbackType/setShowFeedback to avoid duplicate "Done!" indicator)
      setAgentStatus(null);

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
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
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

        const isFullAgentic =
          localStorage.getItem("fullAgenticMode") === "true";

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
                variant: "destructive",
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
        toast({
          title: "Error",
          description: "Could not hear you. Try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Voice recognition not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Floating Status / Feedback for Agent */}
      {(isProcessing || showFeedback) && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div
            className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${feedbackType === "error"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
              }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium text-sm">
                  {agentStatus || "Processing..."}
                </span>
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
                {feedbackType === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-medium text-sm">
                  {feedbackType === "success"
                    ? "Done!"
                    : "Something went wrong"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <Button
        size="icon"
        className={`fixed bottom-44 right-6 h-14 w-14 rounded-full shadow-xl transition-all duration-300 z-50 ${isListening
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
