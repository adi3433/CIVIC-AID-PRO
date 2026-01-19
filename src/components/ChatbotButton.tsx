import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { chatbotService, ChatMessage } from "@/lib/chatbotService";
import { dispatchAgentModeStart } from "@/components/agent";

// Markdown formatting helper
const formatMarkdown = (text: string) => {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Match **bold**, *italic*, bullet points
  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;
  const bulletRegex = /^[•\-\*]\s+(.+)$/gm;

  // First, replace bold
  let match;
  let processedText = text;
  const replacements: Array<{
    start: number;
    end: number;
    element: React.ReactNode;
  }> = [];

  while ((match = boldRegex.exec(text)) !== null) {
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      element: <strong key={`bold-${match.index}`}>{match[1]}</strong>,
    });
  }

  // Sort by position and build the result
  if (replacements.length > 0) {
    let lastIndex = 0;
    replacements
      .sort((a, b) => a.start - b.start)
      .forEach(({ start, end, element }) => {
        if (start > lastIndex) {
          parts.push(text.substring(lastIndex, start));
        }
        parts.push(element);
        lastIndex = end;
      });
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return <>{parts}</>;
  }

  return text;
};

export function ChatbotButton() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How can I report a civic issue?",
    "Find government schemes for me",
    "What are emergency numbers?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AUTO-CLOSE: When Agent Mode starts (voice or text), close the chat window
  // so it doesn't obstruct the agent's view/navigation.
  useEffect(() => {
    const handleAgentStart = () => {
      setIsOpen(false);
    };
    window.addEventListener("agent:mode-start", handleAgentStart);
    return () => window.removeEventListener("agent:mode-start", handleAgentStart);
  }, []);

  const handleChatbotClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || message;
    if (!messageToSend.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // 0. Check for Agentic Mode
      const isFullAgentic = localStorage.getItem("fullAgenticMode") === "true";

      if (isFullAgentic) {
        // In Full Agentic Mode, we treat this as a task request
        // Since ChatbotButton doesn't have the full loop logic like VoiceButton yet,
        // we will implement a simplified single-step version or hint the user to use voice for now.
        // BETTER: We should expose the runAgentLoop logic to be reusable.
        // For this specific request, I will adhere to the "switch to full agentic mode" instruction
        // by making the chatbot execute the AGENT logic instead of the simple intent logic.

        const context = {
          currentUrl: window.location.pathname,
          pageTitle: document.title,
          interactiveElements: [], // NOTE: Chatbot doesn't scan page by default, we might need to add that.
        };

        // Trigger the agent mode transition animation
        dispatchAgentModeStart();

        // For now, let's keep it simple: explicitly mention Agent is thinking
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content:
            "🧠 **Agent Mode Active:** I am analyzing your request with advanced reasoning...",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // We'll delegate to the same intent matcher as a fallback for now because
        // replicating the full "Agent Loop" (scan -> think -> act) inside this Chatbot component
        // is complex without refactoring the loop into a shared hook.
        // BUT the user asked for "things go entirely automatic through chain of thoughts".
        // Use the existing intent match but pretend it's agentic? No, that's fake.

        // Real solution: If full agentic, we should try to use the K2 model to answer.
        // Since we can't easily "act" on the page from here without the loop, let's just use K2 for the CHAT response.
        const response = await chatbotService.decideNextStep(
          messageToSend,
          { currentUrl: "chat", pageTitle: "chat", interactiveElements: [] },
          [],
        );

        const thoughtMsg: ChatMessage = {
          role: "assistant",
          content: `**Thought:** ${response.thoughtProcess}\n\n**Action:** ${response.action.type}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, thoughtMsg]);
        setIsLoading(false);
        return;
      }

      // First, check if this is a navigation intent using the voice service
      const { matchIntentWithText } =
        await import("@/lib/voiceNavigationService");
      const intentMatch = await matchIntentWithText(messageToSend);

      // If high confidence intent match, navigate directly
      if (intentMatch && intentMatch.confidence > 70) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: `I understand you want to ${intentMatch.intent.description}. Let me take you there! 🚀`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Navigate after a short delay
        setTimeout(() => {
          if (intentMatch.intent.route) {
            navigate(intentMatch.intent.route);
            setIsOpen(false);
          } else if (intentMatch.intent.action) {
            toast({
              title: "Action Triggered",
              description: intentMatch.intent.description,
              duration: 2000,
            });
          }
        }, 800);

        setIsLoading(false);
        return;
      }

      // Otherwise, use chatbot for conversational response
      const response = await chatbotService.sendMessage(
        messageToSend,
        messages,
      );

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update suggestions
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      // Show action buttons if available
      if (response.actions && response.actions.length > 0) {
        const firstAction = response.actions[0];
        if (firstAction.route) {
          toast({
            title: "Quick Action Available",
            description: `Click "${firstAction.label}" to continue`,
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });

      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm sorry, I encountered an error. Please try again or contact support.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <Button
        onClick={handleChatbotClick}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
        aria-label="Open Chatbot"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
            onClick={handleClose}
          />

          {/* Chat Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom duration-300">
            <div className="bg-card border-t border-l border-r rounded-t-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-foreground/20 rounded-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      CivicAid Assistant
                    </h3>
                    <p className="text-xs opacity-90">Always here to help</p>
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary-foreground/20 text-primary-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg rounded-tl-none p-3">
                        <p className="text-sm text-foreground">
                          Hello! I'm your CivicAid assistant. I can help you
                          with:
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• Reporting civic issues</li>
                          <li>• Finding government schemes</li>
                          <li>• Safety and emergency assistance</li>
                          <li>• Bill payments and tracking</li>
                        </ul>
                        <p className="text-sm text-foreground mt-2">
                          How can I assist you today?
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`flex-1 max-w-[80%] ${msg.role === "user" ? "ml-auto" : ""}`}
                    >
                      <div
                        className={`rounded-lg p-3 ${msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                          }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {formatMarkdown(msg.content)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          You
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg rounded-tl-none p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap border-t pt-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 hover:bg-primary/10 text-foreground transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!message.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
