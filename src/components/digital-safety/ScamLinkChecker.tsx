import { useState } from "react";
import {
    Shield,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Loader2,
    Copy,
    ExternalLink,
    Brain,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    analyzeURL,
    ScamAnalysisResult,
    getRiskColor,
    getCategoryDisplayName,
} from "@/lib/scamDetection";

interface ScamLinkCheckerProps {
    onAnalysisComplete?: (result: ScamAnalysisResult) => void;
}

export function ScamLinkChecker({ onAnalysisComplete }: ScamLinkCheckerProps) {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ScamAnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError("Please enter a URL to analyze");
            return;
        }

        // Basic URL validation
        if (!url.includes(".") || url.length < 5) {
            setError("Please enter a valid URL");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setResult(null);

        try {
            const analysis = await analyzeURL(url);
            setResult(analysis);
            onAnalysisComplete?.(analysis);
        } catch (err) {
            setError("Failed to analyze URL. Please try again.");
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
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Link Safety Scanner</h3>
                    <p className="text-xs text-muted-foreground">AI-powered URL analysis</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Verified
                </Badge>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <Input
                    type="url"
                    placeholder="Paste suspicious URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                    disabled={isAnalyzing}
                    data-agent-id="url-check-input"
                />
                <Button
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !url.trim()}
                    data-agent-id="url-check-btn"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Scanning
                        </>
                    ) : (
                        "Scan"
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
                            AI analyzing URL patterns...
                        </span>
                    </div>
                    <Progress value={66} className="h-2" />
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>✓ Checking domain reputation</span>
                        <span>✓ Analyzing URL structure</span>
                        <span className="animate-pulse">⏳ Comparing with scam database</span>
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Safe</span>
                            <span>Suspicious</span>
                            <span>Dangerous</span>
                        </div>
                    </div>

                    {/* Category */}
                    {result.category !== "unknown" && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Detected type: </span>
                            <span className="font-medium text-foreground">
                                {getCategoryDisplayName(result.category)}
                            </span>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground">{result.explanation}</p>
                    </div>

                    {/* Red Flags */}
                    {result.redFlags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                🚩 Red Flags Detected:
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

                    {/* Similar Scams */}
                    {result.similarScamsCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            <span>
                                This pattern matches{" "}
                                <span className="font-medium text-foreground">
                                    {result.similarScamsCount}
                                </span>{" "}
                                reported scams
                            </span>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                📋 Recommendations:
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

                    {/* Analysis ID */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Analysis ID: {result.analysisId}</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Report
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
