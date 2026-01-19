/**
 * Agent Response Schema & Validation
 * Ensures AI responses conform to expected structure
 */

export interface ReasoningSteps {
    goal: string;
    current_context: string;
    element_match: string;
    validation: string;
}

export interface AgentDecisionResponse {
    reasoning_steps?: ReasoningSteps;
    thought?: string; // Legacy support
    action: "navigate" | "click_element" | "type_text" | "none";
    parameters: {
        id?: string;
        text?: string;
        route?: string;
        description?: string;
    };
    confidence: number;
}

/**
 * Validate and normalize agent response
 * Returns null if invalid, normalized response if valid
 */
export function validateAgentResponse(parsed: unknown): AgentDecisionResponse | null {
    if (!parsed || typeof parsed !== "object") {
        return null;
    }

    const obj = parsed as Record<string, unknown>;

    // Check required fields
    if (!obj.action || typeof obj.action !== "string") {
        console.warn("Validation failed: missing or invalid 'action'");
        return null;
    }

    const validActions = ["navigate", "click_element", "type_text", "none"];
    if (!validActions.includes(obj.action)) {
        console.warn(`Validation failed: invalid action "${obj.action}"`);
        return null;
    }

    // Validate confidence
    let confidence = 50; // Default
    if (typeof obj.confidence === "number") {
        confidence = Math.max(0, Math.min(100, obj.confidence));
    }

    // Validate parameters
    const params = (obj.parameters || {}) as Record<string, unknown>;
    const normalizedParams: AgentDecisionResponse["parameters"] = {};

    if (typeof params.id === "string") normalizedParams.id = params.id;
    if (typeof params.text === "string") normalizedParams.text = params.text;
    if (typeof params.route === "string") normalizedParams.route = params.route;
    if (typeof params.description === "string") normalizedParams.description = params.description;

    // Action-specific validation
    if (obj.action === "click_element" || obj.action === "type_text") {
        if (!normalizedParams.id) {
            console.warn(`Validation failed: action "${obj.action}" requires 'id' parameter`);
            return null;
        }
    }

    if (obj.action === "type_text" && !normalizedParams.text) {
        console.warn("Validation failed: action 'type_text' requires 'text' parameter");
        return null;
    }

    if (obj.action === "navigate" && !normalizedParams.route) {
        console.warn("Validation failed: action 'navigate' requires 'route' parameter");
        return null;
    }

    // Extract reasoning if present
    let reasoningSteps: ReasoningSteps | undefined;
    if (obj.reasoning_steps && typeof obj.reasoning_steps === "object") {
        const rs = obj.reasoning_steps as Record<string, unknown>;
        reasoningSteps = {
            goal: String(rs.goal || ""),
            current_context: String(rs.current_context || ""),
            element_match: String(rs.element_match || ""),
            validation: String(rs.validation || ""),
        };
    }

    return {
        reasoning_steps: reasoningSteps,
        thought: typeof obj.thought === "string" ? obj.thought : undefined,
        action: obj.action as AgentDecisionResponse["action"],
        parameters: normalizedParams,
        confidence,
    };
}

/**
 * Attempt to repair truncated JSON
 */
function repairJSON(json: string): string {
    let repaired = json.trim();

    // Balance quotes
    if ((repaired.match(/"/g) || []).length % 2 !== 0) {
        repaired += '"';
    }

    // Balance braces and brackets
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    if (openBraces > closeBraces) {
        repaired += "}".repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
        repaired += "]".repeat(openBrackets - closeBrackets);
    }

    return repaired;
}

/**
 * Extract JSON from LLM response text
 * Handles markdown blocks, extra text, and common formatting issues
 */
export function extractJSON(responseText: string): string | null {
    let text = responseText;

    // Try markdown code block first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        text = codeBlockMatch[1];
    } else {
        // Find first { 
        const start = text.indexOf("{");
        if (start !== -1) {
            // Check if there is a closing } at the very end
            const end = text.lastIndexOf("}");
            if (end > start) {
                // Potential candidate, but might be inner object if truncated
                // We'll take from start to the very end of line to try repair
                text = text.substring(start);
            } else {
                // No closing brace found, take everything from start
                text = text.substring(start);
            }
        } else {
            return null;
        }
    }

    // Clean common LLM JSON errors
    text = text
        .replace(/,\s*}/g, "}")       // Trailing commas in objects
        .replace(/,\s*]/g, "]")       // Trailing commas in arrays
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"')    // Single quoted values
        .trim();

    return text;
}

/**
 * Parse and validate agent response from raw text
 */
export function parseAgentResponse(responseText: string): AgentDecisionResponse | null {
    const jsonString = extractJSON(responseText);
    if (!jsonString) {
        console.error("Failed to extract JSON from response");
        return null;
    }

    try {
        const parsed = JSON.parse(jsonString);
        return validateAgentResponse(parsed);
    } catch (e) {
        // Attempt repair
        try {
            const repaired = repairJSON(jsonString);
            const parsed = JSON.parse(repaired);
            console.log("✅ JSON repaired successfully");
            return validateAgentResponse(parsed);
        } catch (repairError) {
            console.error("JSON parse error (even after repair):", e);
            console.log("Failed JSON content:", jsonString.substring(0, 200));
            return null;
        }
    }
}
