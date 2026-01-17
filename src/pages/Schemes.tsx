import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { schemesService } from "@/lib/schemesService";
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
  Loader2,
  X,
  ExternalLink,
  Calendar,
  Users,
  Info,
  DollarSign,
  FileCheck,
  Building2,
  Phone,
  Mail,
  Globe,
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

interface Scheme {
  id: string;
  name: string;
  category: string;
  benefits: string;
  status: string;
  deadline: string;
  eligibility?: string;
  howToApply?: string;
  applicationUrl?: string;
}

interface SchemeDetails {
  fullDescription: string;
  objectives: string[];
  benefits: {
    monetary?: string;
    nonMonetary: string[];
  };
  eligibilityCriteria: {
    age?: string;
    income?: string;
    location?: string;
    other: string[];
  };
  requiredDocuments: string[];
  applicationProcess: Array<{ step: number; description: string }>;
  importantDates: {
    startDate?: string;
    deadline: string;
    lastUpdated?: string;
  };
  contactInfo: {
    helpline?: string;
    email?: string;
    website?: string;
  };
  officialApplicationUrl: string;
}

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
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemeDetails, setSchemeDetails] = useState<SchemeDetails | null>(
    null,
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [lifeEventQuery, setLifeEventQuery] = useState("");
  const [lifeEventResults, setLifeEventResults] = useState<any[]>([]);
  const [loadingLifeEvent, setLoadingLifeEvent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSchemes();

    // Check if navigated with life event results
    if (location.state?.lifeEventQuery && location.state?.lifeEventResults) {
      setLifeEventQuery(location.state.lifeEventQuery);
      setLifeEventResults(location.state.lifeEventResults);
    }
  }, [location]);

  const fetchSchemes = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Fireworks AI via helper service
      const { generateContent } = await import("@/lib/geminiService");

      const prompt = `List current active Indian government schemes ${
        category
          ? `for ${category} category`
          : "across all categories (Health, Housing, Farmer/Agriculture, Pension)"
      }. For each scheme provide:
1. Official scheme name (exact from official portal)
2. Category (Health/Housing/Farmer/Pension)
3. Key benefits (brief, under 100 characters)
4. Current status (Open/Closed/Ongoing)
5. Application deadline or "Ongoing"
6. Brief eligibility criteria
7. How to apply (brief)
8. Official application URL (actual government portal)

Format as JSON array with fields: name, category, benefits, status, deadline, eligibility, howToApply, applicationUrl.
Provide 10 REAL active schemes with ACTUAL official URLs. Use current 2024-2025 data.
RETURN JSON ONLY.`;

      const text = await generateContent(prompt);

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const schemesData = JSON.parse(jsonMatch[0]);
        const formattedSchemes = schemesData.map(
          (scheme: any, index: number) => ({
            id: `scheme-${index}`,
            ...scheme,
          }),
        );
        setSchemes(formattedSchemes);
      } else {
        console.error("Failed to parse schemesJSON:", text);
        throw new Error("Failed to parse schemes data");
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      setError("Failed to load schemes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemeDetails = async (scheme: Scheme) => {
    try {
      setLoadingDetails(true);
      const { generateContent } = await import("@/lib/geminiService");

      const prompt = `Provide complete, accurate details for the Indian government scheme: "${scheme.name}"

Fetch from official sources (myScheme portal, ministry websites, india.gov.in) and return comprehensive JSON with REAL information:
{
  "fullDescription": "detailed official description (200-300 words)",
  "objectives": ["objective1", "objective2", "objective3"],
  "benefits": {
    "monetary": "specific amounts if applicable (e.g., ₹X per month, ₹Y subsidy)",
    "nonMonetary": ["benefit1", "benefit2", "benefit3"]
  },
  "eligibilityCriteria": {
    "age": "age range if applicable",
    "income": "income limits if applicable",
    "location": "applicable states/districts/all India",
    "other": ["additional criteria"]
  },
  "requiredDocuments": ["Aadhaar card", "Income certificate", "etc"],
  "applicationProcess": [
    {"step": 1, "description": "Visit official portal"},
    {"step": 2, "description": "Register/Login"},
    {"step": 3, "description": "Fill application form"},
    {"step": 4, "description": "Upload documents"},
    {"step": 5, "description": "Submit application"}
  ],
  "importantDates": {
    "startDate": "date or N/A",
    "deadline": "date or Ongoing",
    "lastUpdated": "recent update date"
  },
  "contactInfo": {
    "helpline": "toll-free number",
    "email": "official email",
    "website": "official website URL"
  },
  "officialApplicationUrl": "ACTUAL direct link to application portal"
}

Provide REAL, accurate information from official government sources. RETURN JSON ONLY.`;

      const text = await generateContent(prompt);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const details = JSON.parse(jsonMatch[0]);
        setSchemeDetails(details);
      } else {
        console.error("Failed to parse scheme details JSON:", text);
        throw new Error("Failed to parse scheme details");
      }
    } catch (err) {
      console.error("Error fetching scheme details:", err);
      setError("Failed to load scheme details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSchemeClick = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    fetchSchemeDetails(scheme);
  };

  const handleApplyNow = () => {
    if (schemeDetails?.officialApplicationUrl) {
      window.open(
        schemeDetails.officialApplicationUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (selectedScheme?.applicationUrl) {
      window.open(
        selectedScheme.applicationUrl,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    fetchSchemes(categoryId === selectedCategory ? undefined : categoryId);
  };

  const handleLifeEventSearch = async () => {
    if (!lifeEventQuery.trim()) return;

    setLoadingLifeEvent(true);
    try {
      const results = await schemesService.searchByLifeEvent(lifeEventQuery);
      setLifeEventResults(results);

      // Also fetch full scheme details for the recommendations
      if (results.length > 0) {
        const schemeNames = results.map((r: any) => r.scheme);
        // Could fetch details for all recommended schemes here
      }
    } catch (error) {
      console.error("Life event search error:", error);
      setError("Failed to search for schemes based on your situation");
    } finally {
      setLoadingLifeEvent(false);
    }
  };

  const handleLifeEventSchemeClick = async (schemeName: string) => {
    // Try to find the scheme in existing list or fetch new details
    const existingScheme = schemes.find(
      (s) => s.name.toLowerCase() === schemeName.toLowerCase(),
    );

    if (existingScheme) {
      handleSchemeClick(existingScheme);
    } else {
      // Create a temporary scheme object and fetch details
      const tempScheme: Scheme = {
        id: `life-event-${Date.now()}`,
        name: schemeName,
        category: "Various",
        benefits: "View details for more information",
        status: "Active",
        deadline: "Check details",
      };
      setSelectedScheme(tempScheme);
      fetchSchemeDetails(tempScheme);
    }
  };

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.benefits.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const popularSchemes = filteredSchemes.slice(0, 5);

  // Show life event results if available, otherwise show popular schemes
  const displaySchemes = lifeEventResults.length > 0 ? [] : popularSchemes;
  const showLifeEventResultsAsMain = lifeEventResults.length > 0;

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
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 cursor-pointer transition-all ${
                selectedCategory === cat.id ? "ring-2 ring-primary" : ""
              }`}
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
              <span className="text-sm font-medium text-foreground">
                {cat.label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular Schemes or Life Event Results */}
      {!loading && !error && !showAllSchemes && (
        <div className="py-4">
          {showLifeEventResultsAsMain ? (
            /* Life Event Results as Main Content */
            <>
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-base font-semibold text-foreground">
                  Recommended for Your Situation ({lifeEventResults.length})
                </h2>
                <button
                  onClick={() => {
                    setLifeEventResults([]);
                    setLifeEventQuery("");
                  }}
                  className="text-sm text-muted-foreground font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
              <div className="px-4 space-y-3">
                {lifeEventResults.map((result: any, idx: number) => (
                  <Card
                    key={idx}
                    variant="elevated"
                    size="default"
                    onClick={() => handleLifeEventSchemeClick(result.scheme)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          result.priority === "high"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-warning/10 text-warning border-warning/30"
                        }`}
                      >
                        {result.priority} priority
                      </Badge>
                      {result.category && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/10 text-primary border-primary/30"
                        >
                          {result.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">
                      {result.scheme}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.relevance}
                    </p>
                    {result.keyBenefits && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Key Benefits:</span>{" "}
                        {result.keyBenefits}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLifeEventSchemeClick(result.scheme);
                      }}
                      className="mt-3"
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            /* Normal Popular Schemes Carousel */
            <>
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-base font-semibold text-foreground">
                  {selectedCategory
                    ? `${selectedCategory} Schemes`
                    : "Popular Schemes"}
                </h2>
                <button
                  onClick={() => setShowAllSchemes(true)}
                  className="text-sm text-primary font-medium flex items-center gap-1"
                >
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
                    className="flex-shrink-0 w-[75%] snap-center cursor-pointer"
                    onClick={() => handleSchemeClick(scheme)}
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
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSchemeClick(scheme);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* All Schemes List View */}
      {!loading && !error && showAllSchemes && (
        <div className="px-4 py-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              All Schemes ({filteredSchemes.length})
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAllSchemes(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {filteredSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                variant="elevated"
                size="default"
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSchemeClick(scheme)}
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
                <h3 className="font-semibold text-foreground text-base mb-1">
                  {scheme.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {scheme.benefits}
                </p>
                {scheme.eligibility && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Eligibility:</span>{" "}
                    {scheme.eligibility}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Deadline: {scheme.deadline}
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSchemeClick(scheme);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* My Applications */}
      {!showAllSchemes && (
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
      )}

      {/* Scheme Details Popup/Modal */}
      {selectedScheme && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setSelectedScheme(null);
            setSchemeDetails(null);
          }}
        >
          <div
            className="bg-background w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground pr-8">
                {selectedScheme.name}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedScheme(null);
                  setSchemeDetails(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : schemeDetails ? (
                <>
                  {/* Status and Category */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      {selectedScheme.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30"
                    >
                      {selectedScheme.status}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Description
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {schemeDetails.fullDescription}
                    </p>
                  </div>

                  {/* Objectives */}
                  {schemeDetails.objectives?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Objectives
                        </h3>
                      </div>
                      <ul className="space-y-1">
                        {schemeDetails.objectives.map((obj, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Benefits
                      </h3>
                    </div>
                    {schemeDetails.benefits.monetary && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Monetary:</span>{" "}
                        {schemeDetails.benefits.monetary}
                      </p>
                    )}
                    {schemeDetails.benefits.nonMonetary?.length > 0 && (
                      <ul className="space-y-1">
                        {schemeDetails.benefits.nonMonetary.map(
                          (benefit, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{benefit}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Eligibility */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Eligibility Criteria
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {schemeDetails.eligibilityCriteria.age && (
                        <p>
                          <span className="font-medium">Age:</span>{" "}
                          {schemeDetails.eligibilityCriteria.age}
                        </p>
                      )}
                      {schemeDetails.eligibilityCriteria.income && (
                        <p>
                          <span className="font-medium">Income:</span>{" "}
                          {schemeDetails.eligibilityCriteria.income}
                        </p>
                      )}
                      {schemeDetails.eligibilityCriteria.location && (
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {schemeDetails.eligibilityCriteria.location}
                        </p>
                      )}
                      {schemeDetails.eligibilityCriteria.other?.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {schemeDetails.eligibilityCriteria.other.map(
                            (criteria, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{criteria}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Required Documents */}
                  {schemeDetails.requiredDocuments?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Required Documents
                        </h3>
                      </div>
                      <ul className="space-y-1">
                        {schemeDetails.requiredDocuments.map((doc, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Application Process */}
                  {schemeDetails.applicationProcess?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronRight className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          How to Apply
                        </h3>
                      </div>
                      <ol className="space-y-2">
                        {schemeDetails.applicationProcess.map((step) => (
                          <li
                            key={step.step}
                            className="text-sm text-muted-foreground flex gap-3"
                          >
                            <span className="font-semibold text-primary min-w-[24px]">
                              {step.step}.
                            </span>
                            <span>{step.description}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Important Dates */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Important Dates
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {schemeDetails.importantDates.startDate && (
                        <p>
                          <span className="font-medium">Start Date:</span>{" "}
                          {schemeDetails.importantDates.startDate}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Deadline:</span>{" "}
                        {schemeDetails.importantDates.deadline}
                      </p>
                      {schemeDetails.importantDates.lastUpdated && (
                        <p>
                          <span className="font-medium">Last Updated:</span>{" "}
                          {schemeDetails.importantDates.lastUpdated}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Contact Information
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {schemeDetails.contactInfo.helpline && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{schemeDetails.contactInfo.helpline}</span>
                        </div>
                      )}
                      {schemeDetails.contactInfo.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <span>{schemeDetails.contactInfo.email}</span>
                        </div>
                      )}
                      {schemeDetails.contactInfo.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          <a
                            href={schemeDetails.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {schemeDetails.contactInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-4 px-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleApplyNow}
                      disabled={!schemeDetails.officialApplicationUrl}
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    {!schemeDetails.officialApplicationUrl && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Application URL not available
                      </p>
                    )}
                  </div>
                  <div className="h-6"></div>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No details available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
