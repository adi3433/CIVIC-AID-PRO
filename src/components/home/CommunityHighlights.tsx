import { CheckCircle2, Award, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const recentlyResolved = [
  {
    id: 1,
    title: "Pothole fixed on 5th Cross",
    resolvedTime: "2 hours ago",
    resolvedBy: "BBMP Ward 32",
  },
  {
    id: 2,
    title: "Streetlight repaired near park",
    resolvedTime: "5 hours ago",
    resolvedBy: "BESCOM",
  },
];

const topCitizen = {
  name: "Priya Sharma",
  badge: "Gold Contributor",
  reports: 45,
  resolved: 38,
};

export function CommunityHighlights() {
  return (
    <div className="px-4 py-4">
      <h2 className="text-base font-semibold text-foreground mb-3">Community Highlights</h2>
      
      <div className="space-y-3">
        {recentlyResolved.map((item) => (
          <Card key={item.id} variant="interactive" size="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.resolvedBy} • {item.resolvedTime}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        ))}

        <Card variant="elevated" size="default" className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                PS
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{topCitizen.name}</h3>
                <Award className="w-4 h-4 text-warning" />
              </div>
              <Badge variant="outline" className="mt-1 text-xs bg-warning/10 text-warning border-warning/30">
                {topCitizen.badge}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{topCitizen.reports}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
