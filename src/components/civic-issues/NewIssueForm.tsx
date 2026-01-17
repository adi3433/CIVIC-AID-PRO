/**
 * New Issue Submission Component
 * 
 * Multi-step form for submitting civic issues:
 * 1. Photo capture
 * 2. Category & type selection
 * 3. Severity & details
 * 4. Location confirmation
 * 5. Review & submit
 */

import { useState, useEffect } from "react";
import {
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  IssueCategory,
  IssueType,
  IssueSeverity,
  IssueLocation,
} from "@/types/civicIssue";
import {
  ISSUE_CATEGORIES,
  ISSUE_TYPES,
  SEVERITY_LEVELS,
  getIssueTypesByCategory,
} from "@/lib/issueConfig";
import { getCurrentLocation, formatLocation } from "@/lib/locationService";
import { capturePhoto, selectFromGallery, createPreviewURL } from "@/lib/photoService";
import { submitIssue } from "@/lib/issueService";
import { analyzeIssuePhoto, AIAnalysisResult } from "@/lib/issueAnalysisService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "photo" | "category" | "details" | "location" | "review";

export function NewIssueForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>("photo");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<IssueLocation | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps: Step[] = ["photo", "category", "details", "location", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Auto-load location when component mounts
  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    setIsLoadingLocation(true);
    const result = await getCurrentLocation();
    setIsLoadingLocation(false);

    if (result.success && result.location) {
      setLocation(result.location);
    } else {
      toast.error(result.error || "Failed to get location");
    }
  };

  const handlePhotoCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      addPhoto(file);
    }
  };

  const handleGallerySelect = async () => {
    const files = await selectFromGallery(true);
    files.forEach(addPhoto);
  };

  const addPhoto = (file: File) => {
    if (photos.length >= 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    
    setPhotos((prev) => [...prev, file]);
    const previewUrl = createPreviewURL(file);
    setPhotoPreviewUrls((prev) => [...prev, previewUrl]);
    
    // Trigger AI analysis on the first photo added
    if (photos.length === 0) {
      handleAiAnalysis(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAiAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    toast.info("AI is analyzing the photo...", {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    });

    const result = await analyzeIssuePhoto(file);

    if (result.success && result.data) {
      const { category, issueType, severity, title, description } = result.data;
      setCategory(category);
      setIssueType(issueType);
      setSeverity(severity);
      setTitle(title);
      setDescription(description);
      
      toast.success("AI analysis complete!", {
        description: "The form has been pre-filled for you.",
      });
      
      // Automatically move to the next step for review
      setCurrentStep("category");
    } else {
      toast.error("AI Analysis Failed", {
        description: result.error || "Could not analyze the photo.",
      });
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!user || !category || !issueType || !location) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitIssue(
        {
          category,
          issue_type: issueType,
          severity,
          title,
          description,
          location,
          photos,
          is_anonymous: isAnonymous,
        },
        user.id,
        user.user_metadata?.full_name
      );

      if (result.success) {
        toast.success("Issue reported successfully!", {
          description: `Issue #${result.issue?.issue_number}`,
        });
        
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(warning);
          });
        }
        
        onSuccess?.();
      } else {
        setError(result.error || "Failed to submit issue");
        toast.error(result.error || "Failed to submit issue");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unexpected error";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "photo":
        return photos.length > 0;
      case "category":
        return category !== null && issueType !== null;
      case "details":
        return title.trim().length >= 10;
      case "location":
        return location !== null;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b flex-shrink-0">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Report New Issue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <Progress value={progress} className="h-2 mt-3" />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Photo */}
        {currentStep === "photo" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add Photos</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Take or upload photos of the issue (1-5 photos required)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePhotoCapture}
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                disabled={isAnalyzing}
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm">Take Photo</span>
              </Button>
              <Button
                onClick={handleGallerySelect}
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                disabled={isAnalyzing}
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">From Gallery</span>
              </Button>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing photo... please wait.</span>
              </div>
            )}

            {photoPreviewUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Photos ({photos.length}/5)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photos.length === 0 && (
              <Alert variant="default" className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Please add at least one photo to proceed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Category & Type */}
        {currentStep === "category" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Select Category</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the type of issue you're reporting
              </p>
            </div>

            <div className="space-y-3">
              {Object.values(ISSUE_CATEGORIES).map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card
                    key={cat.id}
                    variant={category === cat.id ? "primary" : "interactive"}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setCategory(cat.id);
                      setIssueType(null); // Reset issue type when category changes
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category === cat.id ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                        <Icon className={`w-5 h-5 ${category === cat.id ? 'text-primary-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${category === cat.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {cat.label}
                        </p>
                        <p className={`text-xs ${category === cat.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {cat.description}
                        </p>
                      </div>
                      {category === cat.id && (
                        <CheckCircle className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {category && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Select Issue Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getIssueTypesByCategory(category).map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card
                        key={type.id}
                        variant={issueType === type.id ? "primary" : "interactive"}
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setIssueType(type.id)}
                      >
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Icon className={`w-5 h-5 ${issueType === type.id ? 'text-primary-foreground' : 'text-primary'}`} />
                          <p className={`text-xs text-center font-medium ${issueType === type.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {type.label}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === "details" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Issue Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Provide information about the issue
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.values(SEVERITY_LEVELS).map((level) => (
                    <Card
                      key={level.id}
                      variant={severity === level.id ? "primary" : "interactive"}
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => setSeverity(level.id)}
                    >
                      <div className="text-center py-2">
                        <p className={`font-medium ${severity === level.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {level.label}
                        </p>
                        <p className={`text-xs mt-1 ${severity === level.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {level.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description (min 10 characters)"
                  className="mt-2"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details about the issue..."
                  className="mt-2"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {currentStep === "location" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Location</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Verify the issue location
              </p>
            </div>

            {isLoadingLocation ? (
              <Card variant="default" size="sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Getting your location...</p>
                </div>
              </Card>
            ) : location ? (
              <Card variant="default" size="sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {formatLocation(location)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card variant="destructive" size="sm">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">Could not determine location.</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Review & Submit */}
        {currentStep === "review" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please review the information before submitting.
              </p>
            </div>

            <Card variant="default" size="lg" className="space-y-4">
              {/* Photos */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Photos</h3>
                <div className="grid grid-cols-4 gap-2">
                  {photoPreviewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-auto object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Details</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">Category:</span> {category ? ISSUE_CATEGORIES[category]?.label : 'N/A'}</p>
                  <p><span className="font-semibold">Type:</span> {issueType ? ISSUE_TYPES[issueType]?.label : 'N/A'}</p>
                  <p><span className="font-semibold">Severity:</span> {SEVERITY_LEVELS[severity]?.label}</p>
                  <p><span className="font-semibold">Title:</span> {title}</p>
                  {description && <p><span className="font-semibold">Description:</span> {description}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Location</h3>
                <p className="text-sm">{location ? formatLocation(location) : "No location set"}</p>
              </div>

              {/* Reporter */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Reporter</h3>
                <p className="text-sm">{isAnonymous ? "Anonymous" : (user?.user_metadata?.full_name || user?.email)}</p>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="anonymous" className="ml-2 block text-sm text-muted-foreground">
                    Submit Anonymously
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 bg-background border-t p-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Submit Issue
          </Button>
        ) : (
          <Button onClick={nextStep} disabled={!canProceed()}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
