import { useState } from "react";
import {
  Map,
  AlertTriangle,
  Phone,
  Shield,
  Link2,
  ChevronRight,
  AlertOctagon,
  Droplets,
  Lightbulb,
  Car,
  PhoneCall,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const safetyAlerts = [
  {
    id: 1,
    type: "accident",
    title: "Accident-Prone Zone",
    location: "Silk Board Junction",
    severity: "high",
    icon: Car,
  },
  {
    id: 2,
    type: "flood",
    title: "Flood Risk Area",
    location: "KR Market Underpass",
    severity: "medium",
    icon: Droplets,
  },
  {
    id: 3,
    type: "lighting",
    title: "Poor Lighting",
    location: "5th Cross, Near Park",
    severity: "low",
    icon: Lightbulb,
  },
];

const emergencyContacts = [
  { name: "Police", number: "100", color: "destructive" },
  { name: "Ambulance", number: "108", color: "destructive" },
  { name: "Fire", number: "101", color: "warning" },
  { name: "Women Helpline", number: "181", color: "secondary" },
];

const severityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-info/10 text-info border-info/30",
};

export default function Safety() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [suspiciousLink, setSuspiciousLink] = useState("");

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Safety</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Stay informed and protected
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pb-4">
        <Tabs defaultValue="safety" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="digital">Digital Safety</TabsTrigger>
          </TabsList>

          {/* Safety Tab */}
          <TabsContent value="safety" className="mt-4">
            {/* Interactive Map Preview */}
            <div className="pb-4">
              <Card
                variant="elevated"
                className="relative overflow-hidden h-44 p-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-4 bg-card/90 rounded-full mx-auto mb-3 shadow-lg">
                      <Map className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">
                      Interactive Safety Map
                    </p>
                    <p className="text-sm text-muted-foreground">
                      View hazards in your area
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-card shadow-sm">
                    Live
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Safety Alerts */}
            <div className="py-4">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Safety Alerts
              </h2>
              <div className="space-y-3">
                {safetyAlerts.map((alert) => (
                  <Card key={alert.id} variant="interactive" size="sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          alert.severity === "high"
                            ? "bg-destructive/10"
                            : alert.severity === "medium"
                            ? "bg-warning/10"
                            : "bg-info/10"
                        }`}
                      >
                        <alert.icon
                          className={`w-5 h-5 ${
                            alert.severity === "high"
                              ? "text-destructive"
                              : alert.severity === "medium"
                              ? "text-warning"
                              : "text-info"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {alert.location}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${severityColors[alert.severity]}`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Emergency Section */}
            <div className="py-4 pb-8">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Emergency
              </h2>

              {/* SOS Button */}
              <Card
                variant="destructive"
                className="mb-4 border-2 border-destructive"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive-foreground/20 rounded-xl animate-pulse">
                    <AlertOctagon className="w-8 h-8 text-destructive-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive-foreground text-lg">
                      SOS Emergency
                    </h3>
                    <p className="text-destructive-foreground/80 text-sm">
                      Press and hold for 3 seconds
                    </p>
                  </div>
                </div>
              </Card>

              {/* Emergency Contacts */}
              <div className="grid grid-cols-2 gap-3">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.name} variant="interactive" size="sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          contact.color === "destructive"
                            ? "bg-destructive/10"
                            : contact.color === "warning"
                            ? "bg-warning/10"
                            : "bg-secondary/10"
                        }`}
                      >
                        <PhoneCall
                          className={`w-4 h-4 ${
                            contact.color === "destructive"
                              ? "text-destructive"
                              : contact.color === "warning"
                              ? "text-warning"
                              : "text-secondary"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {contact.name}
                        </p>
                        <p className="font-bold text-foreground">
                          {contact.number}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Digital Safety Tab */}
          <TabsContent value="digital" className="mt-4 pb-8">
            <div className="py-4">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Scam Detection
              </h2>
              <div className="space-y-3">
                <Card variant="default" size="sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Check Phone Number
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="default">
                      Check
                    </Button>
                  </div>
                </Card>

                <Card variant="default" size="sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-foreground">
                      Check Suspicious Link
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Paste link here"
                      value={suspiciousLink}
                      onChange={(e) => setSuspiciousLink(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="default">
                      Verify
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
