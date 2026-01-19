import { useState } from "react";
import {
  ArrowLeft,
  MapIcon,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApplicationStep {
  step: number;
  title: string;
  status: "completed" | "current" | "pending";
  description: string;
  estimatedTime?: string;
}

interface Application {
  id: string;
  type: string;
  title: string;
  applicationId: string;
  currentStep: number;
  totalSteps: number;
  status: "in_progress" | "pending_documents" | "under_review" | "approved";
  submittedDate: string;
  steps: ApplicationStep[];
}

const myApplications: Application[] = [
  {
    id: "app1",
    type: "Property",
    title: "Building Permit Application",
    applicationId: "BP/2026/001234",
    currentStep: 2,
    totalSteps: 5,
    status: "in_progress",
    submittedDate: "Jan 10, 2026",
    steps: [
      {
        step: 1,
        title: "Application Submitted",
        status: "completed",
        description: "Your application has been received",
        estimatedTime: "Completed",
      },
      {
        step: 2,
        title: "Document Verification",
        status: "current",
        description: "Documents are being verified by the office",
        estimatedTime: "2-3 days",
      },
      {
        step: 3,
        title: "Site Inspection",
        status: "pending",
        description: "Site inspection will be scheduled",
        estimatedTime: "5-7 days",
      },
      {
        step: 4,
        title: "Approval Review",
        status: "pending",
        description: "Final review by authorities",
        estimatedTime: "3-5 days",
      },
      {
        step: 5,
        title: "Permit Issued",
        status: "pending",
        description: "Permit will be issued and ready for collection",
        estimatedTime: "1-2 days",
      },
    ],
  },
  {
    id: "app2",
    type: "Scheme",
    title: "PM Awas Yojana Application",
    applicationId: "PMAY/2026/005678",
    currentStep: 4,
    totalSteps: 5,
    status: "under_review",
    submittedDate: "Dec 20, 2025",
    steps: [
      {
        step: 1,
        title: "Application Submitted",
        status: "completed",
        description: "Application received online",
      },
      {
        step: 2,
        title: "Eligibility Check",
        status: "completed",
        description: "Eligibility criteria verified",
      },
      {
        step: 3,
        title: "Document Submission",
        status: "completed",
        description: "All documents submitted and accepted",
      },
      {
        step: 4,
        title: "Final Verification",
        status: "current",
        description: "Under final review by district office",
        estimatedTime: "7-10 days",
      },
      {
        step: 5,
        title: "Approval & Disbursement",
        status: "pending",
        description: "Approval and fund disbursement",
        estimatedTime: "15-20 days",
      },
    ],
  },
];

const statusConfig = {
  in_progress: {
    label: "In Progress",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  },
  pending_documents: {
    label: "Pending Documents",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  },
  under_review: {
    label: "Under Review",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  },
  approved: {
    label: "Approved",
    color: "bg-green-500/10 text-green-500 border-green-500/30",
  },
};

export default function ProcessNavigator() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const filteredApplications = myApplications.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <MapIcon className="w-6 h-6 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">
              Process Navigator
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Track your applications and next steps
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-agent-id="application-search-input"
          />
        </div>
      </div>

      {/* Applications */}
      <div className="px-4 space-y-3">
        {filteredApplications.map((app) => (
          <Card key={app.id} variant="default" className="p-4" data-agent-id={`application-card-${app.id}`}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {app.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{app.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {app.applicationId} • {app.submittedDate}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusConfig[app.status].color}
                >
                  {statusConfig[app.status].label}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    Step {app.currentStep} of {app.totalSteps}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${(app.currentStep / app.totalSteps) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  setSelectedApp(selectedApp === app.id ? null : app.id)
                }
                data-agent-id={`view-steps-btn-${app.id}`}
              >
                {selectedApp === app.id ? "Hide Steps" : "View Steps"}
              </Button>

              {/* Steps */}
              {selectedApp === app.id && (
                <div className="space-y-3 pt-3 border-t border-border">
                  {app.steps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === "completed"
                              ? "bg-green-500 text-white"
                              : step.status === "current"
                                ? "bg-blue-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : step.status === "current" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        {step.step < app.totalSteps && (
                          <div
                            className={`w-0.5 h-12 ${step.status === "completed"
                                ? "bg-green-500"
                                : "bg-muted"
                              }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-medium text-foreground text-sm">
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                        {step.estimatedTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ⏱️ {step.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12 px-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No Applications Found
          </h3>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? "Try different search terms"
              : "You haven't submitted any applications yet"}
          </p>
        </div>
      )}
    </div>
  );
}
