import { useState } from "react";
import {
    MessageSquare,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Loader2,
    Brain,
    Copy,
    Flag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    analyzeText,
    ScamAnalysisResult,
    getCategoryDisplayName,
} from "@/lib/scamDetection";

interface ScamTextAnalyzerProps {
    onAnalysisComplete?: (result: ScamAnalysisResult) => void;
}

export function ScamTextAnalyzer({ onAnalysisComplete }: ScamTextAnalyzerProps) {
    const [text, setText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ScamAnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!text.trim() || text.trim().length < 10) {
            setError("Please enter a message with at least 10 characters");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setResult(null);

        try {
            const analysis = await analyzeText(text);
            setResult(analysis);
            onAnalysisComplete?.(analysis);
        } catch (err) {
            setError("Failed to analyze message. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(clipboardText);
        } catch (err) {
            setError("Unable to access clipboard");
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

    const highlightRedFlags = (text: string) => {
        if (!result) return text;

        let highlightedText = text;
        result.redFlags.forEach((flag) => {
            if (flag.matchedPattern) {
                const regex = new RegExp(`(${flag.matchedPattern})`, "gi");
                highlightedText = highlightedText.replace(
                    regex,
                    `<mark class="bg-red-200 px-1 rounded">$1</mark>`
                );
            }
        });
        return highlightedText;
    };

    return (
        <Card variant="default" size="sm" className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Message Analyzer</h3>
                    <p className="text-xs text-muted-foreground">Check SMS/WhatsApp messages</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Powered
                </Badge>
            </div>

            {/* Input */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-muted-foreground">
                        Paste the suspicious message:
                    </label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePaste}
                        className="h-7 text-xs"
                    >
                        <Copy className="w-3 h-3 mr-1" />
                        Paste
                    </Button>
                </div>
                <Textarea
                    placeholder="Paste the SMS or WhatsApp message you want to check..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-24 resize-none"
                    disabled={isAnalyzing}
                />
                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text.trim()}
                    className="w-full"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4 mr-2" />
                            Analyze Message
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="space-y-3 py-2">
                    <Progress value={70} className="h-2" />
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>✓ Running NLP analysis</span>
                        <span>✓ Checking urgency patterns</span>
                        <span className="animate-pulse">⏳ Detecting scam keywords</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
                <div className="space-y-4 pt-2 border-t">
                    {/* Risk Score Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getRiskIcon()}
                            <div>
                                <p className="font-medium text-foreground">
                                    Scam Probability: {result.riskScore}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    AI Confidence: {result.confidence}%
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className={getRiskBadge()}>
                            {result.riskLevel.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Risk Meter */}
                    <div className="space-y-1">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                            <div
                                className={`h-full transition-all duration-700 ${result.riskScore <= 20
                                        ? "bg-gradient-to-r from-green-400 to-green-500"
                                        : result.riskScore <= 40
                                            ? "bg-gradient-to-r from-green-400 to-yellow-400"
                                            : result.riskScore <= 60
                                                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                                : result.riskScore <= 80
                                                    ? "bg-gradient-to-r from-orange-400 to-red-400"
                                                    : "bg-gradient-to-r from-red-400 to-red-600"
                                    }`}
                                style={{ width: `${result.riskScore}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                {result.riskScore}%
                            </span>
                        </div>
                    </div>

                    {/* Detected Category */}
                    {result.category !== "unknown" && (
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                            <Flag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Detected type:</span>
                            <Badge variant="secondary">
                                {getCategoryDisplayName(result.category)}
                            </Badge>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className={`p-3 rounded-lg border ${result.riskScore > 60
                            ? "bg-red-50 border-red-200"
                            : result.riskScore > 30
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-green-50 border-green-200"
                        }`}>
                        <p className="text-sm text-foreground font-medium">
                            {result.explanation}
                        </p>
                    </div>

                    {/* Red Flags with highlighting */}
                    {result.redFlags.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                🚩 Suspicious Patterns Detected
                            </p>

                            {/* Original message with highlights */}
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <p className="text-xs text-muted-foreground mb-1">Your message:</p>
                                <p
                                    className="text-sm text-foreground"
                                    dangerouslySetInnerHTML={{ __html: highlightRedFlags(text) }}
                                />
                            </div>

                            {/* Red flag explanations */}
                            <div className="space-y-2">
                                {result.redFlags.map((flag, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg text-sm flex items-start gap-2 ${flag.severity === "high"
                                                ? "bg-red-50 border border-red-200"
                                                : flag.severity === "medium"
                                                    ? "bg-yellow-50 border border-yellow-200"
                                                    : "bg-blue-50 border border-blue-200"
                                            }`}
                                    >
                                        <span>
                                            {flag.severity === "high" ? "🔴" : flag.severity === "medium" ? "🟡" : "🔵"}
                                        </span>
                                        <div>
                                            <p className={`font-medium ${flag.severity === "high"
                                                    ? "text-red-800"
                                                    : flag.severity === "medium"
                                                        ? "text-yellow-800"
                                                        : "text-blue-800"
                                                }`}>
                                                {flag.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </p>
                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                {flag.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Similar Scams */}
                    {result.similarScamsCount > 0 && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg border border-orange-200">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-800">
                                Similar to <strong>{result.similarScamsCount}</strong> reported scams
                            </span>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">
                                🛡️ What You Should Do:
                            </p>
                            <ul className="space-y-1">
                                {result.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-green-600 font-bold">{index + 1}.</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Analysis ID */}
                    <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
                        <span>Analysis ID: {result.analysisId}</span>
                        <Badge variant="outline" className="text-xs">
                            {result.aiVerified ? "✓ AI Verified" : "Pending"}
                        </Badge>
                    </div>
                </div>
            )}
        </Card>
    );
}
