import { MapPin, Sun, Cloud, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function GreetingSection() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Good morning,</p>
          <h1 className="text-2xl font-bold text-foreground">Hi Rahul! 👋</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Koramangala, Bangalore</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
            <Sun className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">28°C</span>
          </div>
          <button className="relative p-2 bg-card rounded-full shadow-sm border border-border hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-foreground" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </button>
        </div>
      </div>
    </div>
  );
}
