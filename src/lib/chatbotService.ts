import { generateContent, AGENT_MODEL_ID } from "@/lib/geminiService";
import { AgentAction, AgentContext } from "@/lib/agent/types";

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
  agentAction?: AgentAction; // New field for agent commands
}

export const chatbotService = {
  /**
   * Standard Chat Mode
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<ChatbotResponse> {

    // Fallback to legacy behavior if not in explicit agent mode (simplified for brevity of this edit)
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
   * Autonomous Agent Mode (The "Brain")
   * Decides the next step based on the user's goal and the current page state.
   */
  async decideNextStep(
    userGoal: string,
    context: AgentContext,
    history: string[] = []
  ): Promise<{ action: AgentAction; thoughtProcess: string }> {

    // Construct a rich prompt for the Thinking Model
    const interactiveElementsList = context.interactiveElements
      .map(el => `- [${el.type}] "${el.text}" (ID: ${el.id})`)
      .join("\n");

    const systemPrompt = `You are an Autonomous browser agent navigating the CivicAid app.
Your goal is to fulfill the user's request by interacting with the page.

CURRENT PAGE: "${context.pageTitle}" (URL: ${context.currentUrl})

AVAILABLE ELEMENTS:
${interactiveElementsList.slice(0, 5000)} ${interactiveElementsList.length > 5000 ? "...(truncated)" : ""}

USER GOAL: "${userGoal}"

HISTORY (Last 5 steps):
${history.slice(-5).join("\n")}

INSTRUCTIONS:
1. THINK: Analyze the page and the goal. 
   - If the goal requires a specific page, NAVIGATE there first.
   - If you are on the right page but need a specific tab (e.g., "Child Safety", "Digital Safety"), CLICK the tab first.
   - If you need to input data (e.g., phone number, URL, report description), TYPE it into the correct input field.
   - finally, CLICK the action button (e.g., "Check", "Submit").

2. ACT: Choose ONE action from the list below.
   - navigate(route): Go to a new page (e.g., /report, /safety, /payments, /home, /schemes).
   - click_element(id): Click a button, link, or tab matching an ID from the list.
   - type_text(id, text): Type text into an input field.
   - none: If the goal is complete or you are stuck.

RESPONSE FORMAT:
You MUST respond with a valid JSON object. Do not wrap in markdown code blocks.
{
  "thought": "I am on the Safety page. The user wants to check a phone number. I see the 'Digital Safety' tab. I must click it first to access the phone checker.",
  "action": "click_element",
  "parameters": { "id": "tab-digital-safety" }
}

OR

{
  "thought": "I am on the Digital Safety tab. I see the phone input. I will type the number.",
  "action": "type_text",
  "parameters": { "id": "phone-check-input", "text": "9061737021" }
}
`;

    try {
      console.log("Agent Reasoning...");
      // K2 Thinking model requires more tokens for its internal thought process
      // User constrained max tokens to 4096
      const responseText = await generateContent(systemPrompt, AGENT_MODEL_ID, 4096);

      console.log("Raw Agent Response (First 200 chars):", responseText.substring(0, 200));

      // Robust JSON Extraction
      let cleanJson = responseText;

      // 1. Try to extract from markdown code blocks first
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        cleanJson = jsonMatch[1];
      } else {
        // 2. If no blocks, try to find the first '{' and last '}'
        const start = responseText.indexOf("{");
        const end = responseText.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
          cleanJson = responseText.substring(start, end + 1);
        }
      }

      // Cleanup common JSON errors from LLMs
      cleanJson = cleanJson.trim()
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]");

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (jsonError) {
        console.error("JSON Parse Failed:", jsonError);
        console.log("Failed JSON Content:", cleanJson);
        // Fallback: Use a regex to try and extract the action and params if JSON fails
        throw new Error("Invalid JSON format from Agent");
      }

      return {
        action: {
          type: parsed.action,
          parameters: parsed.parameters
        },
        thoughtProcess: parsed.thought || "Processing..."
      };

    } catch (error) {
      console.error("Agent decision error:", error);
      // Return a safe 'none' action instead of crashing, allowing the user to try again
      return {
        action: { type: "none", parameters: { description: "I encountered an error. Please try again." } },
        thoughtProcess: "I encountered an error deciding the next step. I will stop for safety."
      };
    }
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
