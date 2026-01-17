import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Award,
  FileText,
  CheckCircle2,
  Settings,
  Globe,
  Shield,
  Eye,
  ChevronRight,
  Accessibility,
  Volume2,
  Type,
  LogOut,
  Moon,
  Sun,
  Mail,
  Phone,
  Loader2,
  Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SecureDocuments from "@/components/SecureDocuments";

const languages = ["English", "हिंदी", "ಕನ್ನಡ", "தமிழ்"];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [elderlyMode, setElderlyMode] = useState(false);
  const [anonymousReporting, setAnonymousReporting] = useState(profile?.is_anonymous || false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollToDocuments, setScrollToDocuments] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const { isDark, toggleTheme } = useTheme();

  // Sync anonymousReporting state with profile data
  useEffect(() => {
    if (profile?.is_anonymous !== undefined) {
      setAnonymousReporting(profile.is_anonymous);
    }
  }, [profile?.is_anonymous]);

  // Handle section parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section === "documents") {
      setScrollToDocuments(true);
      // Scroll to documents section after render
      setTimeout(() => {
        const documentsSection = document.getElementById(
          "secure-documents-section",
        );
        if (documentsSection) {
          documentsSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location.search]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You've been successfully signed out",
    });
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: editForm.full_name,
        phone: editForm.phone,
      });

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousToggle = async (checked: boolean) => {
    try {
      const { error } = await updateProfile({
        is_anonymous: checked,
      });

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAnonymousReporting(checked);
        toast({
          title: checked ? "Anonymous Mode Enabled" : "Anonymous Mode Disabled",
          description: checked 
            ? "Your future reports will be submitted anonymously" 
            : "Your future reports will show your identity",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update anonymity preference",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      {/* User Profile Card */}
      <div className="px-4 pb-4">
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-3 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {profile?.full_name || "User"}
              </h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{user?.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditForm({
                  full_name: profile?.full_name || "",
                  phone: profile?.phone || "",
                });
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {isEditing && (
            <div className="space-y-3 mb-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Secure Document Vault */}
      <div className="px-4 pb-4" id="secure-documents-section">
        <SecureDocuments userId={user?.id || ""} />
      </div>

      {/* Impact Dashboard */}
      <div className="px-4 pb-4">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Your Impact
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card variant="default" size="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">Reports Filed</p>
              </div>
            </div>
          </Card>
          <Card variant="default" size="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">38</p>
                <p className="text-xs text-muted-foreground">Issues Resolved</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Elderly Mode */}
      <div className="px-4 pb-4">
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <Accessibility className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Elderly Mode</h3>
              <p className="text-sm text-muted-foreground">
                Larger text, simplified UI
              </p>
            </div>
            <Switch checked={elderlyMode} onCheckedChange={setElderlyMode} />
          </div>
          {elderlyMode && (
            <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
              <Badge variant="outline" className="bg-card">
                <Type className="w-3 h-3 mr-1" />
                Large Text
              </Badge>
              <Badge variant="outline" className="bg-card">
                <Volume2 className="w-3 h-3 mr-1" />
                Voice Support
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* Settings */}
      <div className="px-4 pb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Settings
        </h2>
        <Card variant="default" size="sm" className="divide-y divide-border">
          <div className="flex items-center gap-3 py-3 first:pt-0">
            <div className="p-2 bg-muted rounded-lg">
              <Globe className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Language</p>
              <p className="text-xs text-muted-foreground">English</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-muted rounded-lg">
              {isDark ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Dark Theme</p>
              <p className="text-xs text-muted-foreground">
                {isDark ? "Enabled" : "Disabled"}
              </p>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Privacy Controls
              </p>
              <p className="text-xs text-muted-foreground">Manage your data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-muted rounded-lg">
              <Eye className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Anonymous Reporting
              </p>
              <p className="text-xs text-muted-foreground">
                {anonymousReporting ? "Enabled - Reports submitted as 'Anonymous'" : "Disabled - Reports show your name"}
              </p>
            </div>
            <Switch
              checked={anonymousReporting}
              onCheckedChange={handleAnonymousToggle}
            />
          </div>

          <div
            className="flex items-center gap-3 py-3 last:pb-0 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors px-2 -mx-2"
            onClick={handleSignOut}
          >
            <div className="p-2 bg-destructive/10 rounded-lg">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Sign Out</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
}
