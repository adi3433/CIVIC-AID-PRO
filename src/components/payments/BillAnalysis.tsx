import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  FileText,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { Bill, Utility, paymentsService } from "@/lib/paymentsService";
import {
  analyzeBillWithAI,
  AIBillAnalysis,
  predictBillWithAI,
  AIPrediction,
} from "@/lib/geminiService";

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
                Breakdown: ${bill.breakdown?.map((b) => `${b.label}: ${b.amount}`).join(", ") || "Total only"}
            `;

      // Parallel AI calls
      const [aiResult, predResult] = await Promise.all([
        analyzeBillWithAI(billText),
        predictBillWithAI(utility.type, [
          { date: bill.period, amount: bill.amount },
        ]), // Mock history
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
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) handleAnalyze();
      }}
    >
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            Details
          </Button>
        )}
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
          <Card
            variant="secondary"
            size="default"
            className="relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-sm text-secondary-foreground/80 mb-1">
                Total Amount
              </p>
              <h2 className="text-3xl font-bold text-secondary-foreground">
                ₹{bill.amount}
              </h2>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className={
                    bill.status === "paid"
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"
                  }
                >
                  {bill.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary-foreground/10 rounded-full" />
          </Card>

          {/* AI Analysis Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Brain className="w-5 h-5 text-primary" />
              AI Insights
            </div>

            {loading ? (
              <Card variant="elevated" size="default">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </Card>
            ) : analysis ? (
              <>
                <Card variant="elevated" size="default">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.summary}
                  </p>

                  {/* Warnings */}
                  {analysis.hiddenCharges.length > 0 && (
                    <div className="mt-3 flex gap-2 items-start text-xs">
                      <Card variant="warning" size="sm" className="flex-1">
                        <div className="flex gap-2 items-start">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-warning" />
                          <div>
                            <span className="font-semibold">Attention: </span>
                            {analysis.hiddenCharges.join(", ")}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </Card>

                {/* Charge Breakdown */}
                <Card variant="elevated" size="default">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Detailed Charges
                  </h4>
                  <div className="space-y-2">
                    {analysis.charges.map((charge, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm py-2 border-b last:border-0"
                      >
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {charge.name}
                          {charge.isHigh && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                            >
                              High
                            </Badge>
                          )}
                        </span>
                        <span className="font-medium text-foreground">
                          ₹{charge.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Tips */}
                <Card variant="success" size="default">
                  <div className="flex items-center gap-2 font-semibold text-success mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Smart Tips
                  </div>
                  <ul className="space-y-2">
                    {analysis.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-success mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Analysis unavailable.
              </p>
            )}
          </div>

          {/* Prediction Section */}
          {!loading && prediction && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                Next Month Forecast
              </div>
              <Card variant="elevated" size="default">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Estimated Range
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{prediction.confidenceRange[0].toFixed(0)} - ₹
                      {prediction.confidenceRange[1].toFixed(0)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    {prediction.trend.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground border-t pt-3">
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
