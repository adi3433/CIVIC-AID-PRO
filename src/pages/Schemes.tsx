import { useState, useRef } from "react";
import {
  Search,
  Heart,
  Home,
  Sprout,
  Wallet,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  { id: "health", icon: Heart, label: "Health", color: "destructive" },
  { id: "housing", icon: Home, label: "Housing", color: "primary" },
  { id: "farmer", icon: Sprout, label: "Farmer", color: "success" },
  { id: "pension", icon: Wallet, label: "Pension", color: "warning" },
];

const popularSchemes = [
  {
    id: 1,
    name: "PM Awas Yojana",
    category: "Housing",
    benefits: "Up to ₹2.5 Lakh subsidy",
    status: "Open",
    deadline: "Mar 31, 2024",
  },
  {
    id: 2,
    name: "Ayushman Bharat",
    category: "Health",
    benefits: "₹5 Lakh health cover",
    status: "Open",
    deadline: "Ongoing",
  },
  {
    id: 3,
    name: "PM Kisan Samman",
    category: "Farmer",
    benefits: "₹6,000 annually",
    status: "Open",
    deadline: "Ongoing",
  },
];

const myApplications = [
  {
    id: 1,
    scheme: "PM Awas Yojana",
    status: "approved",
    date: "Jan 10, 2024",
  },
  {
    id: 2,
    scheme: "Ayushman Bharat",
    status: "pending",
    date: "Jan 5, 2024",
  },
];

const applicationStatus = {
  approved: {
    label: "Approved",
    color: "bg-success/10 text-success border-success/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    color: "bg-warning/10 text-warning border-warning/30",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: AlertCircle,
  },
};

export default function Schemes() {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Government Schemes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find benefits you're eligible for
        </p>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Eligibility Checker */}
      <div className="px-4 pb-4">
        <Card variant="secondary" className="relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-secondary-foreground/20 rounded-xl">
              <Sparkles className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-foreground text-lg">
                Check Eligibility
              </h3>
              <p className="text-secondary-foreground/80 text-sm">
                Find schemes you qualify for
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-secondary-foreground/80" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary-foreground/10 rounded-full" />
        </Card>
      </div>

      {/* Categories */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              variant="interactive"
              size="sm"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3"
            >
              <div
                className={`p-2 rounded-lg ${
                  cat.color === "destructive"
                    ? "bg-destructive/10"
                    : cat.color === "primary"
                    ? "bg-primary/10"
                    : cat.color === "success"
                    ? "bg-success/10"
                    : "bg-warning/10"
                }`}
              >
                <cat.icon
                  className={`w-4 h-4 ${
                    cat.color === "destructive"
                      ? "text-destructive"
                      : cat.color === "primary"
                      ? "text-primary"
                      : cat.color === "success"
                      ? "text-success"
                      : "text-warning"
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {cat.label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Schemes Carousel */}
      <div className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Popular Schemes
          </h2>
          <button className="text-sm text-primary font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2"
        >
          {popularSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              variant="elevated"
              size="default"
              className="flex-shrink-0 w-[75%] snap-center"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary border-primary/30"
                >
                  {scheme.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-success/10 text-success border-success/30"
                >
                  {scheme.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-1">
                {scheme.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {scheme.benefits}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Deadline: {scheme.deadline}
                </span>
                <Button size="sm" variant="default">
                  Apply Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* My Applications */}
      <div className="px-4 py-4 pb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">
          My Applications
        </h2>
        <div className="space-y-3">
          {myApplications.map((app) => {
            const status =
              applicationStatus[app.status as keyof typeof applicationStatus];
            const StatusIcon = status.icon;
            return (
              <Card key={app.id} variant="interactive" size="sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">
                      {app.scheme}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Applied: {app.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${status.color}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
