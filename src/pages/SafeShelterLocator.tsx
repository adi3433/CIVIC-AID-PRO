import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SafeShelterLocator() {
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
          <MapPin className="w-6 h-6 text-green-500" />
          <h1 className="text-2xl font-bold text-foreground">
            Safe Shelter Locator
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Find nearest shelters, hospitals during emergencies
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        <Card className="bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            What you'll find
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Emergency shelters during natural disasters</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Nearest hospitals and medical facilities</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Police stations and safe zones</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Relief centers and distribution points</span>
            </li>
          </ul>
        </Card>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            This feature is coming soon
          </p>
          <Button variant="outline" disabled>
            Find Shelters
          </Button>
        </div>
      </div>
    </div>
  );
}
