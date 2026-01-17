/**
 * Chatbot Service - AI-powered citizen query assistant
 * Uses the same Fireworks AI model as schemes service
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  actions?: {
    label: string;
    route?: string;
    action?: string;
  }[];
}

export const chatbotService = {
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<ChatbotResponse> {
    const { generateContent } = await import("@/lib/geminiService");

    // Build conversation context
    const context = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
      )
      .join("\n");

    const systemPrompt = `You are CivicAid Assistant, a helpful AI chatbot for Indian citizens. You help with:

1. **Civic Issue Reporting**: Guide users to report potholes, streetlights, garbage, water issues, etc.
2. **Government Schemes**: Help find relevant schemes (health, pension, housing, employment, education, agriculture)
3. **Safety & Emergency**: Provide emergency contacts, safety check-ins, digital safety tips
4. **Bill Payments**: Help with utility bills (electricity, water, gas)
5. **Announcements**: Inform about local area updates and government announcements

Be concise, friendly, and empathetic. Use emojis appropriately. When suggesting actions, provide clear next steps.
Format your response naturally with:
- Use **bold** for emphasis on key points
- Use bullet points (•) for lists
- Keep responses conversational and clear

If the query is about:
- **Reporting issues**: Ask for location, issue type, and guide to report form
- **Schemes**: Ask about their situation (age, income, occupation) to find relevant schemes
- **Bills**: Guide to payments section
- **Safety**: Provide emergency numbers (100 Police, 108 Ambulance, 1091 Women Helpline)
- **Scams**: Guide to digital safety section for scam detection tools

Current conversation:
${context}

User's latest message: "${userMessage}"

Respond in a helpful, conversational way. Use **bold** for important keywords. If you can suggest a specific action (like navigating to a page), mention it clearly.

Important: Format naturally using:
- **Bold text** for emphasis
- Bullet points (•) for lists
- Short paragraphs for readability

RESPOND IN PLAIN TEXT WITH SIMPLE FORMATTING - NO JSON, NO CODE BLOCKS.`;

    try {
      const response = await generateContent(
        systemPrompt,
        "accounts/fireworks/models/gpt-oss-120b",
        512,
      );

      // Extract action suggestions from response
      const actions = this.extractActions(response, userMessage);
      const suggestions = this.generateSuggestions(userMessage);

      return {
        message: response.trim(),
        suggestions,
        actions,
      };
    } catch (error) {
      console.error("Chatbot error:", error);
      throw error;
    }
  },

  extractActions(
    response: string,
    userMessage: string,
  ): ChatbotResponse["actions"] {
    const actions: ChatbotResponse["actions"] = [];
    const lowerMsg = userMessage.toLowerCase();
    const lowerRes = response.toLowerCase();

    // Report issue
    if (
      lowerMsg.includes("report") ||
      lowerMsg.includes("pothole") ||
      lowerMsg.includes("garbage") ||
      lowerMsg.includes("streetlight") ||
      lowerRes.includes("report")
    ) {
      actions.push({
        label: "📝 Report Issue",
        route: "/report",
      });
    }

    // Schemes
    if (
      lowerMsg.includes("scheme") ||
      lowerMsg.includes("benefit") ||
      lowerMsg.includes("subsidy") ||
      lowerRes.includes("scheme")
    ) {
      actions.push({
        label: "🏛️ Browse Schemes",
        route: "/schemes",
      });
    }

    // Safety/Emergency
    if (
      lowerMsg.includes("emergency") ||
      lowerMsg.includes("safety") ||
      lowerMsg.includes("help") ||
      lowerMsg.includes("danger")
    ) {
      actions.push({
        label: "🚨 Safety Tools",
        route: "/safety",
      });
    }

    // Bills
    if (
      lowerMsg.includes("bill") ||
      lowerMsg.includes("payment") ||
      lowerMsg.includes("electricity") ||
      lowerMsg.includes("water") ||
      lowerMsg.includes("gas")
    ) {
      actions.push({
        label: "💰 Pay Bills",
        route: "/payments",
      });
    }

    // Digital Safety/Scams
    if (
      lowerMsg.includes("scam") ||
      lowerMsg.includes("fraud") ||
      lowerMsg.includes("phishing") ||
      lowerMsg.includes("otp")
    ) {
      actions.push({
        label: "🛡️ Scam Detection",
        route: "/safety?tab=digital",
      });
    }

    return actions.length > 0 ? actions : undefined;
  },

  generateSuggestions(userMessage: string): string[] {
    const lowerMsg = userMessage.toLowerCase();

    // Context-aware suggestions
    if (lowerMsg.includes("report") || lowerMsg.includes("issue")) {
      return [
        "What types of issues can I report?",
        "How do I track my report?",
        "Can I report anonymously?",
      ];
    }

    if (lowerMsg.includes("scheme") || lowerMsg.includes("benefit")) {
      return [
        "How do I check eligibility?",
        "What documents do I need?",
        "Show me pension schemes",
      ];
    }

    if (lowerMsg.includes("safety") || lowerMsg.includes("emergency")) {
      return [
        "Emergency contact numbers",
        "How to use safety check-in?",
        "Digital safety tips",
      ];
    }

    if (lowerMsg.includes("bill") || lowerMsg.includes("payment")) {
      return [
        "How to link my bill accounts?",
        "Can I set bill reminders?",
        "View payment history",
      ];
    }

    // Default suggestions
    return [
      "How can I report a civic issue?",
      "Find government schemes for me",
      "What are emergency numbers?",
      "Help with bill payments",
    ];
  },
};
