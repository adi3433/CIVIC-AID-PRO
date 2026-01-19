import { generateAgentDecision } from "@/lib/geminiService";
import { AgentAction, AgentContext } from "@/lib/agent/types";
import { agentCache } from "@/lib/agent/agentCache";
import { parseAgentResponse, AgentDecisionResponse } from "@/lib/agent/agentSchema";

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
  agentAction?: AgentAction;
}

// Optimized element rendering for prompts
const MAX_ELEMENTS = 50;
const MAX_TEXT_LENGTH = 40;

function formatElementsForPrompt(elements: { id: string; type: string; text: string }[]): string {
  return elements
    .slice(0, MAX_ELEMENTS)
    .map(el => {
      const text = el.text.length > MAX_TEXT_LENGTH
        ? el.text.substring(0, MAX_TEXT_LENGTH) + "..."
        : el.text;
      return `- [${el.type}] "${text}" → ID: ${el.id}`;
    })
    .join("\n");
}

export const chatbotService = {
  /**
   * Standard Chat Mode (unchanged)
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<ChatbotResponse> {
    const { generateContent } = await import("@/lib/geminiService");

    const context = conversationHistory
      .slice(-6)
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const systemPrompt = `You are CivicAid Assistant. Help users with civic issues (potholes, garbage), schemes, and safety.
    Current conversation:
    ${context}
    User: "${userMessage}"
    Respond helpfully and concisely.`;

    try {
      const response = await generateContent(systemPrompt, "accounts/fireworks/models/gpt-oss-120b", 512);
      return { message: response.trim(), suggestions: this.generateSuggestions(userMessage) };
    } catch (e) {
      return { message: "I'm having trouble connecting right now.", suggestions: [] };
    }
  },

  /**
   * Autonomous Agent Mode with Enhanced Chain of Thought
   * Features: Caching, Schema Validation, Low-Confidence Handling
   */
  async decideNextStep(
    userGoal: string,
    context: AgentContext,
    history: string[] = []
  ): Promise<{ action: AgentAction; thoughtProcess: string; confidence: number; cached: boolean }> {
    const startTime = Date.now();

    // === CACHE CHECK: Only use cache for FIRST step (history empty) ===
    // For multi-step flows, always get fresh decision from AI
    const isFirstStep = history.length === 0;
    const cachedDecision = isFirstStep ? agentCache.getDecision(userGoal, context.currentUrl) : null;

    if (cachedDecision && cachedDecision.confidence >= 70) {
      console.log(`⚡ Using cached decision (${Date.now() - startTime}ms)`);
      return {
        action: {
          type: cachedDecision.action as AgentAction["type"],
          parameters: cachedDecision.parameters as AgentAction["parameters"],
        },
        thoughtProcess: "Using cached decision from previous identical request.",
        confidence: cachedDecision.confidence,
        cached: true,
      };
    }

    // === BUILD ENHANCED PROMPT ===
    const elementsList = formatElementsForPrompt(context.interactiveElements);

    const systemPrompt = `You are an Autonomous browser agent for the CivicAid app.
Your goal: Fulfill the user's request by selecting the correct UI action.

=== STRATEGIC REASONING (Complete ALL steps before acting) ===

STEP 1 - GOAL ANALYSIS:
• What is the user trying to accomplish?
• What is the success state (e.g., "payment confirmed", "report submitted")?

STEP 2 - CONTEXT CHECK:
• Current page: "${context.pageTitle}" (URL: ${context.currentUrl})
• Am I on the correct page for this goal?
• If not, I should NAVIGATE first.

STEP 3 - ELEMENT MATCHING:
• Scan the AVAILABLE ELEMENTS list below
• Find an element ID that matches the required action
• If EXACT match not found, look for similar IDs
• If NO suitable element exists, return action "none"

STEP 4 - CONFIDENCE CHECK:
• Am I certain this element ID exists in the list?
• Is this action likely to succeed?
• If confidence < 60, I MUST return action "none" instead

=== AVAILABLE ELEMENTS ===
${elementsList}
${context.interactiveElements.length > MAX_ELEMENTS ? `...(${context.interactiveElements.length - MAX_ELEMENTS} more elements truncated)` : ""}

=== USER GOAL ===
"${userGoal}"

=== RECENT HISTORY ===
${history.slice(-3).join("\n") || "No previous actions"}

=== CRITICAL RULES ===
❌ NEVER invent element IDs - ONLY use IDs from AVAILABLE ELEMENTS
❌ If confidence < 60, MUST return "none"
✅ If target is hidden, click relevant TABS or NAVIGATION to reveal it
✅ If goal appears complete (success message visible), return "none"
✅ If correct page not loaded, use "navigate" first

=== FLOW EXAMPLES ===

PAYMENT ("Pay water bill"):
1. If not on /payments → navigate("/payments")
2. Click "pay-action-water"
3. Click "checkout-proceed-btn"
4. Click "checkout-confirm-btn"
5. See success → action: "none"

SAFETY CHECK ("Is +919876543210 a scam?"):
1. If not on /safety → navigate("/safety")
2. Click "tab-digital-safety"
3. Type in "phone-check-input"
4. Click "phone-check-btn"
5. See result → action: "none"

=== OUTPUT FORMAT ===
Respond with ONLY a JSON object (no markdown, no extra text):
{
  "reasoning_steps": {
    "goal": "What user wants to achieve",
    "current_context": "Where I am and what I see",
    "element_match": "Element ID I found and why I chose it",
    "validation": "Why I'm confident this action is correct"
  },
  "action": "navigate" | "click_element" | "type_text" | "none",
  "parameters": { "route": "/path" } OR { "id": "element-id" } OR { "id": "input-id", "text": "content" },
  "confidence": 0-100
}`;

    try {
      console.log("🧠 Agent Reasoning...");
      const responseText = await generateAgentDecision(systemPrompt);
      console.log("📝 Raw Response (first 300):", responseText.substring(0, 300));

      // === PARSE & VALIDATE ===
      const parsed = parseAgentResponse(responseText);

      if (!parsed) {
        console.error("❌ Failed to parse agent response");
        return this.createFallbackResponse("Failed to parse AI response");
      }

      // === CONFIDENCE CHECK ===
      if (parsed.confidence < 60 && parsed.action !== "none") {
        console.warn(`⚠️ Low confidence (${parsed.confidence}), converting to "none"`);
        return {
          action: { type: "none", parameters: { description: "Confidence too low to proceed safely" } },
          thoughtProcess: parsed.reasoning_steps?.validation || parsed.thought || "Low confidence",
          confidence: parsed.confidence,
          cached: false,
        };
      }

      // === CACHE THE DECISION ===
      if (parsed.confidence >= 70 && parsed.action !== "none") {
        agentCache.setDecision(
          userGoal,
          context.currentUrl,
          parsed.action,
          parsed.parameters as Record<string, unknown>,
          parsed.confidence
        );
      }

      const latency = Date.now() - startTime;
      console.log(`✅ Decision made in ${latency}ms (confidence: ${parsed.confidence})`);

      return {
        action: {
          type: parsed.action,
          parameters: parsed.parameters,
        },
        thoughtProcess: parsed.reasoning_steps?.validation || parsed.thought || "Processing...",
        confidence: parsed.confidence,
        cached: false,
      };

    } catch (error) {
      console.error("❌ Agent decision error:", error);
      return this.createFallbackResponse("Error during decision making");
    }
  },

  /**
   * Create safe fallback response
   */
  createFallbackResponse(reason: string): { action: AgentAction; thoughtProcess: string; confidence: number; cached: boolean } {
    return {
      action: { type: "none", parameters: { description: reason } },
      thoughtProcess: `I encountered an issue: ${reason}. Stopping for safety.`,
      confidence: 0,
      cached: false,
    };
  },

  /**
   * Invalidate cache after successful action (state changed)
   */
  invalidateCache(url?: string): void {
    agentCache.invalidateDecisions(url);
    agentCache.invalidatePageContext();
  },

  generateSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    text = text.toLowerCase();
    if (text.includes("report") || text.includes("issue")) {
      suggestions.push("Report a Pothole", "Report Garbage", "Track my reports");
    } else if (text.includes("payment") || text.includes("bill")) {
      suggestions.push("Pay Electricity Bill", "Pay Water Bill");
    } else if (text.includes("safety") || text.includes("emergency")) {
      suggestions.push("Safety Check-in", "Emergency Contacts");
    }
    return suggestions.length > 0 ? suggestions : ["Report an Issue", "Pay Bills", "Safety Features"];
  }
};
