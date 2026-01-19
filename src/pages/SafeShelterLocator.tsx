import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Droplets,
  Heart,
  Utensils,
  Zap,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Shelter {
  id: string;
  name: string;
  type:
  | "school"
  | "community_hall"
  | "hospital"
  | "relief_camp"
  | "police_station";
  lat: number;
  lng: number;
  facilities: string[];
  status: "open" | "limited" | "full";
  contact?: string;
  distance?: number;
}

// Static shelter data for Pala, Kottayam region
const SHELTERS_DATA: Shelter[] = [
  {
    id: "shelter_01",
    name: "St. Thomas College Pala",
    type: "school",
    lat: 9.7248, // Updated: Arunapuram
    lng: 76.6841,
    facilities: ["water", "toilets", "medical", "electricity"],
    status: "open",
    contact: "04822-212317", // Updated official landline
  },
  {
    id: "shelter_02",
    name: "Pala St. Thomas Mission Hospital",
    type: "hospital",
    lat: 9.245, // Updated: Kattanam/Pala region clinical center
    lng: 76.623,
    facilities: ["water", "toilets", "medical", "food", "electricity"],
    status: "open",
    contact: "0479-2332028", // Updated official hospital contact
  },
  {
    id: "shelter_03",
    name: "Pala Town Hall",
    type: "community_hall",
    lat: 9.7118,
    lng: 76.6805,
    facilities: ["water", "toilets", "electricity", "food"],
    status: "open",
    contact: "04822-212328", // Updated: Pala Municipality/Town Hall contact
  },
  {
    id: "shelter_04",
    name: "Relief Camp Bharananganam",
    type: "relief_camp",
    lat: 9.6994,
    lng: 76.7194,
    facilities: ["water", "toilets", "medical", "food"],
    status: "open",
    contact: "04822-236496", // Updated: Sneha Bhavan/Relief center contact
  },
  {
    id: "shelter_06",
    name: "Govt High School Ramapuram",
    type: "school",
    lat: 9.7495,
    lng: 76.6432,
    facilities: ["water", "toilets", "electricity"],
    status: "open",
    contact: "04822-260371", // Updated: Official school office
  },
  {
    id: "shelter_07",
    name: "Community Hall Cherpunkal",
    type: "community_hall",
    lat: 9.6955,
    lng: 76.6489,
    facilities: ["water", "toilets", "electricity"],
    status: "limited",
    contact: "04822-212328", // Managed via Pala Municipality
  },
  {
    id: "shelter_08",
    name: "Caritas Hospital Kottayam",
    type: "hospital",
    lat: 9.6267,
    lng: 76.5411,
    facilities: ["water", "toilets", "medical", "food", "electricity"],
    status: "open",
    contact: "0481-2790025", // Updated: Official Caritas main line
  },
  {
    id: "shelter_09",
    name: "Pala Police Station",
    type: "police_station",
    lat: 9.7122,
    lng: 76.6835,
    facilities: ["water", "toilets", "medical"],
    status: "open",
    contact: "04822-212334", // Updated official station number
  },
  {
    id: "shelter_10",
    name: "Relief Camp Kozhuvanal",
    type: "relief_camp",
    lat: 9.6821,
    lng: 76.6415,
    facilities: ["water", "toilets", "food"],
    status: "open",
    contact: "04822-267332", // Kozhuvanal Panchayat link
  },
  {
    id: "shelter_11",
    name: "St. George School Pala",
    type: "school",
    lat: 9.7155,
    lng: 76.6901,
    facilities: ["water", "toilets", "electricity"],
    status: "open",
    contact: "04822-212517",
  },
  {
    id: "shelter_12",
    name: "Community Hall Kaduthuruthy",
    type: "community_hall",
    lat: 9.7485,
    lng: 76.495,
    facilities: ["water", "toilets", "electricity", "food"],
    status: "open",
    contact: "04829-282229", // Kaduthuruthy Municipality
  },
  {
    id: "shelter_13",
    name: "Relief Camp Erattupetta",
    type: "relief_camp",
    lat: 9.6833,
    lng: 76.7833,
    facilities: ["water", "toilets", "food", "medical"],
    status: "limited",
    contact: "04822-272063", // Erattupetta Municipality
  },
  {
    id: "shelter_14",
    name: "Govt HSS Ponkunnam",
    type: "school",
    lat: 9.5894,
    lng: 76.7589,
    facilities: ["water", "toilets", "electricity"],
    status: "open",
    contact: "04828-223350", // Updated: Official School number
  },
  {
    id: "shelter_15",
    name: "Police Station Bharananganam",
    type: "police_station",
    lat: 9.7025,
    lng: 76.721,
    facilities: ["water", "toilets"],
    status: "open",
    contact: "04822-237033",
  },
];

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FACILITY_ICONS: Record<string, JSX.Element> = {
  water: <Droplets className="w-3 h-3" />,
  toilets: <Building2 className="w-3 h-3" />,
  medical: <Heart className="w-3 h-3" />,
  food: <Utensils className="w-3 h-3" />,
  electricity: <Zap className="w-3 h-3" />,
};

