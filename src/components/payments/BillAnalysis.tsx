
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, FileText, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Bill, Utility, paymentsService } from "@/lib/paymentsService";
import { analyzeBillWithAI, AIBillAnalysis, predictBillWithAI, AIPrediction } from "@/lib/geminiService";

interface BillAnalysisProps {
    bill: Bill;
    utility: Utility;
    trigger?: React.ReactNode;
}

export function BillAnalysis({ bill, utility, trigger }: BillAnalysisProps) {
    const [analysis, setAnalysis] = useState<AIBillAnalysis | null>(null);
    const [prediction, setPrediction] = useState<AIPrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAnalyze = async () => {
        if (analysis) return; // Already analyzed
        setLoading(true);
        try {
            // Mock OCR text generation from bill data
            const billText = `
                Bill ID: ${bill.id}
                Utility: ${utility.type} - ${utility.providerName}
                Amount: ₹${bill.amount}
                Units: ${bill.unitsConsumed}
                Period: ${bill.period}
                Breakdown: ${bill.breakdown?.map(b => `${b.label}: ${b.amount}`).join(", ") || "Total only"}
            `;

            // Parallel AI calls
            const [aiResult, predResult] = await Promise.all([
                analyzeBillWithAI(billText),
                predictBillWithAI(utility.type, [{ date: bill.period, amount: bill.amount }]) // Mock history
            ]);

            setAnalysis(aiResult);
            setPrediction(predResult);
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) handleAnalyze();
        }}>
            <SheetTrigger asChild>
                {trigger || <Button variant="ghost" size="sm">Details</Button>}
            </SheetTrigger>
            <SheetContent className="w-[90%] sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Bill Breakdown
                    </SheetTitle>
                    <SheetDescription>
                        {utility.providerName} • {bill.period}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Bill Header */}
                    <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-xl">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <h2 className="text-2xl font-bold">₹{bill.amount}</h2>
                        </div>
                        <Badge variant={bill.status === "paid" ? "default" : "destructive"}>
                            {bill.status.toUpperCase()}
                        </Badge>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Brain className="w-5 h-5" />
                            AI Insights
                        </div>

                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-20 bg-muted rounded"></div>
                            </div>
                        ) : analysis ? (
                            <>
                                <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/30 dark:to-blue-950/30">
                                    <p className="text-sm leading-relaxed">{analysis.summary}</p>

                                    {/* Warnings */}
                                    {analysis.hiddenCharges.length > 0 && (
                                        <div className="mt-3 flex gap-2 items-start text-xs text-amber-700 bg-amber-100/50 p-2 rounded">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <div>
                                                <span className="font-semibold">Attention: </span>
                                                {analysis.hiddenCharges.join(", ")}
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* Charge Breakdown */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Detailed Charges</h4>
                                    {analysis.charges.map((charge, i) => (
                                        <div key={i} className="flex justify-between text-sm p-2 hover:bg-muted rounded transition-colors">
                                            <span className="flex items-center gap-2">
                                                {charge.name}
                                                {charge.isHigh && <Badge variant="outline" className="text-[10px] text-red-500 border-red-200">High</Badge>}
                                            </span>
                                            <span>₹{charge.amount}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Tips */}
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm mb-1">
                                        <Lightbulb className="w-4 h-4" /> Smart Tips
                                    </div>
                                    <ul className="list-disc list-inside text-xs text-green-800 dark:text-green-300 space-y-1">
                                        {analysis.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Analysis unavailable.</p>
                        )}
                    </div>

                    {/* Prediction Section */}
                    {!loading && prediction && (
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold mb-2">
                                <TrendingUp className="w-4 h-4" /> Next Month Forecast
                            </h4>
                            <Card className="p-4 border-dashed">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Estimated Range</p>
                                        <p className="text-lg font-bold">₹{prediction.confidenceRange[0].toFixed(0)} - ₹{prediction.confidenceRange[1].toFixed(0)}</p>
                                    </div>
                                    <Badge variant="secondary">{prediction.trend.toUpperCase()}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                    {prediction.reasoning}
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
