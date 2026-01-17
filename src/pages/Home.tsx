import { GreetingSection } from "@/components/home/GreetingSection";
import { AnnouncementsCarousel } from "@/components/home/AnnouncementsCarousel";
import { QuickActions } from "@/components/home/QuickActions";
import { AreaHealth } from "@/components/home/AreaHealth";
import { CommunityHighlights } from "@/components/home/CommunityHighlights";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <GreetingSection />
      <AnnouncementsCarousel />
      <QuickActions />
      <AreaHealth />
      <CommunityHighlights />
    </div>
  );
}
