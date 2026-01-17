
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Lock, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Bill } from "@/lib/paymentsService";

interface DodoCheckoutProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
    onSuccess: () => void;
}

export function DodoCheckout({ open, onOpenChange, bill, onSuccess }: DodoCheckoutProps) {
    const [step, setStep] = useState<"initial" | "verifying" | "success">("initial");
    const PAYMENT_LINK = "https://checkout.dodopayments.com/buy/pdt_0NWUjl1ampUzKNEamhlrr?quantity=1";

    // Reset state when opening
    useEffect(() => {
        if (open) setStep("initial");
    }, [open]);

    const handlePay = () => {
        // Option B: Quantity Hack (Safe & Automatic)
        // We assume the Product Price is set to ₹1.
        // So Quantity = Bill Amount (e.g., 1450 units * ₹1 = ₹1450)

        const baseUrl = PAYMENT_LINK.split('?')[0];
        const finalUrl = `${baseUrl}?quantity=${bill.amount}`;

        // Open Dodo Checkout in new tab
        window.open(finalUrl, '_blank');
        setStep("verifying");
    };

    const handleManualVerify = () => {
        setStep("success");
        setTimeout(() => {
            onSuccess();
            onOpenChange(false);
        }, 1500);
    };

    if (!bill) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (step !== "success") onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                {/* Dodo Branding Header */}
                <div className="bg-[#111] text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center text-black font-bold text-lg">
                            D
                        </div>
                        <span className="font-bold text-lg tracking-tight">Dodo Payments</span>
                    </div>
                </div>

                {step === "initial" && (
                    <div className="p-6 space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold text-xl">Pay ₹{bill.amount}</h3>
                            <p className="text-muted-foreground text-sm">
                                You will be redirected to Dodo Payments to securely complete your transaction.
                            </p>
                        </div>

                        <div className="bg-secondary/50 p-4 rounded-xl flex items-center justify-between">
                            <span className="text-sm font-medium">Provider</span>
                            <span className="text-sm">{bill.utilityId === "ut_01" ? "TATA Power" : "Utility Provider"}</span>
                        </div>

                        <Button
                            className="w-full bg-[#111] hover:bg-black text-[#FFD700] hover:text-[#FFD700]/90 font-semibold h-12 text-base transition-colors"
                            onClick={handlePay}
                        >
                            Proceed to Pay <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground">
                            Secure checkout powered by Dodo
                        </p>
                    </div>
                )}

                {step === "verifying" && (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                            <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin relative z-10" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Waiting for confirmation</h3>
                            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-2">
                                Please complete the payment in the newly opened tab.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <Button onClick={handleManualVerify} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                I have completed payment
                            </Button>
                            <Button variant="ghost" onClick={() => setStep("initial")} className="w-full text-xs text-muted-foreground">
                                Retry / Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Payment Successful!</h3>
                            <p className="text-muted-foreground text-sm">Thank you for your payment.</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
