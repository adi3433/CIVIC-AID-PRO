import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { processVoiceNavigation } from "@/lib/voiceNavigationService";
import { useTheme } from "@/contexts/ThemeContext";

export function VoiceNavigationButton() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleTheme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success",
  );
  const [elderlyMode, setElderlyMode] = useState(() => {
    return localStorage.getItem("elderlyMode") === "true";
  });

  // Apply elderly mode styles
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

  const executeAction = async (action: string, description: string) => {
    switch (action) {
      case "toggle_theme":
        toggleTheme();
        toast({
          title: "✅ Theme Changed",
          description: "Theme toggled successfully",
          duration: 2000,
        });
        break;

      case "toggle_elderly_mode":
        setElderlyMode(!elderlyMode);
        toast({
          title: "✅ Accessibility Mode",
          description: elderlyMode
            ? "Elderly mode disabled"
            : "Elderly mode enabled - larger text & simplified UI",
          duration: 3000,
        });
        break;

      case "call_emergency":
        navigate("/safety/emergency-contacts");
        toast({
          title: "📞 Emergency Contacts",
          description: "Opening emergency numbers",
          duration: 2000,
        });
        break;

      case "alert_emergency_contacts":
        // Get current location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const message = `EMERGENCY ALERT! I need help. My location: https://www.google.com/maps?q=${latitude},${longitude}`;

              // Copy to clipboard
              navigator.clipboard.writeText(message);

              toast({
                title: "🚨 Emergency Alert Ready",
                description:
                  "Location copied to clipboard. Please share with your contacts via WhatsApp or SMS.",
                duration: 5000,
              });
            },
            () => {
              toast({
                title: "⚠️ Location Required",
                description:
                  "Please enable location services for emergency alerts",
                variant: "destructive",
              });
            },
          );
        }
        break;

      case "read_announcements":
        toast({
          title: "🔊 Reading Announcements",
          description: "Text-to-speech feature coming soon",
          duration: 2000,
        });
        // Could implement text-to-speech here
        break;

      case "quick_report":
        navigate("/report");
        toast({
          title: "📝 Quick Report",
          description: "Opening report form with your location",
          duration: 2000,
        });
        break;

      default:
        toast({
          title: "⚠️ Unknown Action",
          description: `Action "${action}" not implemented`,
          variant: "destructive",
        });
    }
  };

  const handleVoiceNavigation = async () => {
    try {
      setIsListening(true);

      toast({
        title: "🎤 Listening...",
        description: "Speak your request clearly",
        duration: 2000,
      });

      const result = await processVoiceNavigation();

      setIsListening(false);
      setIsProcessing(true);

      if (result.success) {
        // Show success feedback
        setFeedbackType("success");
        setShowFeedback(true);

        if (result.action) {
          // Execute action
          toast({
            title: "⚡ Executing Action",
            description: result.intent?.description,
            duration: 2000,
          });

          setTimeout(async () => {
            await executeAction(
              result.action!,
              result.intent?.description || "",
            );
            setIsProcessing(false);
            setShowFeedback(false);
          }, 1000);
        } else if (result.route) {
          // Navigate to route
          toast({
            title: "✅ Navigating",
            description: `Going to ${result.intent?.description}`,
            duration: 2000,
          });

          setTimeout(() => {
            navigate(result.route!);
            setIsProcessing(false);
            setShowFeedback(false);
          }, 1000);
        }
      } else {
        // Show error feedback
        setFeedbackType("error");
        setShowFeedback(true);
        setIsProcessing(false);

        toast({
          title: "❌ Could not understand",
          description:
            result.error || "Please try again with a clearer request",
          variant: "destructive",
          duration: 3000,
        });

        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Voice navigation error:", error);
      setIsListening(false);
      setIsProcessing(false);
      setFeedbackType("error");
      setShowFeedback(true);

      toast({
        title: "Error",
        description: error.message || "Voice navigation failed",
        variant: "destructive",
      });

      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  };

  const handleCancel = () => {
    setIsListening(false);
    setIsProcessing(false);
    setShowFeedback(false);

    toast({
      title: "Cancelled",
      description: "Voice navigation cancelled",
      duration: 1500,
    });
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (isListening) {
      return <Mic className="w-5 h-5 animate-pulse" />;
    }
    if (isProcessing) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    if (showFeedback) {
      return feedbackType === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      );
    }
    return <Mic className="w-5 h-5" />;
  };

  // Get button color based on state
  const getButtonClass = () => {
    if (isListening) {
      return "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse";
    }
    if (isProcessing) {
      return "bg-blue-500 hover:bg-blue-600";
    }
    if (showFeedback) {
      return feedbackType === "success"
        ? "bg-green-500 hover:bg-green-600"
        : "bg-orange-500 hover:bg-orange-600";
    }
    return "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl";
  };

  return (
    <>
      {/* Main Mic Button */}
      <Button
        onClick={
          isListening || isProcessing ? handleCancel : handleVoiceNavigation
        }
        disabled={isProcessing && !isListening}
        className={`fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full transition-all duration-300 ${getButtonClass()}`}
        size="icon"
      >
        {getButtonIcon()}
      </Button>

      {/* Listening Indicator */}
      {isListening && (
        <div className="fixed bottom-40 right-4 z-50">
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div
                  className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                Listening...
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Speak your request clearly
            </p>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && !isListening && (
        <div className="fixed bottom-40 right-4 z-50">
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-foreground">
                Processing...
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Finding the best match
            </p>
          </div>
        </div>
      )}

      {/* Cancel Button (when listening) */}
      {isListening && (
        <Button
          onClick={handleCancel}
          variant="outline"
          className="fixed bottom-24 left-4 z-50 rounded-full shadow-lg"
          size="icon"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}
