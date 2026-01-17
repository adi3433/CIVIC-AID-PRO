import { useState } from "react";
import {
    Phone,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Loader2,
    Shield,
    Brain,
    PhoneOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    analyzePhoneNumber,
    ScamAnalysisResult,
} from "@/lib/scamDetection";

interface ScamPhoneCheckerProps {
    onAnalysisComplete?: (result: ScamAnalysisResult) => void;
}

export function ScamPhoneChecker({ onAnalysisComplete }: ScamPhoneCheckerProps) {
    const [phone, setPhone] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ScamAnalysisResult | null>(null);
    const [error, setError] = useState("");

    const formatPhoneNumber = (value: string) => {
        // Remove non-numeric characters except +
        const cleaned = value.replace(/[^\d+]/g, "");
        return cleaned;
    };

    const handleAnalyze = async () => {
        const cleanPhone = formatPhoneNumber(phone);

        if (!cleanPhone || cleanPhone.length < 10) {
            setError("Please enter a valid phone number (at least 10 digits)");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setResult(null);

        try {
            const analysis = await analyzePhoneNumber(cleanPhone);
            setResult(analysis);
            onAnalysisComplete?.(analysis);
        } catch (err) {
            setError("Failed to analyze phone number. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRiskIcon = () => {
        if (!result) return null;
        if (result.riskScore <= 20) return <CheckCircle className="w-6 h-6 text-green-500" />;
        if (result.riskScore <= 60) return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
        return <XCircle className="w-6 h-6 text-red-500" />;
    };

    const getRiskBadge = () => {
        if (!result) return null;
        const level = result.riskLevel;
        const colors = {
            safe: "bg-green-100 text-green-800 border-green-300",
            low: "bg-green-50 text-green-700 border-green-200",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            high: "bg-orange-100 text-orange-800 border-orange-300",
            critical: "bg-red-100 text-red-800 border-red-300",
        };
        return colors[level];
    };

    return (
        <Card variant="default" size="sm" className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-secondary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Phone Number Checker</h3>
                    <p className="text-xs text-muted-foreground">Verify unknown callers</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Verified
                </Badge>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <Input
                    type="tel"
                    placeholder="Enter phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1"
                    disabled={isAnalyzing}
                />
                <Button
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !phone.trim()}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Checking
                        </>
                    ) : (
                        "Check"
                    )}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="space-y-3 py-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                            Searching scam databases...
                        </span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>✓ Checking telemarketing prefix</span>
                        <span className="animate-pulse">⏳ Searching community reports</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
                <div className="space-y-4 pt-2 border-t">
                    {/* Risk Score */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getRiskIcon()}
                            <div>
                                <p className="font-medium text-foreground">
                                    Risk Score: {result.riskScore}/100
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Confidence: {result.confidence}%
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className={getRiskBadge()}>
                            {result.riskLevel.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Risk Meter */}
                    <div className="space-y-1">
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${result.riskScore <= 20
                                        ? "bg-green-500"
                                        : result.riskScore <= 40
                                            ? "bg-green-400"
                                            : result.riskScore <= 60
                                                ? "bg-yellow-500"
                                                : result.riskScore <= 80
                                                    ? "bg-orange-500"
                                                    : "bg-red-500"
                                    }`}
                                style={{ width: `${result.riskScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground">{result.explanation}</p>
                    </div>

                    {/* Red Flags */}
                    {result.redFlags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                ⚠️ Warnings:
                            </p>
                            <div className="space-y-2">
                                {result.redFlags.map((flag, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg text-sm border ${flag.severity === "high"
                                                ? "bg-red-50 border-red-200 text-red-800"
                                                : flag.severity === "medium"
                                                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                                                    : "bg-blue-50 border-blue-200 text-blue-800"
                                            }`}
                                    >
                                        {flag.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Community Reports */}
                    {result.similarScamsCount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <Shield className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-800">
                                Reported by{" "}
                                <span className="font-bold">{result.similarScamsCount}</span>{" "}
                                users in our community
                            </span>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                💡 Safety Tips:
                            </p>
                            <ul className="space-y-1">
                                {result.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {result.riskScore > 40 && (
                        <div className="flex gap-2 pt-2">
                            <Button variant="destructive" size="sm" className="flex-1">
                                <PhoneOff className="w-4 h-4 mr-1" />
                                Block Number
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                Report Spam
                            </Button>
                        </div>
                    )}

                    {/* Analysis ID */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        Analysis ID: {result.analysisId}
                    </div>
                </div>
            )}
        </Card>
    );
}
