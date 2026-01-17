import { AlertTriangle, Gift, Info, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRef, useState } from "react";

const announcements = [
  {
    id: 1,
    type: "alert",
    title: "Heavy Rain Alert",
    description: "Expected flooding in low-lying areas",
    icon: AlertTriangle,
    color: "warning",
  },
  {
    id: 2,
    type: "scheme",
    title: "PM Awas Yojana",
    description: "New housing scheme applications open",
    icon: Gift,
    color: "success",
  },
  {
    id: 3,
    type: "info",
    title: "Road Closure",
    description: "MG Road closed for metro work",
    icon: Info,
    color: "info",
  },
];

export function AnnouncementsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.85;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Announcements & Alerts</h2>
        <button className="text-sm text-primary font-medium flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4"
      >
        {announcements.map((item) => (
          <Card
            key={item.id}
            variant="interactive"
            className={`flex-shrink-0 w-[85%] snap-center ${
              item.color === "warning"
                ? "bg-warning/10 border-warning/30"
                : item.color === "success"
                ? "bg-success/10 border-success/30"
                : "bg-info/10 border-info/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  item.color === "warning"
                    ? "bg-warning/20"
                    : item.color === "success"
                    ? "bg-success/20"
                    : "bg-info/20"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    item.color === "warning"
                      ? "text-warning"
                      : item.color === "success"
                      ? "text-success"
                      : "text-info"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {announcements.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? "bg-primary w-4" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
