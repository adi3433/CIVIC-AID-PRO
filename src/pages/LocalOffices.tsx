import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Office {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email?: string;
  hours: string;
  distance?: number;
}

// Static data for Pala, Kottayam region
const LOCAL_OFFICES: Office[] = [
  {
    id: "collector",
    name: "District Collector Office",
    type: "Administration",
    address: "Collectorate, Kottayam, Kerala 686002",
    phone: "0481-2562203",
    email: "collector@kottayam.kerala.gov.in",
    hours: "10:00 AM - 5:00 PM",
  },
  {
    id: "taluk",
    name: "Pala Taluk Office",
    type: "Administration",
    address: "Taluk Office, Pala, Kottayam 686575",
    phone: "04822-212328",
    email: "talukoffice.pala@kerala.gov.in",
    hours: "10:00 AM - 5:00 PM",
  },
  {
    id: "municipality",
    name: "Pala Municipality",
    type: "Local Body",
    address: "Municipality Building, Pala, Kerala 686575",
    phone: "04822-212244",
    email: "mun.pala@kerala.gov.in",
    hours: "9:30 AM - 5:30 PM",
  },
  {
    id: "police",
    name: "Pala Police Station",
    type: "Law Enforcement",
    address: "Pala Town, Kottayam 686575",
    phone: "04822-212334",
    hours: "24/7",
  },
  {
    id: "revenue",
    name: "Revenue Division Office",
    type: "Revenue",
    address: "Revenue Office, Pala, Kerala 686575",
    phone: "04822-212520",
    hours: "10:00 AM - 5:00 PM",
  },
  {
    id: "panchayat",
    name: "Block Panchayat Office",
    type: "Local Body",
    address: "Block Panchayat, Pala, Kerala 686575",
    phone: "04822-212667",
    email: "blockpanchayat.pala@kerala.gov.in",
    hours: "10:00 AM - 5:00 PM",
  },
];

export default function LocalOffices() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Pala, Kottayam");

  const handleGetDirections = (office: Office) => {
    const encodedAddress = encodeURIComponent(office.address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    );
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold text-foreground">
              Local Offices
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-11">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>

      {/* Offices List */}
      <div className="px-4 py-4 space-y-3">
        {LOCAL_OFFICES.map((office) => (
          <Card key={office.id} variant="default" className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">
                    {office.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {office.type}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{office.address}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`tel:${office.phone}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {office.phone}
                  </a>
                </div>

                {office.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a
                      href={`mailto:${office.email}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {office.email}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{office.hours}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCall(office.phone)}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleGetDirections(office)}
                  className="flex-1"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Directions
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
