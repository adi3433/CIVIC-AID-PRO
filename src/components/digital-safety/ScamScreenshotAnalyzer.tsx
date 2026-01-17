import { useState, useRef } from "react";
import {
    Camera,
    Upload,
    Image as ImageIcon,
    Loader2,
    Brain,
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    analyzeScreenshot,
    ScamAnalysisResult,
    getCategoryDisplayName,
} from "@/lib/scamDetection";

interface ScamScreenshotAnalyzerProps {
    onAnalysisComplete?: (result: ScamAnalysisResult & { extractedText: string }) => void;
}

export function ScamScreenshotAnalyzer({ onAnalysisComplete }: ScamScreenshotAnalyzerProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<(ScamAnalysisResult & { extractedText: string }) | null>(null);
    const [error, setError] = useState("");
    const [analysisStage, setAnalysisStage] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file");
                return;
            }

            setSelectedImage(file);
            setResult(null);
            setError("");

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            setError("Please select an image first");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setAnalysisStage(0);

        try {
            // Simulate OCR stages
            setTimeout(() => setAnalysisStage(1), 500);
            setTimeout(() => setAnalysisStage(2), 1200);
            setTimeout(() => setAnalysisStage(3), 1800);

            const analysis = await analyzeScreenshot(selectedImage);
            setResult(analysis);
            onAnalysisComplete?.(analysis);
        } catch (err) {
            setError("Failed to analyze screenshot. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisStage(0);
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

    const analysisStages = [
        "Preparing image...",
        "Running OCR extraction...",
        "Analyzing extracted text...",
        "Generating risk assessment...",
    ];

    return (
        <Card variant="default" size="sm" className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Camera className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Screenshot Scanner</h3>
                    <p className="text-xs text-muted-foreground">Upload & analyze scam images</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Brain className="w-3 h-3 mr-1" />
                    OCR + AI
                </Badge>
            </div>

            {/* Upload Area */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            {!imagePreview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-muted rounded-full">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Upload Screenshot</p>
                            <p className="text-sm text-muted-foreground">
                                SMS, WhatsApp, or suspicious message screenshot
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Choose Image
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                        <img
                            src={imagePreview}
                            alt="Screenshot preview"
                            className="w-full h-48 object-contain"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                                setResult(null);
                            }}
                        >
                            Change
                        </Button>
                    </div>

                    {/* Analyze Button */}
                    {!result && (
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {analysisStages[analysisStage]}
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4 mr-2" />
                                    Analyze with AI
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Loading State */}
            {isAnalyzing && (
                <div className="space-y-3 py-2">
                    <Progress value={(analysisStage + 1) * 25} className="h-2" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                        {analysisStages.map((stage, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 ${index <= analysisStage ? "text-foreground" : ""
                                    }`}
                            >
                                {index < analysisStage ? (
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : index === analysisStage ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                ) : (
                                    <div className="w-3 h-3 rounded-full border" />
                                )}
                                {stage}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
                <div className="space-y-4 pt-2 border-t">
                    {/* Extracted Text */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">Extracted Text (OCR)</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border">
                            <p className="text-sm text-foreground italic">
                                "{result.extractedText}"
                            </p>
                        </div>
                    </div>

                    {/* Risk Score */}
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
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-700 ${result.riskScore <= 20
                                    ? "bg-gradient-to-r from-green-400 to-green-500"
                                    : result.riskScore <= 60
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                        : "bg-gradient-to-r from-red-400 to-red-600"
                                }`}
                            style={{ width: `${result.riskScore}%` }}
                        />
                    </div>

                    {/* Category */}
                    {result.category !== "unknown" && (
                        <div className="flex items-center gap-2">
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
                        <p className="text-sm text-foreground">{result.explanation}</p>
                    </div>

                    {/* Red Flags */}
                    {result.redFlags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">🚩 Red Flags:</p>
                            <div className="space-y-2">
                                {result.redFlags.slice(0, 4).map((flag, index) => (
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

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">🛡️ Recommendations:</p>
                            <ul className="space-y-1">
                                {result.recommendations.slice(0, 3).map((rec, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Analyze Another */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            setResult(null);
                        }}
                    >
                        Analyze Another Screenshot
                    </Button>
                </div>
            )}
        </Card>
    );
}
