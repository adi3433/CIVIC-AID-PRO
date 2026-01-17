import { useState } from "react";
import {
    Flag,
    Send,
    Upload,
    CheckCircle,
    MessageSquare,
    Phone,
    Link,
    QrCode,
    Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { reportNewScam, ReportedScam } from "@/lib/scamDatabase";
import { ScamCategory } from "@/lib/scamDetection";

type Channel = "sms" | "whatsapp" | "email" | "call" | "website" | "qr_code";

const channelOptions: { value: Channel; label: string; icon: React.ReactNode }[] = [
    { value: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
    { value: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" /> },
    { value: "call", label: "Phone Call", icon: <Phone className="w-4 h-4" /> },
    { value: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
    { value: "website", label: "Website", icon: <Link className="w-4 h-4" /> },
    { value: "qr_code", label: "QR Code", icon: <QrCode className="w-4 h-4" /> },
];

const scamTypeOptions: { value: ScamCategory; label: string }[] = [
    { value: "phishing", label: "Bank/KYC Phishing" },
    { value: "payment_scam", label: "UPI/Payment Fraud" },
    { value: "job_scam", label: "Job Scam" },
    { value: "lottery_scam", label: "Lottery/Prize Scam" },
    { value: "fake_govt_scheme", label: "Fake Govt Scheme" },
    { value: "loan_scam", label: "Loan Scam" },
    { value: "impersonation", label: "Impersonation" },
    { value: "investment_scam", label: "Investment Fraud" },
];

export function ReportScam() {
    const [channel, setChannel] = useState<Channel | null>(null);
    const [scamType, setScamType] = useState<ScamCategory | null>(null);
    const [content, setContent] = useState("");
    const [region, setRegion] = useState("");
    const [amountLost, setAmountLost] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedScam, setSubmittedScam] = useState<ReportedScam | null>(null);

    const handleSubmit = async () => {
        if (!channel || !scamType || !content.trim()) return;

        setIsSubmitting(true);

        // Simulate submission delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newScam = reportNewScam({
            type: scamType,
            content: content.trim(),
            reportedBy: "Anonymous",
            region: region || "Unknown",
            channel,
            amountLost: amountLost ? parseInt(amountLost) : undefined,
        });

        setSubmittedScam(newScam);
        setSubmitted(true);
        setIsSubmitting(false);
    };

    const resetForm = () => {
        setChannel(null);
        setScamType(null);
        setContent("");
        setRegion("");
        setAmountLost("");
        setSubmitted(false);
        setSubmittedScam(null);
    };

    if (submitted && submittedScam) {
        return (
            <Card variant="default" className="overflow-hidden">
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Thank You!</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your report has been submitted successfully
                        </p>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg text-left">
                        <p className="text-xs text-muted-foreground">Report ID</p>
                        <p className="font-mono font-medium text-foreground">{submittedScam.id}</p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p>
                            <strong>What happens next?</strong>
                            <br />
                            Our community will verify your report. Once verified, it will help protect others from this scam.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={resetForm}>
                            Report Another
                        </Button>
                        <Button className="flex-1">
                            View Database
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="default" className="overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Flag className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Report a Scam</h2>
                        <p className="text-sm text-white/80">Help protect our community</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Channel Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        How did you receive this scam?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {channelOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setChannel(option.value)}
                                className={`p-2 rounded-lg border text-center transition-all ${channel === option.value
                                        ? "border-primary bg-primary/10"
                                        : "border-muted hover:border-primary/50"
                                    }`}
                            >
                                <div className={`mx-auto mb-1 ${channel === option.value ? "text-primary" : "text-muted-foreground"}`}>
                                    {option.icon}
                                </div>
                                <span className={`text-xs font-medium ${channel === option.value ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scam Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Type of scam
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {scamTypeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setScamType(option.value)}
                                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${scamType === option.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted hover:border-primary/50 text-muted-foreground"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scam Content */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Scam message/content
                    </label>
                    <Textarea
                        placeholder="Paste the scam message, describe the call, or share the URL..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-24"
                    />
                    <p className="text-xs text-muted-foreground">
                        This will be shared publicly to warn others (your identity stays anonymous)
                    </p>
                </div>

                {/* Region */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Your region/city (optional)
                    </label>
                    <Input
                        placeholder="e.g., Mumbai, Delhi, Bangalore"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    />
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

                {/* Submit */}
                <Button
                    onClick={handleSubmit}
                    disabled={!channel || !scamType || !content.trim() || isSubmitting}
                    className="w-full"
                    size="lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Report
                        </>
                    )}
                </Button>

                {/* Privacy Note */}
                <p className="text-xs text-muted-foreground text-center">
                    🔒 Your identity is kept anonymous. Only the scam details are shared.
                </p>
            </div>
        </Card>
    );
}
