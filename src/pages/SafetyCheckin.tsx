import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SafetyCheckin() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/safety")}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CheckCircle className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-foreground">
            Safety Check-in
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Set timed check-ins to let others know you're safe
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        <Card className="bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            How it works
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500" />
              <span>Set a time duration for your journey</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500" />
              <span>Add emergency contacts to notify</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-purple-500" />
              <span>
                If you don't check in by the set time, alerts are sent
                automatically
              </span>
            </li>
          </ul>
        </Card>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            This feature is coming soon
          </p>
          <Button variant="outline" disabled>
            Set Up Check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
