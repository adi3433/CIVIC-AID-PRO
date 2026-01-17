import { useState } from "react";
import {
  ArrowLeft,
  Book,
  Search,
  FileText,
  Heart,
  Home as HomeIcon,
  Briefcase,
  Shield,
  Users,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    id: "rights",
    title: "Citizen Rights",
    icon: Shield,
    color: "bg-blue-500/10 text-blue-500",
    articles: [
      {
        title: "Right to Information (RTI)",
        content: "How to file RTI applications",
      },
      { title: "Consumer Rights", content: "Your rights as a consumer" },
      { title: "Voting Rights", content: "Electoral process and your vote" },
    ],
  },
  {
    id: "schemes",
    title: "Government Schemes",
    icon: FileText,
    color: "bg-green-500/10 text-green-500",
    articles: [
      { title: "PM Awas Yojana", content: "Housing scheme eligibility" },
      { title: "Ayushman Bharat", content: "Health insurance coverage" },
      { title: "Pension Schemes", content: "Senior citizen benefits" },
    ],
  },
  {
    id: "health",
    title: "Healthcare",
    icon: Heart,
    color: "bg-red-500/10 text-red-500",
    articles: [
      { title: "Government Hospitals", content: "Access to healthcare" },
      { title: "Medicine Subsidies", content: "Generic drug programs" },
      { title: "Emergency Services", content: "108 ambulance and first aid" },
    ],
  },
  {
    id: "property",
    title: "Property & Housing",
    icon: HomeIcon,
    color: "bg-purple-500/10 text-purple-500",
    articles: [
      { title: "Property Registration", content: "How to register property" },
      { title: "Rent Agreement", content: "Legal requirements" },
      { title: "Building Permits", content: "Construction approvals" },
    ],
  },
  {
    id: "employment",
    title: "Employment",
    icon: Briefcase,
    color: "bg-orange-500/10 text-orange-500",
    articles: [
      { title: "MGNREGA", content: "Rural employment guarantee" },
      { title: "Labour Laws", content: "Worker rights and benefits" },
      { title: "Unemployment Benefits", content: "Financial assistance" },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Contacts",
    icon: Phone,
    color: "bg-red-500/10 text-red-500",
    articles: [
      { title: "Police - 100", content: "Emergency police assistance" },
      { title: "Ambulance - 108", content: "Medical emergencies" },
      { title: "Women Helpline - 181", content: "24/7 support" },
    ],
  },
];

export default function Library() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.articles.some((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

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
            <Book className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-foreground">
              Information Library
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Offline guides and resources for citizens
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search topics, schemes, rights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 space-y-3">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            variant="interactive"
            className={`cursor-pointer ${category.color}`}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category.id ? null : category.id,
              )
            }
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {category.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category.articles.length} articles
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedCategory === category.id ? "Hide" : "View"}
              </Badge>
            </div>

            {selectedCategory === category.id && (
              <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                {category.articles.map((article, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-card rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium text-foreground text-sm">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 px-4">
          <Book className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No Results Found
          </h3>
          <p className="text-xs text-muted-foreground">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
}
