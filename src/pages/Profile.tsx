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
  Brain,
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
import { useLanguage } from "@/contexts/LanguageContext";
import SecureDocuments from "@/components/SecureDocuments";

const languageOptions = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ta", name: "தமிழ்" },
  { code: "ml", name: "മലയാളം" },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [elderlyMode, setElderlyMode] = useState(false);
  const [anonymousReporting, setAnonymousReporting] = useState(
    profile?.is_anonymous || false,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollToDocuments, setScrollToDocuments] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

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
      title: t("profile.signedOut"),
      description: t("profile.signedOut.desc"),
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
          title: t("profile.updateFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("profile.updateSuccess"),
          description: t("profile.updateSuccess.desc"),
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: t("status.error"),
        description: t("profile.profileUpdateFailed"),
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
          title: t("profile.updateFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAnonymousReporting(checked);
        toast({
          title: checked
            ? t("profile.anonymousEnabled")
            : t("profile.anonymousDisabled"),
          description: checked
            ? t("profile.futureReportsAnonymous")
            : t("profile.futureReportsIdentified"),
        });
      }
    } catch (error) {
      toast({
        title: t("status.error"),
        description: t("profile.anonymityUpdateFailed"),
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
        <h1 className="text-2xl font-bold text-foreground">
          {t("profile.title")}
        </h1>
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
                {profile?.full_name || t("profile.user")}
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
                  {t("profile.fullName")}
                </Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  placeholder={t("profile.enterFullName")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">
                  {t("profile.phoneNumber")}
                </Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder={t("profile.enterPhoneNumber")}
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
                      {t("profile.saving")}
                    </>
                  ) : (
                    t("profile.saveChanges")
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  {t("common.cancel")}
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
          {t("profile.impact")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card variant="default" size="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">
                  {t("profile.reportsFiled")}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {t("profile.issuesResolved")}
                </p>
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
              <h3 className="font-semibold text-foreground">
                {t("profile.elderlyMode")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("profile.elderlyMode.desc")}
              </p>
            </div>
            <Switch checked={elderlyMode} onCheckedChange={setElderlyMode} />
          </div>
          {elderlyMode && (
            <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
              <Badge variant="outline" className="bg-card">
                <Type className="w-3 h-3 mr-1" />
                {t("profile.largeText")}
              </Badge>
              <Badge variant="outline" className="bg-card">
                <Volume2 className="w-3 h-3 mr-1" />
                {t("profile.voiceSupport")}
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* Settings */}
      <div className="px-4 pb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">
          {t("profile.settings")}
        </h2>
        <Card variant="default" size="sm" className="divide-y divide-border">
          <div className="flex items-center gap-3 py-3 first:pt-0">
            <div className="p-2 bg-muted rounded-lg">
              <Globe className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {t("profile.language")}
              </p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-xs text-muted-foreground bg-background border-none outline-none cursor-pointer [&>option]:bg-background [&>option]:text-foreground"
              >
                {languageOptions.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-background text-foreground"
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
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
              <p className="text-sm font-medium text-foreground">
                {t("profile.darkTheme")}
              </p>
              <p className="text-xs text-muted-foreground">
                {isDark ? t("profile.enabled") : t("profile.disabled")}
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
                {t("profile.privacyControls")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.manageData")}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-muted rounded-lg">
              <Eye className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {t("profile.anonymousReporting")}
              </p>
              <p className="text-xs text-muted-foreground">
                {anonymousReporting
                  ? t("profile.anonymousReporting.enabled")
                  : t("profile.anonymousReporting.disabled")}
              </p>
            </div>
            <Switch
              checked={anonymousReporting}
              onCheckedChange={handleAnonymousToggle}
            />
          </div>

          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-muted rounded-lg">
              <Brain className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Full Agentic Mode
              </p>
              <p className="text-xs text-muted-foreground">
                {localStorage.getItem("fullAgenticMode") === "true" ? "Autonomous Interaction Enabled" : "Standard Assistant Mode"}
              </p>
            </div>
            <Switch
              checked={localStorage.getItem("fullAgenticMode") === "true"}
              onCheckedChange={(checked) => {
                localStorage.setItem("fullAgenticMode", String(checked));
                // Force re-render (hacky but works for simple localstorage toggle without context)
                window.dispatchEvent(new Event("storage"));
                window.location.reload(); // Simplest way to propagate changes for now
              }}
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
              <p className="text-sm font-medium text-destructive">
                {t("profile.signOut")}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  );
}