const TYPE_LABELS: Record<string, string> = {
  school: "School",
  community_hall: "Community Hall",
  hospital: "Hospital",
  relief_camp: "Relief Camp",
  police_station: "Police Station",
};

export default function SafeShelterLocator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  const handleFindShelters = () => {
    setLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          findNearbyShelters(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Pala, Kottayam coordinates
          const fallbackLat = 9.7167;
          const fallbackLng = 76.6833;
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });
          findNearbyShelters(fallbackLat, fallbackLng);
          toast({
            title: "Using Default Location",
            description: "Enable location for accurate results",
            duration: 3000,
          });
        },
      );
    } else {
      // No geolocation support
      const fallbackLat = 9.7167;
      const fallbackLng = 76.6833;
      setUserLocation({ lat: fallbackLat, lng: fallbackLng });
      findNearbyShelters(fallbackLat, fallbackLng);
      setLoading(false);
    }
  };

  const findNearbyShelters = (lat: number, lng: number) => {
    // Calculate distances and filter within 10km
    const sheltersWithDistance = SHELTERS_DATA.map((shelter) => ({
      ...shelter,
      distance: calculateDistance(lat, lng, shelter.lat, shelter.lng),
    })).filter((shelter) => shelter.distance! <= 10);

    // Sort by distance
    sheltersWithDistance.sort((a, b) => a.distance! - b.distance!);

    setShelters(sheltersWithDistance);
    setLoading(false);

    if (sheltersWithDistance.length === 0) {
      toast({
        title: "No Shelters Found",
        description: "No shelters within 10km radius",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Shelters Found",
        description: `Found ${sheltersWithDistance.length} shelter(s) nearby`,
      });
    }
  };

  const handleGetDirections = (shelter: Shelter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shelter.name)}`;
    window.open(url, "_blank");
  };

  const handleShareShelter = (shelter: Shelter) => {
    const message = `🏠 Safe Shelter Information\n\nName: ${shelter.name}\nType: ${TYPE_LABELS[shelter.type]}\nStatus: ${shelter.status.toUpperCase()}\nFacilities: ${shelter.facilities.join(", ")}\n${shelter.contact ? `Contact: ${shelter.contact}\n` : ""}Location: https://www.google.com/maps?q=${shelter.lat},${shelter.lng}\n\nDistance: ${shelter.distance?.toFixed(1)} km away`;

    if (navigator.share) {
      navigator
        .share({
          title: "Safe Shelter",
          text: message,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          navigator.clipboard.writeText(message);
          toast({
            title: "Details Copied",
            description: "Shelter details copied to clipboard",
          });
        });
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Details Copied",
        description: "Shelter details copied to clipboard",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-500 border-green-500";
      case "limited":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500";
      case "full":
        return "bg-red-500/10 text-red-500 border-red-500";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500";
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
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
        {/* Info Card */}
        {!userLocation && (
          <Card className="bg-card border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              What you'll find
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Emergency shelters during natural disasters</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Nearest hospitals and medical facilities</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Police stations and safe zones</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Relief centers and distribution points</span>
              </li>
            </ul>
          </Card>
        )}

        {/* Find Shelters Button */}
        {!userLocation && (
          <Button
            onClick={handleFindShelters}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600"
            size="lg"
            data-agent-id="find-shelters-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Finding Shelters...
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                Find Nearby Shelters
              </>
            )}
          </Button>
        )}

        {/* Shelter List */}
        {userLocation && shelters.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {shelters.length} shelter(s) within 10km
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFindShelters}
                disabled={loading}
                data-agent-id="refresh-shelters-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {shelters.map((shelter) => (
              <Card
                key={shelter.id}
                className="bg-card border border-border p-4"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground flex-1">
                        {shelter.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(shelter.status)}`}
                      >
                        {shelter.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[shelter.type]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {shelter.distance?.toFixed(1)} km
                      </Badge>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {shelter.facilities.map((facility) => (
                      <Badge
                        key={facility}
                        variant="outline"
                        className="text-xs flex items-center gap-1 capitalize"
                      >
                        {FACILITY_ICONS[facility]}
                        {facility}
                      </Badge>
                    ))}
                  </div>

                  {/* Contact */}
                  {shelter.contact && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <a
                        href={`tel:${shelter.contact}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {shelter.contact}
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGetDirections(shelter)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      data-agent-id={`shelter-directions-${shelter.id}`}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareShelter(shelter)}
                      className="flex-1"
                      data-agent-id={`shelter-share-${shelter.id}`}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* No Results */}
        {userLocation && shelters.length === 0 && !loading && (
          <Card className="bg-card border border-border p-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">
              No Shelters Found
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              No shelters within 10km of your location
            </p>
            <Button variant="outline" size="sm" onClick={handleFindShelters} data-agent-id="try-again-shelters-btn">
              Try Again
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
