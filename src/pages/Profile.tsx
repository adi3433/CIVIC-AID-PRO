import { useState } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";

const languages = ["English", "हिंदी", "ಕನ್ನಡ", "தமிழ்"];

export default function Profile() {
  const [elderlyMode, setElderlyMode] = useState(false);
  const [anonymousReporting, setAnonymousReporting] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </div>

      {/* User Profile Card */}
      <div className="px-4 pb-4">
        <Card variant="elevated" className="relative overflow-hidden">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-3 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                RS
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                Rahul Sharma
              </h2>
              <p className="text-sm text-muted-foreground">
                rahul.sharma@email.com
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="bg-warning/10 text-warning border-warning/30"
                >
                  <Award className="w-3 h-3 mr-1" />
                  Gold Citizen
                </Badge>
              </div>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Reputation Score
              </span>
              <span className="text-lg font-bold text-primary">850</span>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              150 points to Platinum
            </p>
          </div>
        </Card>
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
                Hide your identity
              </p>
            </div>
            <Switch
              checked={anonymousReporting}
              onCheckedChange={setAnonymousReporting}
            />
          </div>

          <div className="flex items-center gap-3 py-3 last:pb-0">
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
