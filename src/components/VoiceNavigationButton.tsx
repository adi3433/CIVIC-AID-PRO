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
        // Use Web Speech API for text-to-speech
        if ("speechSynthesis" in window) {
          const announcements = [
            {
              title: "Heavy Rain Alert",
              description: "Expected flooding in low-lying areas",
            },
            {
              title: "PM Awas Yojana",
              description: "New housing scheme applications open",
            },
            {
              title: "Road Closure",
              description: "MG Road closed for metro work",
            },
          ];

          // Cancel any ongoing speech
          window.speechSynthesis.cancel();

          toast({
            title: "🔊 Reading Announcements",
            description: `Reading ${announcements.length} announcements`,
            duration: 3000,
          });

          // Read each announcement
          announcements.forEach((announcement, index) => {
            const utterance = new SpeechSynthesisUtterance(
              `Announcement ${index + 1}. ${announcement.title}. ${announcement.description}.`,
            );
            utterance.lang = "en-IN";
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            window.speechSynthesis.speak(utterance);
          });
        } else {
          toast({
            title: "⚠️ Not Supported",
            description: "Text-to-speech is not supported in this browser",
            variant: "destructive",
          });
        }
        break;

      case "quick_report":
        navigate("/report");
        toast({
          title: "📝 Quick Report",
          description: "Opening report form with your location",
          duration: 2000,
        });
        break;

      case "report_and_track_workflow":
        // Multi-step: Report → Save → Track → Remind
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;

              // Save to tracker
              const reportId = `RPT-${Date.now()}`;
              const report = {
                id: reportId,
                location: { latitude, longitude },
                timestamp: new Date().toISOString(),
                status: "pending",
              };

              // Save to localStorage for tracking
              const existingReports = JSON.parse(
                localStorage.getItem("trackedReports") || "[]",
              );
              existingReports.push(report);
              localStorage.setItem(
                "trackedReports",
                JSON.stringify(existingReports),
              );

              // Set reminder for 7 days
              const reminderDate = new Date();
              reminderDate.setDate(reminderDate.getDate() + 7);
              localStorage.setItem(
                `reminder_${reportId}`,
                reminderDate.toISOString(),
              );

              toast({
                title: "✅ Report Workflow Started",
                description: `Location captured. Report ID: ${reportId}. Reminder set for 7 days.`,
                duration: 4000,
              });

              // Navigate to report form
              setTimeout(() => {
                navigate("/report", {
                  state: { latitude, longitude, reportId },
                });
              }, 1500);
            },
            () => {
              toast({
                title: "⚠️ Location Required",
                description: "Enable location to capture report location",
                variant: "destructive",
              });
            },
          );
        }
        break;

      case "going_home_workflow":
        // Multi-step: Destination → Time estimate → Safety check-in → Share prep
        toast({
          title: "🏠 Going Home Safely",
          description: "Setting up safety check-in...",
          duration: 2000,
        });

        // Default 30-minute check-in for going home
        setTimeout(() => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const shareMessage = `🏠 I'm heading home. Track me: https://www.google.com/maps?q=${latitude},${longitude}\n\nI'll check in within 30 minutes. If I don't respond, please call me.`;

                // Copy to clipboard
                navigator.clipboard.writeText(shareMessage);

                toast({
                  title: "✅ Safety Check-in Ready",
                  description:
                    "30-min timer set. Share message copied to clipboard. Opening check-in page...",
                  duration: 4000,
                });

                setTimeout(() => {
                  navigate("/safety/check-in", {
                    state: { duration: 30, autoStart: true },
                  });
                }, 2000);
              },
              () => {
                navigate("/safety/check-in", {
                  state: { duration: 30, autoStart: true },
                });
              },
            );
          } else {
            navigate("/safety/check-in", {
              state: { duration: 30, autoStart: true },
            });
          }
        }, 1000);
        break;

      case "pay_all_bills_workflow":
        // Multi-step: Check bills → Calculate → Show summary → Navigate
        const mockBills = [
          { name: "Electricity", amount: 1250, dueDate: "Jan 25" },
          { name: "Water", amount: 450, dueDate: "Jan 28" },
          { name: "Gas", amount: 780, dueDate: "Feb 2" },
        ];

        const total = mockBills.reduce((sum, bill) => sum + bill.amount, 0);
        const billList = mockBills
          .map((b) => `${b.name}: ₹${b.amount}`)
          .join(", ");

        toast({
          title: "💰 Pending Bills Summary",
          description: `${mockBills.length} bills found: ${billList}. Total: ₹${total}`,
          duration: 5000,
        });

        setTimeout(() => {
          navigate("/payments", {
            state: { bills: mockBills, autoSelect: true },
          });
        }, 2500);
        break;

      case "check_eligibility_workflow":
        // Multi-step: Analyze profile → Match schemes → Show docs → Navigate
        toast({
          title: "🔍 Checking Eligibility...",
          description: "Analyzing your profile for matching schemes",
          duration: 2000,
        });

        setTimeout(async () => {
          // Simulate profile analysis (in real app, use user profile from Supabase)
          const mockProfile = {
            age: 35,
            income: "Below 5 LPA",
            location: "Pala, Kerala",
          };

          const matchedSchemes = [
            {
              name: "PM Awas Yojana",
              match: 95,
              docs: ["Aadhaar", "Income Certificate", "Land Documents"],
            },
            {
              name: "Ayushman Bharat",
              match: 88,
              docs: ["Aadhaar", "Ration Card"],
            },
            { name: "Pradhan Mantri Kisan", match: 45, docs: ["Land Records"] },
          ];

          const topScheme = matchedSchemes[0];

          toast({
            title: "✅ Eligibility Matched!",
            description: `You're ${topScheme.match}% eligible for ${topScheme.name}. Required: ${topScheme.docs.join(", ")}`,
            duration: 6000,
          });

          setTimeout(() => {
            navigate("/schemes", {
              state: { matchedSchemes, highlightFirst: true },
            });
          }, 3000);
        }, 1500);
        break;

      case "area_updates_workflow":
        // Multi-step: Get location → Filter announcements → Show nearby reports → TTS
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // Reverse geocode to get area name
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                );
                const data = await response.json();
                const area =
                  data.address?.suburb ||
                  data.address?.neighbourhood ||
                  data.address?.city ||
                  "your area";

                // Mock nearby reports (in real app, query Supabase)
                const nearbyReports = [
                  { type: "Pothole", status: "Resolved", date: "2 days ago" },
                  {
                    type: "Streetlight",
                    status: "Pending",
                    date: "1 week ago",
                  },
                ];

                const announcements = [
                  {
                    title: "Heavy Rain Alert",
                    description: "Expected flooding in low-lying areas",
                  },
                  {
                    title: "PM Awas Yojana",
                    description: "New housing scheme applications open",
                  },
                ];

                // Read aloud
                if ("speechSynthesis" in window) {
                  window.speechSynthesis.cancel();

                  const updateText = `Updates for ${area}. ${announcements.length} announcements: ${announcements.map((a) => `${a.title}. ${a.description}`).join(". ")}. ${nearbyReports.length} nearby reports: ${nearbyReports.map((r) => `${r.type} ${r.status}`).join(", ")}.`;

                  const utterance = new SpeechSynthesisUtterance(updateText);
                  utterance.lang = "en-IN";
                  utterance.rate = 0.9;

                  window.speechSynthesis.speak(utterance);
                }

                toast({
                  title: `📍 Updates for ${area}`,
                  description: `${announcements.length} announcements, ${nearbyReports.length} nearby reports. Reading aloud...`,
                  duration: 5000,
                });

                setTimeout(() => {
                  navigate("/", { state: { showAreaUpdates: true } });
                }, 3000);
              } catch (error) {
                toast({
                  title: "⚠️ Error",
                  description: "Could not fetch area updates",
                  variant: "destructive",
                });
              }
            },
            () => {
              toast({
                title: "⚠️ Location Required",
                description: "Enable location to get area updates",
                variant: "destructive",
              });
            },
          );
        }
        break;

      case "life_event_search_workflow":
        // Multi-step: Capture life event → Search schemes → Navigate with results
        toast({
          title: "💙 Analyzing Your Situation",
          description: "Finding relevant schemes for your life event...",
          duration: 3000,
        });

        setTimeout(async () => {
          try {
            const { schemesService } = await import("@/lib/schemesService");

            // Use the original transcript as the life event query
            const transcript = description || "life event";
            const results = await schemesService.searchByLifeEvent(transcript);

            if (results.length > 0) {
              const topSchemes = results
                .slice(0, 3)
                .map((r: any) => r.scheme)
                .join(", ");

              // Read results aloud
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(
                  `I found ${results.length} schemes for your situation. Top recommendations are: ${topSchemes}. Opening schemes page with results.`,
                );
                utterance.lang = "en-IN";
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
              }

              toast({
                title: "✅ Schemes Found!",
                description: `${results.length} schemes matched your situation. Top: ${results[0]?.scheme}`,
                duration: 5000,
              });

              // Navigate to schemes page with life event results
              setTimeout(() => {
                navigate("/schemes", {
                  state: {
                    lifeEventQuery: transcript,
                    lifeEventResults: results,
                  },
                });
              }, 2000);
            } else {
              toast({
                title: "⚠️ No Matches",
                description:
                  "Couldn't find specific schemes for this situation. Try describing it differently.",
                variant: "destructive",
              });
            }
          } catch (error) {
            toast({
              title: "⚠️ Error",
              description: "Failed to search for schemes",
              variant: "destructive",
            });
          }
        }, 1000);
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
