import { useState } from "react";
import {
    Flag,
    Search,
    TrendingUp,
    Filter,
    ChevronRight,
    Users,
    Clock,
    MapPin,
    AlertTriangle,
    Shield,
    BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    reportedScams,
    getScamTrends,
    getScamStats,
    getChannelStats,
    ReportedScam,
} from "@/lib/scamDatabase";
import { getCategoryDisplayName, ScamCategory } from "@/lib/scamDetection";

export function ScamDatabase() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedScam, setSelectedScam] = useState<ReportedScam | null>(null);

    const trends = getScamTrends();
    const stats = getScamStats();
    const channelStats = getChannelStats();

    const filteredScams = reportedScams.filter(scam =>
        scam.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scam.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (category: ScamCategory) => {
        const colors: Record<string, string> = {
            phishing: "bg-blue-100 text-blue-800 border-blue-300",
            fake_govt_scheme: "bg-purple-100 text-purple-800 border-purple-300",
            job_scam: "bg-orange-100 text-orange-800 border-orange-300",
            payment_scam: "bg-red-100 text-red-800 border-red-300",
            loan_scam: "bg-yellow-100 text-yellow-800 border-yellow-300",
            impersonation: "bg-pink-100 text-pink-800 border-pink-300",
            lottery_scam: "bg-green-100 text-green-800 border-green-300",
            investment_scam: "bg-indigo-100 text-indigo-800 border-indigo-300",
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const getChannelIcon = (channel: string) => {
        const icons: Record<string, string> = {
            sms: "📱",
            whatsapp: "💬",
            email: "📧",
            call: "📞",
            website: "🌐",
            qr_code: "📲",
        };
        return icons[channel] || "📌";
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return "Yesterday";
        return `${days} days ago`;
    };

    if (selectedScam) {
        return (
            <Card variant="default" className="overflow-hidden">
                <div className="p-4 bg-muted/50 border-b">
                    <button
                        onClick={() => setSelectedScam(null)}
                        className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-sm"
                    >
                        ← Back to database
                    </button>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(selectedScam.type)}>
                            {getCategoryDisplayName(selectedScam.type)}
                        </Badge>
                        <Badge variant="outline" className="bg-muted">
                            {getChannelIcon(selectedScam.channel)} {selectedScam.channel.replace("_", " ")}
                        </Badge>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Scam Content */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm italic text-red-800">"{selectedScam.content}"</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Region</p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {selectedScam.region}
                            </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Reported</p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(selectedScam.reportedAt)}
                            </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Verified By</p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {selectedScam.verifiedCount} users
                            </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge
                                variant={selectedScam.status === "verified" ? "default" : "secondary"}
                            >
                                {selectedScam.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Money Lost */}
                    {selectedScam.amountLost && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-red-800">Reported Loss</span>
                            <span className="font-bold text-red-600">₹{selectedScam.amountLost.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">If you received this message:</p>
                            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                <li>• Do NOT click any links</li>
                                <li>• Do NOT share OTP or personal info</li>
                                <li>• Block and report the sender</li>
                            </ul>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => setSelectedScam(null)}>
                        <Flag className="w-4 h-4 mr-2" />
                        Report Similar Scam
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="default" className="overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Scam Database</h2>
                        <p className="text-sm text-white/80">Community-reported scams</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{stats.totalReports.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">₹{(stats.totalMoneySaved / 10000000).toFixed(1)}Cr</p>
                        <p className="text-xs text-muted-foreground">Money Saved</p>
                    </div>
                </div>

                <Tabs defaultValue="recent" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="trending">Trending</TabsTrigger>
                        <TabsTrigger value="stats">Analytics</TabsTrigger>
                    </TabsList>

                    {/* Recent Scams */}
                    <TabsContent value="recent" className="mt-4 space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search scams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Scam List */}
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {filteredScams.map((scam) => (
                                <button
                                    key={scam.id}
                                    onClick={() => setSelectedScam(scam)}
                                    className="w-full p-3 rounded-lg border hover:border-primary hover:bg-muted/30 transition-all text-left"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">{getChannelIcon(scam.channel)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground line-clamp-2">
                                                {scam.content.substring(0, 80)}...
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getCategoryColor(scam.type)}`}
                                                >
                                                    {getCategoryDisplayName(scam.type)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(scam.reportedAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Trending */}
                    <TabsContent value="trending" className="mt-4 space-y-3">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Most reported scam types this week
                        </p>

                        <div className="space-y-3">
                            {trends.map((trend, index) => (
                                <div key={trend.category} className="p-3 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-muted-foreground">
                                                #{index + 1}
                                            </span>
                                            <Badge variant="outline" className={getCategoryColor(trend.category)}>
                                                {getCategoryDisplayName(trend.category)}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">{trend.count}</p>
                                            <p className={`text-xs ${trend.percentageChange > 0 ? "text-red-500" : "text-green-500"}`}>
                                                {trend.percentageChange > 0 ? "↑" : "↓"} {Math.abs(trend.percentageChange)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {trend.recentExamples.map((example, i) => (
                                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                                                {example}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Analytics */}
                    <TabsContent value="stats" className="mt-4 space-y-4">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Scam distribution by channel
                        </p>

                        <div className="space-y-2">
                            {channelStats.map((stat) => (
                                <div key={stat.channel} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground">{stat.channel}</span>
                                        <span className="text-muted-foreground">{stat.count} ({stat.percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${stat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                                <p className="text-lg font-bold text-foreground">{stats.verifiedScams}</p>
                                <p className="text-xs text-muted-foreground">Verified Scams</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-center">
                                <p className="text-lg font-bold text-foreground">{stats.activeRegions}</p>
                                <p className="text-xs text-muted-foreground">States Covered</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Report Button */}
                <Button className="w-full">
                    <Flag className="w-4 h-4 mr-2" />
                    Report a Scam
                </Button>
            </div>
        </Card>
    );
}
