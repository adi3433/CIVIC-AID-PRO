import { TrendingUp, TrendingDown, Sparkles, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Issues Reported", value: 247, trend: "up", change: "+12%" },
  { label: "Issues Resolved", value: 198, trend: "up", change: "+8%" },
];

export function AreaHealth() {
  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">Area Health Snapshot</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        {stats.map((stat) => (
          <Card key={stat.label} variant="default" size="sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                <span
                  className={`text-xs font-medium flex items-center gap-0.5 ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="default" size="sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Cleanliness</span>
              </div>
              <span className="text-sm font-bold text-success">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </Card>
        <Card variant="default" size="sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-info" />
                <span className="text-xs text-muted-foreground">Safety</span>
              </div>
              <span className="text-sm font-bold text-info">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </Card>
      </div>
    </div>
  );
}
