import { useState } from "react";
import {
  LifeBuoy,
  ChevronRight,
  Phone,
  CreditCard,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getGuidanceForScamType,
  PostScamGuidance,
  GuidanceStep,
} from "@/lib/redFlags";

type ScamType =
  | "payment_scam"
  | "phishing"
  | "job_scam"
  | "impersonation"
  | "lottery_scam"
  | "investment_scam";

const scamTypeOptions: {
  value: ScamType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "payment_scam",
    label: "UPI/Payment Fraud",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    value: "phishing",
    label: "Bank/KYC Phishing",
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  {
    value: "job_scam",
    label: "Job/Employment Scam",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "impersonation",
    label: "Police/Authority Call",
    icon: <Phone className="w-4 h-4" />,
  },
  {
    value: "lottery_scam",
    label: "Lottery/Prize Scam",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    value: "investment_scam",
    label: "Investment Fraud",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
];

const timeOptions = [
  { value: "just_now", label: "Just now (within minutes)" },
  { value: "within_hour", label: "Within the last hour" },
  { value: "few_hours", label: "Few hours ago" },
  { value: "yesterday", label: "Yesterday" },
  { value: "few_days", label: "Few days ago" },
];

export function WhatToDoNext() {
  const [scamType, setScamType] = useState<ScamType | null>(null);
  const [timeSince, setTimeSince] = useState("");
  const [amountLost, setAmountLost] = useState("");
  const [showGuidance, setShowGuidance] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);

  const guidance = scamType ? getGuidanceForScamType(scamType) : null;

  const handleGetHelp = () => {
    if (scamType) {
      setShowGuidance(true);
      setCompletedSteps([]);
      setExpandedSteps([1]);
    }
  };

  const toggleStepComplete = (step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step],
    );
  };

  const toggleStepExpand = (step: number) => {
    setExpandedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step],
    );
  };

  const getUrgencyBadge = (urgency: GuidanceStep["urgency"]) => {
    const styles = {
      immediate: "bg-red-100 text-red-800 border-red-300",
      within_1_hour: "bg-orange-100 text-orange-800 border-orange-300",
      within_24_hours: "bg-yellow-100 text-yellow-800 border-yellow-300",
      when_possible: "bg-blue-100 text-blue-800 border-blue-300",
    };
    const labels = {
      immediate: "Do Now",
      within_1_hour: "Within 1 Hour",
      within_24_hours: "Within 24 Hours",
      when_possible: "When Possible",
    };
    return (
      <Badge variant="outline" className={`text-xs ${styles[urgency]}`}>
        <Clock className="w-3 h-3 mr-1" />
        {labels[urgency]}
      </Badge>
    );
  };

  const renderStepCard = (step: GuidanceStep, isCompleted: boolean) => {
    const isExpanded = expandedSteps.includes(step.step);

    return (
      <Card
        key={step.step}
        variant={isCompleted ? "success" : "default"}
        size="sm"
        className={`transition-all ${isCompleted ? "opacity-70" : ""}`}
      >
        <div className="space-y-2">
          {/* Step Header */}
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => toggleStepExpand(step.step)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStepComplete(step.step);
              }}
              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-green-500 border-green-500"
                  : "border-muted-foreground/30 hover:border-primary"
              }`}
            >
              {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
              {!isCompleted && (
                <span className="text-xs font-medium text-muted-foreground">
                  {step.step}
                </span>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {step.title}
                </h4>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {getUrgencyBadge(step.urgency)}
            </div>
          </div>

          {/* Step Details */}
          {isExpanded && (
            <div className="pl-9 space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>

              {step.contactInfo && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {step.contactInfo}
                  </span>
                  <Button variant="ghost" size="sm" className="ml-auto h-7">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <Button
                variant={isCompleted ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={() => toggleStepComplete(step.step)}
              >
                {isCompleted ? "Mark Incomplete" : step.action}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card variant="destructive" size="default">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-destructive-foreground/20 rounded-xl">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">I've Been Scammed</h2>
            <p className="text-sm text-destructive-foreground/80">
              Get step-by-step recovery guidance
            </p>
          </div>
        </div>
      </Card>

      {!showGuidance ? (
        <div className="space-y-4">
          {/* Scam Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What type of scam occurred?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {scamTypeOptions.map((option) => (
                <Card
                  key={option.value}
                  variant={scamType === option.value ? "elevated" : "default"}
                  size="sm"
                  onClick={() => setScamType(option.value)}
                  className={`cursor-pointer transition-all ${
                    scamType === option.value ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        scamType === option.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {option.icon}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        scamType === option.value
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              When did this happen?
            </label>
            <Select value={timeSince} onValueChange={setTimeSince}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Lost */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Amount lost (if any)
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-muted rounded-l-lg border border-r-0 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="0"
                value={amountLost}
                onChange={(e) => setAmountLost(e.target.value)}
                className="rounded-l-none"
              />
            </div>
          </div>

          {/* Get Help Button */}
          <Button
            onClick={handleGetHelp}
            disabled={!scamType}
            className="w-full"
            size="lg"
          >
            Get Recovery Steps
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Quick Info */}
          <Card variant="elevated" size="sm" className="bg-primary/5">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Don't panic!</strong> Many
              scams can be recovered if you act quickly. We'll guide you through
              exactly what to do.
            </p>
          </Card>
        </div>
      ) : guidance ? (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Recovery Progress
            </span>
            <span className="text-sm font-medium text-primary">
              {completedSteps.length} /{" "}
              {guidance.immediateSteps.length + guidance.followUpSteps.length}{" "}
              steps
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${(completedSteps.length / (guidance.immediateSteps.length + guidance.followUpSteps.length)) * 100}%`,
              }}
            />
          </div>

          {/* Immediate Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-red-500">🚨</span>
              Immediate Actions
            </h3>
            {guidance.immediateSteps.map((step) =>
              renderStepCard(step, completedSteps.includes(step.step)),
            )}
          </div>

          {/* Follow-up Steps */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span>📋</span>
              Follow-up Steps
            </h3>
            {guidance.followUpSteps.map((step) =>
              renderStepCard(step, completedSteps.includes(step.step)),
            )}
          </div>

          {/* Helpline Numbers */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-foreground">
              📞 Emergency Helplines
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {guidance.helplineNumbers.map((helpline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {helpline.name}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {helpline.number}
                    </p>
                  </div>
                  <Button variant="default" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Prevention Tips */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-foreground">
              🛡️ Prevent Future Scams
            </h3>
            <ul className="space-y-2">
              {guidance.preventionTips.map((tip, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Start Over */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setShowGuidance(false);
              setScamType(null);
              setTimeSince("");
              setAmountLost("");
            }}
          >
            Report Different Scam
          </Button>
        </div>
      ) : null}
    </div>
  );
}
