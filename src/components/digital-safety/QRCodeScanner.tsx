import { useState, useRef } from "react";
import {
    QrCode,
    Camera,
    Upload,
    Loader2,
    Brain,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    analyzeQRCode,
    ScamAnalysisResult,
    getCategoryDisplayName,
} from "@/lib/scamDetection";

interface QRCodeScannerProps {
    onAnalysisComplete?: (result: ScamAnalysisResult & { extractedURL: string }) => void;
}

export function QRCodeScanner({ onAnalysisComplete }: QRCodeScannerProps) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<(ScamAnalysisResult & { extractedURL: string }) | null>(null);
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
            setError("Please select a QR code image first");
            return;
        }

        setError("");
        setIsAnalyzing(true);
        setAnalysisStage(0);

        try {
            // Simulate QR decoding stages
            setTimeout(() => setAnalysisStage(1), 400);
            setTimeout(() => setAnalysisStage(2), 900);

            const analysis = await analyzeQRCode(selectedImage);
            setResult(analysis);
            onAnalysisComplete?.(analysis);
        } catch (err) {
            setError("Failed to analyze QR code. Please try again.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisStage(0);
        }
    };

    const getRiskIcon = () => {
        if (!result) return null;
        if (result.riskScore <= 20) return <CheckCircle className="w-8 h-8 text-green-500" />;
        if (result.riskScore <= 60) return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
        return <XCircle className="w-8 h-8 text-red-500" />;
    };

    const getVerdictColor = () => {
        if (!result) return "";
        if (result.riskScore <= 20) return "bg-green-500";
        if (result.riskScore <= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getVerdictText = () => {
        if (!result) return "";
        if (result.riskScore <= 20) return "SAFE TO SCAN";
        if (result.riskScore <= 60) return "USE CAUTION";
        return "DO NOT SCAN";
    };

    const analysisStages = [
        "Detecting QR code...",
        "Extracting URL...",
        "Analyzing destination...",
    ];

    return (
        <Card variant="default" size="sm" className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-100 rounded-lg">
                    <QrCode className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">QR Code Scanner</h3>
                    <p className="text-xs text-muted-foreground">Check QR codes before scanning</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-cyan-50 text-cyan-700 border-cyan-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Safe Scan
                </Badge>
            </div>

            {/* Safety Warning */}
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                    <strong>Tip:</strong> Never scan QR codes to RECEIVE money. Scammers use this trick!
                </p>
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
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-cyan-50 rounded-full">
                            <QrCode className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Upload QR Code</p>
                            <p className="text-sm text-muted-foreground">
                                Photo or screenshot of QR code
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="relative rounded-lg overflow-hidden border bg-muted/30 p-4">
                        <img
                            src={imagePreview}
                            alt="QR code preview"
                            className="w-32 h-32 object-contain mx-auto"
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
                                    Analyze QR Code
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
                    <Progress value={(analysisStage + 1) * 33} className="h-2" />
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
                    {/* Big Verdict */}
                    <div className={`p-4 rounded-xl text-center text-white ${getVerdictColor()}`}>
                        <div className="flex items-center justify-center gap-3">
                            {getRiskIcon()}
                            <span className="text-xl font-bold">{getVerdictText()}</span>
                        </div>
                    </div>

                    {/* Extracted URL */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">QR Redirects To:</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border break-all">
                            <code className="text-sm text-foreground">
                                {result.extractedURL}
                            </code>
                        </div>
                    </div>

                    {/* Risk Score */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm text-muted-foreground">Risk Score</span>
                        <span className={`text-lg font-bold ${result.riskScore <= 20
                                ? "text-green-600"
                                : result.riskScore <= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                            }`}>
                            {result.riskScore}%
                        </span>
                    </div>

                    {/* Risk Meter */}
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-700 ${result.riskScore <= 20
                                    ? "bg-green-500"
                                    : result.riskScore <= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }`}
                            style={{ width: `${result.riskScore}%` }}
                        />
                    </div>

                    {/* Category */}
                    {result.category !== "unknown" && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Threat type:</span>
                            <Badge variant="destructive">
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
                    {result.redFlags.filter(f => f.type !== "qr_code_redirect").length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">⚠️ Warnings:</p>
                            <div className="space-y-2">
                                {result.redFlags.filter(f => f.type !== "qr_code_redirect").slice(0, 3).map((flag, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg text-sm border ${flag.severity === "high"
                                                ? "bg-red-50 border-red-200 text-red-800"
                                                : "bg-yellow-50 border-yellow-200 text-yellow-800"
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
                            <p className="text-sm font-medium text-foreground">💡 What to do:</p>
                            <ul className="space-y-1">
                                {result.recommendations.slice(0, 3).map((rec, index) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Scan Another */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            setResult(null);
                        }}
                    >
                        Scan Another QR Code
                    </Button>
                </div>
            )}
        </Card>
    );
}
