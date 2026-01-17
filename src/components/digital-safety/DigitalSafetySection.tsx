import { useState, useEffect } from "react";
import {
  Phone,
  Shield,
  ChevronRight,
  Link2,
  MessageSquare,
  Camera,
  QrCode,
  LifeBuoy,
  BookOpen,
  Database,
  Flag,
  Brain,
  TrendingUp,
  PhoneCall,
  ChevronDown,
  Sparkles,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Digital Safety Components
import { ScamLinkChecker } from "./ScamLinkChecker";
import { ScamPhoneChecker } from "./ScamPhoneChecker";
import { ScamTextAnalyzer } from "./ScamTextAnalyzer";
import { ScamScreenshotAnalyzer } from "./ScamScreenshotAnalyzer";
import { QRCodeScanner } from "./QRCodeScanner";
import { WhatToDoNext } from "./WhatToDoNext";
import { RedFlagsEducation } from "./RedFlagsEducation";
import { ScamDatabase } from "./ScamDatabase";
import { ReportScam } from "./ReportScam";
import { initializeAI, getAIStatus } from "@/lib/aiConfig";

type DigitalSafetyView =
  | "home"
  | "link-checker"
  | "phone-checker"
  | "text-analyzer"
  | "screenshot"
  | "qr-scanner"
  | "what-to-do"
  | "red-flags"
  | "database"
  | "report";

const digitalSafetyActions = [
  {
    id: "link-checker",
    title: "Check Link",
    description: "Verify suspicious URLs",
    icon: Link2,
    color: "bg-blue-500",
  },
  {
    id: "phone-checker",
    title: "Check Number",
    description: "Verify unknown callers",
    icon: Phone,
    color: "bg-green-500",
  },
  {
    id: "text-analyzer",
    title: "Check Message",
    description: "Analyze SMS/WhatsApp",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    id: "screenshot",
    title: "Scan Screenshot",
    description: "OCR + scam detection",
    icon: Camera,
    color: "bg-indigo-500",
  },
  {
    id: "qr-scanner",
    title: "QR Safety",
    description: "Check QR before scanning",
    icon: QrCode,
    color: "bg-cyan-500",
  },
  {
    id: "what-to-do",
    title: "I Was Scammed",
    description: "Get recovery steps",
    icon: LifeBuoy,
    color: "bg-red-500",
  },
];

const educationActions = [
  {
    id: "red-flags",
    title: "Learn Red Flags",
    description: "Spot scams before they happen",
    icon: BookOpen,
    color: "bg-purple-500",
  },
  {
    id: "database",
    title: "Scam Database",
    description: "Browse reported scams",
    icon: Database,
    color: "bg-amber-500",
  },
  {
    id: "report",
    title: "Report Scam",
    description: "Help protect others",
    icon: Flag,
    color: "bg-pink-500",
  },
];

function BackButton({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
        <ChevronDown className="w-4 h-4 rotate-90" />
        Back
      </Button>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  );
}

export function DigitalSafetySection() {
  const [digitalView, setDigitalView] = useState<DigitalSafetyView>("home");
  const [aiStatus, setAiStatus] = useState(getAIStatus());

  // Initialize AI on component mount
  useEffect(() => {
    initializeAI();
    setAiStatus(getAIStatus());
  }, []);

  const renderContent = () => {
    switch (digitalView) {
      case "link-checker":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Link Safety Scanner"
            />
            <ScamLinkChecker />
          </>
        );
      case "phone-checker":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Phone Number Checker"
            />
            <ScamPhoneChecker />
          </>
        );
      case "text-analyzer":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Message Analyzer"
            />
            <ScamTextAnalyzer />
          </>
        );
      case "screenshot":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Screenshot Scanner"
            />
            <ScamScreenshotAnalyzer />
          </>
        );
      case "qr-scanner":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="QR Code Scanner"
            />
            <QRCodeScanner />
          </>
        );
      case "what-to-do":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Recovery Guide"
            />
            <WhatToDoNext />
          </>
        );
      case "red-flags":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Red Flags Library"
            />
            <RedFlagsEducation />
          </>
        );
      case "database":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Scam Database"
            />
            <ScamDatabase />
          </>
        );
      case "report":
        return (
          <>
            <BackButton
              onBack={() => setDigitalView("home")}
              title="Report a Scam"
            />
            <ReportScam />
          </>
        );
      default:
        return (
          <div className="space-y-6 pt-2">
            {/* Cybercrime Helpline - Promoted to Top */}
            <Card className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/90">
                    Cyber Crime Helpline
                  </p>
                  <p className="text-3xl font-bold mt-0.5">1930</p>
                  <p className="text-xs text-white/80 mt-1">
                    Available 24/7 • Toll Free
                  </p>
                </div>
                <Button className="bg-white text-red-600 hover:bg-white/90 font-semibold h-11 px-6 rounded-full shadow-lg">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>

            {/* AI Scam Detection Tools - Expanded Grid */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 px-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Detection Tools
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {digitalSafetyActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() =>
                      setDigitalView(action.id as DigitalSafetyView)
                    }
                    className="p-4 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all text-left group flex flex-col items-start gap-4 h-full"
                  >
                    <div
                      className={`p-3 rounded-xl ${action.color} bg-opacity-20 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="font-semibold text-foreground text-base mb-1">
                        {action.title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {action.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Education & Community */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 px-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Knowledge Base
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {educationActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() =>
                      setDigitalView(action.id as DigitalSafetyView)
                    }
                    className="w-full p-4 rounded-2xl border bg-card hover:shadow-md hover:border-primary/50 transition-all text-left flex items-center gap-4"
                  >
                    <div
                      className={`p-2.5 rounded-xl ${action.color} bg-opacity-20`}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {action.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return <div className="space-y-4">{renderContent()}</div>;
}
