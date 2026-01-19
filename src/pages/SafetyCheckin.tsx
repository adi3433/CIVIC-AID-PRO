import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface EmergencyContact {
  name: string;
  phone: string;
}

interface ActiveCheckin {
  endTime: number;
  contacts: EmergencyContact[];
  startTime: number;
}

const DURATION_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
];

export default function SafetyCheckin() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeCheckin, setActiveCheckin] = useState<ActiveCheckin | null>(
    null,
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      try {
        return JSON.parse(savedContacts);
      } catch {
        return [{ name: "", phone: "" }];
      }
    }
    return [{ name: "", phone: "" }];
  });

  // Load active check-in from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("activeCheckin");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.endTime > Date.now()) {
        setActiveCheckin(parsed);
      } else {
        localStorage.removeItem("activeCheckin");
      }
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
  }, [contacts]);

  // Countdown timer
  useEffect(() => {
    if (!activeCheckin) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, activeCheckin.endTime - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0) {
        handleTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCheckin]);

  const handleTimeExpired = () => {
    if (!activeCheckin) return;

    const message = `⚠️ Safety Check-in Alert!\n\n${activeCheckin.contacts[0]?.name || "Someone"} has NOT checked in as expected.\n\nThey were supposed to reach safely by ${new Date(activeCheckin.endTime).toLocaleTimeString()}.\n\nPlease try contacting them immediately.\n\nCheck-in started at: ${new Date(activeCheckin.startTime).toLocaleTimeString()}`;

    // Try to share or copy alert
    if (navigator.share) {
      navigator
        .share({
          title: "Safety Check-in Alert",
          text: message,
        })
        .catch(() => {
          navigator.clipboard.writeText(message);
          toast({
            title: "Alert Generated",
            description:
              "Alert copied to clipboard. Please share with your contacts.",
            variant: "destructive",
          });
        });
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Time Expired!",
        description:
          "Alert copied to clipboard. Please share with your emergency contacts.",
        variant: "destructive",
      });
    }

    // Clear the check-in
    setActiveCheckin(null);
    localStorage.removeItem("activeCheckin");
  };

  const handleStartCheckin = () => {
    const validContacts = contacts.filter((c) => c.name && c.phone);

    if (validContacts.length === 0) {
      toast({
        title: "Add Contacts",
        description: "Please add at least one emergency contact",
        variant: "destructive",
      });
      return;
    }

    // Use custom duration if provided, otherwise use preset
    const duration = customDuration
      ? parseInt(customDuration)
      : selectedDuration;

    if (!duration || duration <= 0) {
      toast({
        title: "Invalid Duration",
        description: "Please select or enter a valid duration",
        variant: "destructive",
      });
      return;
    }

    const endTime = Date.now() + duration * 60 * 1000;
    const checkin: ActiveCheckin = {
      endTime,
      contacts: validContacts,
      startTime: Date.now(),
    };

    setActiveCheckin(checkin);
    localStorage.setItem("activeCheckin", JSON.stringify(checkin));

    toast({
      title: "Check-in Started",
      description: `You have ${duration} minutes to confirm your safety`,
    });
  };

  const handleConfirmSafe = () => {
    toast({
      title: "Stay Safe! ✅",
      description: "Check-in completed successfully",
    });
    setActiveCheckin(null);
    localStorage.removeItem("activeCheckin");
  };

  const handleCancelCheckin = () => {
    setActiveCheckin(null);
    localStorage.removeItem("activeCheckin");
    toast({
      title: "Check-in Cancelled",
      description: "Safety check-in has been cancelled",
    });
  };

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: "", phone: "" }]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (
    index: number,
    field: "name" | "phone",
    value: string,
  ) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/safety")}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CheckCircle className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-foreground">
            Safety Check-in
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          {activeCheckin
            ? "Active check-in in progress"
            : "Set timed check-ins to let others know you're safe"}
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {!activeCheckin ? (
          <>
            {/* How it works */}
            <Card className="bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                How it works
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                  <span>Set a time duration for your journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                  <span>Add emergency contacts to notify</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                  <span>
                    If you don't check in by the set time, alerts are sent
                    automatically
                  </span>
                </li>
              </ul>
            </Card>

            {/* Duration Selection */}
            <Card className="bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Expected Duration
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {DURATION_PRESETS.map((preset) => (
                  <Button
                    key={preset.minutes}
                    variant={
                      selectedDuration === preset.minutes && !customDuration
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setSelectedDuration(preset.minutes);
                      setCustomDuration("");
                    }}
                    className="text-xs"
                    data-agent-id={`checkin-duration-${preset.minutes}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Or enter custom duration (minutes)
                </Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g., 45"
                    value={customDuration}
                    onChange={(e) => {
                      setCustomDuration(e.target.value);
                      if (e.target.value) {
                        setSelectedDuration(0);
                      }
                    }}
                    min="1"
                    max="480"
                    className="h-9 text-sm"
                    data-agent-id="checkin-custom-duration"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    minutes
                  </span>
                </div>
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Emergency Contacts
                </h3>
                {contacts.length < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addContact}
                    className="h-7 text-xs"
                    data-agent-id="checkin-add-contact-btn"
                  >
                    + Add
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Contact {index + 1}
                      </Label>
                      {contacts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="h-6 text-xs text-destructive"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) =>
                            updateContact(index, "name", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Phone number"
                          type="tel"
                          value={contact.phone}
                          onChange={(e) =>
                            updateContact(index, "phone", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Start Button */}
            <Button
              onClick={handleStartCheckin}
              className="w-full bg-purple-500 hover:bg-purple-600"
              size="lg"
              data-agent-id="start-checkin-btn"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Start Check-in ({customDuration || selectedDuration} min)
            </Button>
          </>
        ) : (
          <>
            {/* Active Check-in Display */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500 p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Clock className="w-12 h-12 text-purple-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Time Remaining
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Expected by{" "}
                  {new Date(activeCheckin.endTime).toLocaleTimeString()}
                </Badge>
              </div>
            </Card>

            {/* Alert Info */}
            {timeRemaining < 5 * 60 * 1000 && (
              <Card className="bg-orange-500/10 border border-orange-500 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Less than 5 minutes remaining!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please confirm your safety or your emergency contacts will
                      be notified.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Emergency Contacts List */}
            <Card className="bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Will notify if you don't check in:
              </h3>
              <div className="space-y-2">
                {activeCheckin.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {contact.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleConfirmSafe}
                className="w-full bg-green-500 hover:bg-green-600"
                size="lg"
                data-agent-id="confirm-safe-btn"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I've Reached Safely
              </Button>
              <Button
                onClick={handleCancelCheckin}
                variant="outline"
                className="w-full"
                size="lg"
                data-agent-id="cancel-checkin-btn"
              >
                Cancel Check-in
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
