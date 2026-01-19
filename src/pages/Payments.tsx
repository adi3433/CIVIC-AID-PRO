import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  PaymentProfile,
  paymentsService,
  Utility,
  Bill,
} from "@/lib/paymentsService";
import { UtilityCard } from "@/components/payments/UtilityCard";
import { BillAnalysis } from "@/components/payments/BillAnalysis";
import { AddUtilityModal } from "@/components/payments/AddUtilityModal";
import { DodoCheckout } from "@/components/payments/DodoCheckout";

type Tab = "overview" | "safety";

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PaymentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await paymentsService.getProfile();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    setSelectedBill(bill);
    setPayModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    alert("Payment processed successfully!");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      <DodoCheckout
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        bill={selectedBill}
        onSuccess={handlePaymentSuccess}
      />
      {/* Header Area */}
      <div className="bg-primary/5 px-4 pt-6 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground text-sm">
              Track bills & avoid scams
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background border-0 shadow-sm"
            >
              <Bell className="w-5 h-5 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Amount Due Card */}
        <Card className="p-5 border-0 shadow-lg bg-primary text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Total Due</p>
            <h2 className="text-4xl font-bold mb-4">
              ₹{profile?.totalDue.toLocaleString()}
            </h2>

            <div className="flex gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md ${(profile?.safetyScore || 0) > 80
                    ? "bg-green-500/20 text-green-100"
                    : "bg-yellow-500/20 text-yellow-100"
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Safety Score: {profile?.safetyScore}/100
              </div>
            </div>
          </div>
          <CreditCard className="absolute -bottom-6 -right-6 w-40 h-40 text-white/10 rotate-12" />
        </Card>

        {/* Quick Actions (Tabs) */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === "overview" ? "default" : "secondary"}
            className="flex-1 rounded-xl shadow-none"
            onClick={() => setActiveTab("overview")}
            data-agent-id="tab-overview"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "safety" ? "default" : "secondary"}
            className={`flex-1 rounded-xl shadow-none ${activeTab === "safety" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
            onClick={() => setActiveTab("safety")}
            data-agent-id="tab-safety"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Safety
          </Button>
        </div>
      </div>

      <div className="px-4 mt-6">
        {activeTab === "overview" ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Your Utilities</h3>
              <AddUtilityModal onAdd={() => loadData()} />
            </div>

            <div className="space-y-4">
              {profile?.utilities.map((utility) => {
                const latestBill = profile.bills.find(
                  (b) => b.utilityId === utility.id,
                ); // In real app, explicit link

                if (!latestBill) return null; // Or show empty state

                return (
                  <BillAnalysis
                    key={utility.id}
                    utility={utility}
                    bill={latestBill}
                    trigger={
                      <div>
                        <UtilityCard
                          utility={utility}
                          bill={latestBill}
                          onClick={() => { }}
                          onPay={(e) => handlePay(e, latestBill)}
                        />
                      </div>
                    }
                  />
                );
              })}
            </div>

            <div className="mt-8 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Recent Activity
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground"
                >
                  View All
                </Button>
              </div>
              <Card className="p-4 border bg-card/50">
                <p className="text-sm text-center text-muted-foreground py-2">
                  No recent transactions
                </p>
              </Card>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 bg-card border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Verify Payment Link
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste payment link here (e.g. bit.ly/...)"
                  className="flex-1 px-3 py-2 rounded-md border text-sm bg-background"
                  data-agent-id="verify-link-input"
                />
                <Button size="sm" data-agent-id="verify-link-btn">Check</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We check against official databases and scam patterns.
              </p>
            </Card>

            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <div className="flex gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg h-fit">
                  <AlertTriangle className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Payment Safety Tips
                  </h3>
                  <p className="text-sm text-yellow-800/80 mt-1">
                    Always verify the URL before paying. Official utility
                    websites usually end in .gov.in or .org.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
