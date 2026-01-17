import { useState } from "react";
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
import { getScamStats } from "@/lib/scamDatabase";

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
    { id: "link-checker", title: "Check Link", description: "Verify suspicious URLs", icon: Link2, color: "bg-blue-500", badge: "AI" },
    { id: "phone-checker", title: "Check Number", description: "Verify unknown callers", icon: Phone, color: "bg-green-500", badge: "AI" },
    { id: "text-analyzer", title: "Check Message", description: "Analyze SMS/WhatsApp", icon: MessageSquare, color: "bg-purple-500", badge: "AI" },
    { id: "screenshot", title: "Scan Screenshot", description: "OCR + scam detection", icon: Camera, color: "bg-indigo-500", badge: "OCR" },
    { id: "qr-scanner", title: "QR Safety", description: "Check QR before scanning", icon: QrCode, color: "bg-cyan-500", badge: "AI" },
    { id: "what-to-do", title: "I Was Scammed", description: "Get recovery steps", icon: LifeBuoy, color: "bg-red-500", badge: "Help" },
];

const educationActions = [
    { id: "red-flags", title: "Learn Red Flags", description: "Spot scams before they happen", icon: BookOpen, color: "bg-purple-500" },
    { id: "database", title: "Scam Database", description: "Browse reported scams", icon: Database, color: "bg-amber-500" },
    { id: "report", title: "Report Scam", description: "Help protect others", icon: Flag, color: "bg-pink-500" },
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
    const stats = getScamStats();

    const renderContent = () => {
        switch (digitalView) {
            case "link-checker":
                return <><BackButton onBack={() => setDigitalView("home")} title="Link Safety Scanner" /><ScamLinkChecker /></>;
            case "phone-checker":
                return <><BackButton onBack={() => setDigitalView("home")} title="Phone Number Checker" /><ScamPhoneChecker /></>;
            case "text-analyzer":
                return <><BackButton onBack={() => setDigitalView("home")} title="Message Analyzer" /><ScamTextAnalyzer /></>;
            case "screenshot":
                return <><BackButton onBack={() => setDigitalView("home")} title="Screenshot Scanner" /><ScamScreenshotAnalyzer /></>;
            case "qr-scanner":
                return <><BackButton onBack={() => setDigitalView("home")} title="QR Code Scanner" /><QRCodeScanner /></>;
            case "what-to-do":
                return <><BackButton onBack={() => setDigitalView("home")} title="Recovery Guide" /><WhatToDoNext /></>;
            case "red-flags":
                return <><BackButton onBack={() => setDigitalView("home")} title="Red Flags Library" /><RedFlagsEducation /></>;
            case "database":
                return <><BackButton onBack={() => setDigitalView("home")} title="Scam Database" /><ScamDatabase /></>;
            case "report":
                return <><BackButton onBack={() => setDigitalView("home")} title="Report a Scam" /><ReportScam /></>;
            default:
                return (
                    <div className="space-y-6">
                        {/* Hero Banner */}
                        <Card className="overflow-hidden border-0 shadow-lg">
                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-bold text-lg">AI-Powered Scam Protection</h2>
                                        <p className="text-sm text-white/80">{stats.totalReports.toLocaleString()}+ scams detected</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        <Brain className="w-3 h-3 mr-1" />Live
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <div className="p-2 bg-white/10 rounded-lg text-center backdrop-blur-sm">
                                        <p className="text-xl font-bold">{stats.verifiedScams.toLocaleString()}</p>
                                        <p className="text-xs text-white/70">Verified</p>
                                    </div>
                                    <div className="p-2 bg-white/10 rounded-lg text-center backdrop-blur-sm">
                                        <p className="text-xl font-bold">₹{(stats.totalMoneySaved / 10000000).toFixed(1)}Cr</p>
                                        <p className="text-xs text-white/70">Saved</p>
                                    </div>
                                    <div className="p-2 bg-white/10 rounded-lg text-center backdrop-blur-sm">
                                        <p className="text-xl font-bold">{stats.activeRegions}</p>
                                        <p className="text-xs text-white/70">States</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* AI Scam Detection Tools */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-foreground">Scam Detection</h3>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    <Brain className="w-3 h-3 mr-1" />AI Powered
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {digitalSafetyActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setDigitalView(action.id as DigitalSafetyView)}
                                        className="p-3 rounded-xl border bg-card hover:shadow-md hover:border-primary/50 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground text-sm">{action.title}</p>
                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">{action.badge}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Education & Community */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-3">Learn & Contribute</h3>
                            <div className="space-y-2">
                                {educationActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setDigitalView(action.id as DigitalSafetyView)}
                                        className="w-full p-3 rounded-xl border bg-card hover:shadow-md hover:border-primary/50 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground text-sm">{action.title}</p>
                                                <p className="text-xs text-muted-foreground">{action.description}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trending Alert */}
                        <Card className="p-3 bg-amber-50 border-amber-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-800">Trending Alert</p>
                                    <p className="text-xs text-amber-700 mt-0.5">UPI refund scams are up 45% this week.</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-amber-700" onClick={() => setDigitalView("database")}>View</Button>
                            </div>
                        </Card>

                        {/* Cybercrime Helpline */}
                        <Card className="p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white/80">Cyber Crime Helpline</p>
                                    <p className="text-2xl font-bold">1930</p>
                                </div>
                                <Button variant="secondary" size="sm"><PhoneCall className="w-4 h-4 mr-1" />Call Now</Button>
                            </div>
                        </Card>
                    </div>
                );
        }
    };

    return <div className="space-y-4">{renderContent()}</div>;
}
