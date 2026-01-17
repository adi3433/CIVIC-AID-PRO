import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ChatbotButton() {
  const { toast } = useToast();

  const handleChatbotClick = () => {
    toast({
      title: "💬 Chatbot",
      description: "Opening AI assistant...",
      duration: 2000,
    });
    // TODO: Implement chatbot modal or navigation
  };

  return (
    <Button
      onClick={handleChatbotClick}
      className="fixed bottom-[168px] right-4 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
      aria-label="Open Chatbot"
    >
      <MessageCircle className="w-5 h-5" />
    </Button>
  );
}
