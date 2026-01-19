import { useState } from "react";
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  Car,
  FileText,
  Gavel,
  ChevronRight,
  Copy,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Official rates database (in production, this would come from an API)
const officialRatesDatabase = [
  // Traffic Fines
  {
    id: "TF001",
    category: "Traffic Violation",
    violation: "No Helmet",
    officialFee: 1000,
    keywords: ["helmet", "head", "protection", "bike", "motorcycle"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 129",
  },
  {
    id: "TF002",
    category: "Traffic Violation",
    violation: "No Seat Belt",
    officialFee: 1000,
    keywords: ["seat belt", "seatbelt", "belt", "car", "safety"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 138(3)",
  },
  {
    id: "TF003",
    category: "Traffic Violation",
    violation: "Driving without License",
    officialFee: 5000,
    keywords: ["license", "driving license", "dl", "permit"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 181",
  },
  {
    id: "TF004",
    category: "Traffic Violation",
    violation: "Overspeeding",
    officialFee: 2000,
    keywords: ["speed", "overspeeding", "fast", "speeding"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 183",
  },
  {
    id: "TF005",
    category: "Traffic Violation",
    violation: "Red Light Jumping",
    officialFee: 1000,
    keywords: ["red light", "signal", "traffic light", "jump"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 177",
  },
  {
    id: "TF006",
    category: "Traffic Violation",
    violation: "Wrong Side Driving",
    officialFee: 10000,
    keywords: ["wrong side", "wrong way", "opposite", "reverse"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 184",
  },
  {
    id: "TF007",
    category: "Traffic Violation",
    violation: "No Insurance",
    officialFee: 2000,
    keywords: ["insurance", "policy", "third party"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 196",
  },
  {
    id: "TF008",
    category: "Traffic Violation",
    violation: "Triple Riding",
    officialFee: 1000,
    keywords: ["triple", "three", "riding", "bike", "motorcycle"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 177",
  },
  {
    id: "TF009",
    category: "Traffic Violation",
    violation: "Drunk Driving",
    officialFee: 10000,
    keywords: ["drunk", "alcohol", "drink", "driving", "dui"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 185",
  },
  {
    id: "TF010",
    category: "Traffic Violation",
    violation: "Mobile Phone While Driving",
    officialFee: 5000,
    keywords: ["mobile", "phone", "call", "texting", "driving"],
    authority: "Motor Vehicles Act, 1988",
    section: "Section 177",
  },

  // Document Fees
  {
    id: "DOC001",
    category: "Document Fee",
    violation: "Driving License Application",
    officialFee: 200,
    keywords: ["dl", "driving license", "license application"],
    authority: "Transport Department",
    section: "Standard Fee",
  },
  {
    id: "DOC002",
    category: "Document Fee",
    violation: "Passport Application (Fresh)",
    officialFee: 1500,
    keywords: ["passport", "new passport", "fresh passport"],
    authority: "Ministry of External Affairs",
    section: "Standard Fee",
  },
  {
    id: "DOC003",
    category: "Document Fee",
    violation: "PAN Card Application",
    officialFee: 107,
    keywords: ["pan", "pan card", "permanent account number"],
    authority: "Income Tax Department",
    section: "Standard Fee",
  },
  {
    id: "DOC004",
    category: "Document Fee",
    violation: "Birth Certificate",
    officialFee: 50,
    keywords: ["birth", "birth certificate", "certificate"],
    authority: "Municipal Corporation",
    section: "Standard Fee",
  },
  {
    id: "DOC005",
    category: "Document Fee",
    violation: "Marriage Certificate",
    officialFee: 100,
    keywords: ["marriage", "marriage certificate", "wedding"],
    authority: "Municipal Corporation",
    section: "Standard Fee",
  },

  // Court Fees
  {
    id: "CT001",
    category: "Court Fee",
    violation: "Civil Suit Filing (up to ₹1 lakh)",
    officialFee: 500,
    keywords: ["court", "civil", "suit", "filing"],
    authority: "Court Fee Act",
    section: "Schedule I",
  },
  {
    id: "CT002",
    category: "Court Fee",
    violation: "Vakalatnama (Lawyer Authorization)",
    officialFee: 20,
    keywords: ["vakalatnama", "lawyer", "authorization", "power of attorney"],
    authority: "Court Fee Act",
    section: "Schedule I",
  },

  // Property Tax
  {
    id: "PT001",
    category: "Property Tax",
    violation: "Property Registration (up to ₹50 lakh)",
    officialFee: 30000,
    keywords: ["property", "registration", "stamp duty", "deed"],
    authority: "State Revenue Department",
    section: "Stamp Duty Act",
  },
];

export default function AntiBribery() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(officialRatesDatabase);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(officialRatesDatabase);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = officialRatesDatabase.filter(
      (item) =>
        item.violation.toLowerCase().includes(lowercaseQuery) ||
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(lowercaseQuery),
        ) ||
        item.category.toLowerCase().includes(lowercaseQuery) ||
        item.id.toLowerCase().includes(lowercaseQuery),
    );

    setSearchResults(filtered);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Official rate copied to clipboard",
      duration: 2000,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Traffic Violation":
        return Car;
      case "Document Fee":
        return FileText;
      case "Court Fee":
        return Gavel;
      case "Property Tax":
        return FileText;
      default:
        return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Traffic Violation":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "Document Fee":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Court Fee":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "Property Tax":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Anti-Bribery</h1>
            <p className="text-muted-foreground text-sm">
              Verify official rates & report overcharging
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search fines, fees, documents..."
            className="pl-10"
            data-agent-id="antibribery-search-input"
          />
        </div>
      </div>

      {/* Info Alert */}
      <div className="px-4 pt-4">
        <Card variant="warning" className="bg-warning/10 border-warning/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Know Your Rights
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                If an officer asks for more than the official rate, it's
                bribery. Report it immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Bribery Button */}
      <div className="px-4 pt-3 pb-4">
        <Sheet open={reportSheetOpen} onOpenChange={setReportSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" data-agent-id="antibribery-report-btn">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Bribery
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Report Bribery
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-3 pt-6 pb-4">
              <Button
                className="w-full h-14 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base"
                onClick={() => {
                  window.location.href = "tel:1031";
                  setReportSheetOpen(false);
                }}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Anti-Corruption Helpline: 1031
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 border-2 text-base"
                onClick={() => {
                  toast({
                    title: "Opening Report Form",
                    description: "File an online complaint",
                    duration: 2000,
                  });
                  setReportSheetOpen(false);
                }}
              >
                <FileText className="w-5 h-5 mr-2" />
                File Online Complaint
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results */}
      <div className="px-4 pb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Official Rates Database
        </h2>

        {searchResults.length === 0 ? (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No results found for "{searchQuery}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try different keywords
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {searchResults.map((item) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <Card
                  key={item.id}
                  className="border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm">
                            {item.violation}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.authority}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(item.category)}
                      >
                        {item.id}
                      </Badge>
                    </div>

                    {/* Official Fee */}
                    <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Official Fee
                        </p>
                        <p className="text-2xl font-bold text-success flex items-center gap-2">
                          ₹{item.officialFee.toLocaleString()}
                          <CheckCircle className="w-5 h-5" />
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            `Official Fee: ₹${item.officialFee}\nViolation: ${item.violation}\nAuthority: ${item.authority}\nSection: ${item.section}`,
                          )
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.section}
                      </span>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
