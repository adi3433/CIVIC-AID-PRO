import { MapPin, Sun, Cloud, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function GreetingSection() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [location, setLocation] = useState("Pala, Kottayam");
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 18) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  const getUserName = () => {
    if (profile?.full_name) {
      const firstName = profile.full_name.split(" ")[0];
      return firstName;
    }
    return "User";
  };

  useEffect(() => {
    // Get user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use Nominatim reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await response.json();

            // Extract locality and city/state
            const address = data.address;
            const locality =
              address.suburb ||
              address.neighbourhood ||
              address.locality ||
              address.city_district;
            const city = address.city || address.town || address.state_district;

            if (locality && city) {
              setLocation(`${locality}, ${city}`);
            } else if (city) {
              setLocation(city);
            } else {
              setLocation(
                data.display_name?.split(",").slice(0, 2).join(",") ||
                  "Pala, Kottayam",
              );
            }
          } catch (error) {
            console.error("Error fetching location:", error);
            setLocation("Pala, Kottayam");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation("Pala, Kottayam");
          setLoading(false);
        },
      );
    } else {
      setLocation("Pala, Kottayam");
      setLoading(false);
    }
  }, []);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-foreground">
            Hi {getUserName()}!
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{loading ? t("common.loading") : location}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
            <Sun className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">28°C</span>
          </div>
          <button className="relative p-2 bg-card rounded-full shadow-sm border border-border hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-foreground" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </button>
        </div>
      </div>
    </div>
  );
}
