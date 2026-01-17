import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { VoiceNavigationButton } from "@/components/VoiceNavigationButton";
import { ChatbotButton } from "@/components/ChatbotButton";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto">{children}</main>
      <BottomNav />
      <ChatbotButton />
      <VoiceNavigationButton />
    </div>
  );
}
