import { useState, useRef, useEffect } from "react";
import { Camera, MapPin, Construction, Trash2, Lightbulb, Droplets, Volume2, CloudRain, ChevronRight, Clock, CheckCircle2, AlertCircle, Sparkles, Loader2, Upload, Send, X, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { analyzeImageWithAI } from "@/lib/geminiService";
import { Textarea } from "@/components/ui/textarea";
import { submitReport, getUserReports, getNearbyReports, upvoteReport, downvoteReport } from "@/lib/reportService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Report as ReportType } from "@/lib/supabase";

const categories = [
  { id: "pothole", icon: Construction, label: "Potholes", color: "primary" },
  { id: "garbage", icon: Trash2, label: "Garbage", color: "success" },
  { id: "streetlight", icon: Lightbulb, label: "Streetlights", color: "warning" },
  { id: "drainage", icon: CloudRain, label: "Drainage", color: "info" },
  { id: "water", icon: Droplets, label: "Water Leaks", color: "secondary" },
  { id: "noise", icon: Volume2, label: "Noise", color: "destructive" },
];



const statusConfig = {
  reported: { label: "Reported", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-info/10 text-info border-info/30", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
};

export default function Report() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("new");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState<ReportType[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [votingReport, setVotingReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's reports when switching to "My Reports" tab
  useEffect(() => {
    if (activeTab === "my" && user?.id) {
      fetchUserReports();
    }
  }, [activeTab, user?.id]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location",
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, []);

  // Fetch nearby reports when location is available
  useEffect(() => {
    if (location && activeTab === "new" && user?.id) {
      fetchNearbyReports();
    }
  }, [location, activeTab, user?.id]);

  const fetchNearbyReports = async () => {
    if (!location || !user?.id) return;
    
    setLoadingNearby(true);
    try {
      const result = await getNearbyReports(
        location.lat,
        location.lng,
        5, // 5km radius
        user.id
      );
      if (result.success && result.reports) {
        setNearbyReports(result.reports);
      }
    } catch (error) {
      console.error("Failed to fetch nearby reports:", error);
    } finally {
      setLoadingNearby(false);
    }
  };

  const fetchUserReports = async () => {
    if (!user?.id) return;
    
    setLoadingReports(true);
    try {
      const result = await getUserReports(user.id);
      if (result.success && result.reports) {
        setMyReports(result.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        await analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setAnalyzing(true);
    setDetectedCategory(null);
    try {
      const result = await analyzeImageWithAI(base64);
      setDetectedCategory(result.category);
      setDescription(result.description);
      toast({
        title: "Analysis Complete",
        description: "Issue detected and categorized successfully",
      });
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze image. Please try again.",
        variant: "destructive", 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a report",
        variant: "destructive",
      });
      return;
    }

    if (!detectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a category for your report",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description",
        variant: "destructive",
      });
      return;
    }

    // For manual mode, require description; for photo mode, photo is optional now
    if (isManualMode && !description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for manual report",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const categoryObj = categories.find(c => c.id === detectedCategory);
      const title = `${categoryObj?.label || "Issue"} report`;

      const result = await submitReport({
        userId: user.id,
        title,
        description,
        category: detectedCategory as any,
        imageBase64: selectedImage || undefined,
        latitude: location?.lat,
        longitude: location?.lng,
        locationName: location?.name,
      });

      if (result.success) {
        toast({
          title: "Report Submitted",
          description: "Your report has been submitted successfully",
        });
        
        // Reset form
        setSelectedImage(null);
        setDetectedCategory(null);
        setDescription("");
        setIsManualMode(false);
        
        // Switch to My Reports tab
        setActiveTab("my");
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpvote = async (reportId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }

    setVotingReport(reportId);
    try {
      const result = await upvoteReport(reportId, user.id);
      if (result.success) {
        // Refresh nearby reports to get updated counts
        await fetchNearbyReports();
        toast({
          title: result.action === "added" ? "Upvoted" : "Upvote removed",
          description: result.action === "added" ? "You upvoted this report" : "Your upvote was removed",
        });
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "Failed to upvote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upvote error:", error);
      toast({
        title: "Vote Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setVotingReport(null);
    }
  };

  const handleDownvote = async (reportId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }

    setVotingReport(reportId);
    try {
      const result = await downvoteReport(reportId, user.id);
      if (result.success) {
        // Refresh nearby reports to get updated counts
        await fetchNearbyReports();
        toast({
          title: result.action === "added" ? "Downvoted" : "Downvote removed",
          description: result.action === "added" ? "You downvoted this report" : "Your downvote was removed",
        });
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "Failed to downvote",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Downvote error:", error);
      toast({
        title: "Vote Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setVotingReport(null);
    }
  };
  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Report Issues</h1>
        <p className="text-muted-foreground text-sm mt-1">Help improve your community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="new">New Report</TabsTrigger>
          <TabsTrigger value="my">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-0 pb-20">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <input
            type="file"
            ref={manualFileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleManualFileSelect}
          />

          {/* AI Analysis Option */}
          <Card
            variant="primary"
            className="relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
            onClick={() => {
              setIsManualMode(false);
              fileInputRef.current?.click();
            }}
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-xl">
                {analyzing ? (
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                ) : selectedImage && !isManualMode ? (
                  <img src={selectedImage} alt="Selected" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground text-lg">
                  {analyzing ? "Analyzing Image..." : selectedImage && !isManualMode ? "Photo Selected" : "AI Analysis"}
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  {analyzing ? "Identifying issues..." : "Upload photo - AI detects issue automatically"}
                </p>
              </div>
              {!analyzing && <ChevronRight className="w-6 h-6 text-primary-foreground/80" />}
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-foreground/10 rounded-full" />
          </Card>

          {/* Manual Input Option */}
          <Card
            variant="interactive"
            className="relative overflow-hidden cursor-pointer active:scale-95 transition-transform border-2"
            onClick={() => {
              setIsManualMode(true);
              setSelectedImage(null);
              setAnalyzing(false);
              setDetectedCategory(null);
              setDescription("");
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                {selectedImage && isManualMode ? (
                  <img src={selectedImage} alt="Selected" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {selectedImage && isManualMode ? "Photo Selected" : "Manual Report"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {selectedImage && isManualMode ? "Add category and description manually" : "Upload photo and write details manually"}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
          </Card>

          {/* Manual Mode Photo Upload Button */}
          {isManualMode && !selectedImage && (
            <Card variant="default" size="sm" className="flex items-center gap-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  manualFileInputRef.current?.click();
                }}
                className="w-full"
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo (Optional)
              </Button>
            </Card>
          )}

          {/* Show uploaded photo in manual mode */}
          {isManualMode && selectedImage && (
            <Card variant="default" size="sm">
              <div className="flex items-center gap-3">
                <img src={selectedImage} alt="Uploaded" className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Photo Uploaded</p>
                  <p className="text-xs text-muted-foreground">Ready for manual input</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {analyzing && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center animate-pulse">
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-medium">Vision AI is scanning your photo...</p>
            </div>
          )}

          {detectedCategory && !isManualMode && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Issue Detected: {detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1)}</p>
                <p className="text-xs text-green-700 mt-1">We've auto-selected the category for you.</p>
              </div>
            </div>
          )}

          {/* Show category selection for both modes */}
          {(detectedCategory || isManualMode) && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">Select Category</h2>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <Card
                    key={cat.id}
                    variant="interactive"
                    size="sm"
                    className={`flex flex-col items-center gap-2 py-4 border-2 ${detectedCategory === cat.id ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    onClick={() => setDetectedCategory(cat.id)}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${cat.color === "primary"
                          ? "bg-primary/10"
                          : cat.color === "success"
                            ? "bg-success/10"
                            : cat.color === "warning"
                              ? "bg-warning/10"
                              : cat.color === "info"
                                ? "bg-info/10"
                                : cat.color === "secondary"
                                  ? "bg-secondary/10"
                                  : "bg-destructive/10"
                        }`}
                    >
                      <cat.icon
                        className={`w-5 h-5 ${cat.color === "primary"
                            ? "text-primary"
                            : cat.color === "success"
                              ? "text-success"
                              : cat.color === "warning"
                                ? "text-warning"
                                : cat.color === "info"
                                  ? "text-info"
                                  : cat.color === "secondary"
                                    ? "text-secondary"
                                    : "text-destructive"
                          }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center line-clamp-1">{cat.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Show description for both modes */}
          {(description || isManualMode) && detectedCategory && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24"
                placeholder="Add additional details..."
              />
              <div className="flex justify-end">
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleSubmitReport}
                  disabled={submitting || !detectedCategory || !description.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <Card variant="default" size="sm" className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Auto-detect Location</p>
              <p className="text-xs text-muted-foreground">
                {location ? location.name : "Detecting location..."}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {location ? "Enabled" : "Detecting..."}
            </Badge>
          </Card>

          {/* Nearby Reports Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Nearby Reports</h2>
              <Badge variant="secondary" className="text-xs">
                Within 5km
              </Badge>
            </div>

            {loadingNearby ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Finding nearby reports...</p>
              </div>
            ) : nearbyReports.length === 0 ? (
              <Card variant="default" size="sm" className="text-center py-8">
                <Construction className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No nearby reports</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No issues reported in your area yet
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {nearbyReports.map((report) => {
                  const categoryObj = categories.find(c => c.id === report.category);
                  const CategoryIcon = categoryObj?.icon || Construction;
                  const timeAgo = (() => {
                    const now = new Date();
                    const reportDate = new Date(report.created_at);
                    const diffMs = now.getTime() - reportDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);
                    
                    if (diffMins < 60) return `${diffMins}m ago`;
                    if (diffHours < 24) return `${diffHours}h ago`;
                    return `${diffDays}d ago`;
                  })();

                  return (
                    <Card 
                      key={report.id} 
                      variant="interactive" 
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {report.photo_urls && report.photo_urls.length > 0 ? (
                            <img 
                              src={report.photo_urls[0]} 
                              alt="Report" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <CategoryIcon className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {categoryObj?.label || report.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {report.distance.toFixed(1)}km • {timeAgo}
                            </span>
                          </div>
                          
                          <p className="text-sm text-foreground line-clamp-2 mb-2">
                            {report.description}
                          </p>

                          {/* Vote Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpvote(report.id);
                              }}
                              disabled={votingReport === report.id}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">{report.upvotes || 0}</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownvote(report.id);
                              }}
                              disabled={votingReport === report.id}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">{report.downvotes || 0}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-3 mt-0 pb-20">
          {loadingReports ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading your reports...</p>
            </div>
          ) : myReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Construction className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Reports Yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Start reporting issues in your community
              </p>
              <Button onClick={() => setActiveTab("new")}>Create Report</Button>
            </div>
          ) : (
            myReports.map((report) => {
              const status = statusConfig[report.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              const categoryObj = categories.find(c => c.id === report.category);
              const date = new Date(report.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <Card 
                  key={report.id} 
                  variant="interactive" 
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {report.photo_urls && report.photo_urls.length > 0 ? (
                        <img 
                          src={report.photo_urls[0]} 
                          alt="Report" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Construction className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">{report.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {categoryObj?.label || report.category} • {date}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        {report.eta_days && (
                          <span className="text-xs text-muted-foreground">
                            ETA: {report.eta_days} {report.eta_days === 1 ? "day" : "days"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Report Details Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (() => {
            const status = statusConfig[selectedReport.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const categoryObj = categories.find(c => c.id === selectedReport.category);
            const CategoryIcon = categoryObj?.icon || Construction;
            const date = new Date(selectedReport.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const time = new Date(selectedReport.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      categoryObj?.color === "primary" ? "bg-primary/10" :
                      categoryObj?.color === "success" ? "bg-success/10" :
                      categoryObj?.color === "warning" ? "bg-warning/10" :
                      categoryObj?.color === "info" ? "bg-info/10" :
                      categoryObj?.color === "secondary" ? "bg-secondary/10" :
                      "bg-destructive/10"
                    }`}>
                      <CategoryIcon className={`w-5 h-5 ${
                        categoryObj?.color === "primary" ? "text-primary" :
                        categoryObj?.color === "success" ? "text-success" :
                        categoryObj?.color === "warning" ? "text-warning" :
                        categoryObj?.color === "info" ? "text-info" :
                        categoryObj?.color === "secondary" ? "text-secondary" :
                        "text-destructive"
                      }`} />
                    </div>
                    {selectedReport.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${status.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    {selectedReport.eta_days && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        ETA: {selectedReport.eta_days} {selectedReport.eta_days === 1 ? "day" : "days"}
                      </Badge>
                    )}
                  </div>

                  {/* Image */}
                  {selectedReport.photo_urls && selectedReport.photo_urls.length > 0 && (
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={selectedReport.photo_urls[0]}
                        alt={selectedReport.title}
                        className="w-full h-auto max-h-96 object-contain bg-muted"
                      />
                    </div>
                  )}

                  {/* Category */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-muted-foreground">Category:</span>
                    <Badge variant="secondary">{categoryObj?.label || selectedReport.category}</Badge>
                  </div>

                  {/* Description */}
                  {selectedReport.description && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                        {selectedReport.description}
                      </p>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="flex items-start gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">{date}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{time}</p>
                    </div>
                  </div>

                  {/* Location */}
                  {(selectedReport.location_name || selectedReport.latitude) && (
                    <div className="flex items-start gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        {selectedReport.location_name && (
                          <p className="font-semibold text-foreground">{selectedReport.location_name}</p>
                        )}
                        {selectedReport.latitude && selectedReport.longitude && (
                          <p className="text-muted-foreground text-xs mt-0.5">
                            Coordinates: {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Report ID */}
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Report ID: {selectedReport.id}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
