import { ArrowLeft, PhoneCall, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const emergencyContacts = [
  { name: "Police", number: "100", color: "destructive" },
  { name: "Ambulance", number: "108", color: "destructive" },
  { name: "Fire", number: "101", color: "warning" },
  { name: "Women Helpline", number: "181", color: "secondary" },
  { name: "Child Helpline", number: "1098", color: "secondary" },
  { name: "Senior Citizen Helpline", number: "14567", color: "info" },
  { name: "National Emergency", number: "112", color: "destructive" },
  { name: "Railway Helpline", number: "139", color: "info" },
  { name: "Road Accident", number: "1073", color: "warning" },
  { name: "Disaster Management", number: "1070", color: "destructive" },
  { name: "Air Ambulance", number: "9540161344", color: "warning" },
  { name: "Blood Bank", number: "104", color: "success" },
  { name: "Poison Control", number: "1066", color: "warning" },
  { name: "Tourist Helpline", number: "1363", color: "info" },
  { name: "Cyber Crime", number: "1930", color: "secondary" },
  { name: "Anti-Corruption", number: "1064", color: "info" },
];

export default function EmergencyContacts() {
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
          <BookOpen className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-foreground">
            Emergency Numbers
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Quick access to emergency contact numbers
        </p>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {emergencyContacts.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.number}`}
              className="block"
              data-agent-id={`emergency-call-${contact.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card variant="interactive" size="sm" className="h-full">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${contact.color === "destructive"
                        ? "bg-destructive/10"
                        : contact.color === "warning"
                          ? "bg-warning/10"
                          : "bg-secondary/10"
                      }`}
                  >
                    <PhoneCall
                      className={`w-4 h-4 ${contact.color === "destructive"
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
                    <p className="font-bold text-foreground">{contact.number}</p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
