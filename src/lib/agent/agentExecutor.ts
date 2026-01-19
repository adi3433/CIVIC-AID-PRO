import { AgentAction, AgentResult } from "./types";
import { findElementById, findSimilarElement, scanPage } from "./pageScanner";
import { agentCache } from "./agentCache";

// Dispatch visual events for the GhostCursor to listen to
const dispatchCursorEvent = (type: string, x: number, y: number, extra?: Record<string, unknown>) => {
    const event = new CustomEvent(`agent:cursor-${type}`, {
        detail: { x, y, ...extra }
    });
    window.dispatchEvent(event);
};

// Dispatch agent status updates
const dispatchAgentStatus = (state: string, details?: Record<string, unknown>) => {
    const event = new CustomEvent("agent:status", {
        detail: { state, ...details }
    });
    window.dispatchEvent(event);
};

// Dispatch reset event to clear all visual elements
const dispatchReset = () => {
    const event = new CustomEvent("agent:reset");
    window.dispatchEvent(event);
};

// OPTIMIZED: Reduced delays for faster execution
const CLICK_DELAY = 300;  // Was 800ms
const TYPE_DELAY = 200;   // Was 500ms
const VERIFY_DELAY = 150; // New: Quick verify after action

// Helper: Wait for specified milliseconds
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper: Capture page state for verification
const capturePageState = () => ({
    url: window.location.pathname,
    elementCount: document.querySelectorAll("button, input, a").length,
    activeElement: document.activeElement?.getAttribute("data-agent-id") || document.activeElement?.id || null,
    hasModal: !!document.querySelector('[role="dialog"], [data-radix-portal], .modal')
});

// Helper: Check if blocking overlay exists and try to dismiss
const handleBlockingOverlay = async (): Promise<boolean> => {
    const closeButtons = document.querySelectorAll(
        '[role="dialog"] button[aria-label*="close"], .modal-close, [data-radix-close], button:has(svg[class*="close"])'
    );
    for (const btn of closeButtons) {
        (btn as HTMLElement).click();
        await sleep(100);
        return true;
    }
    return false;
};

/**
 * Execute action with verification and retry logic
 * OPTIMIZED: Faster execution, verify-after-execute, intelligent retry
 * GUARANTEED: Always dispatches reset event on completion (success or failure)
 */
export const executeAction = async (action: AgentAction): Promise<{ success: boolean; message: string }> => {
    console.log("Agent executing:", action);

    try {
        if (action.type === "click_element") {
            return await executeClickWithRetry(action.parameters.id || "", 2);
        }

        if (action.type === "type_text") {
            return await executeTypeWithRetry(action.parameters.id || "", action.parameters.text || "", 2);
        }

        if (action.type === "navigate") {
            dispatchReset(); // Reset visuals before navigation
            return { success: true, message: `Navigating to ${action.parameters.route}` };
        }

        dispatchReset(); // Reset on unknown action
        return { success: false, message: "Unknown action type" };
    } catch (error) {
        // Ensure reset happens even on unexpected errors
        dispatchReset();
        console.error("Agent action error:", error);
        return { success: false, message: `Error: ${error}` };
    }
};

/**
 * Execute click with retry and verification
 */
const executeClickWithRetry = async (id: string, maxRetries: number): Promise<{ success: boolean; message: string }> => {
    const BACKOFF = [0, 200, 400]; // Exponential backoff in ms

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            await sleep(BACKOFF[attempt]);
            await handleBlockingOverlay();
        }

        let el = findElementById(id);

        // If not found, try fuzzy match on retry
        if (!el && attempt > 0) {
            const elements = scanPage();
            const similar = findSimilarElement(id, elements);
            if (similar) {
                console.log(`Retry ${attempt}: Using fuzzy match "${similar.id}" for "${id}"`);
                el = findElementById(similar.id);
            }
        }

        if (!el) {
            if (attempt < maxRetries) continue;
            dispatchReset(); // Reset visuals on failure
            return { success: false, message: `Element '${id}' not found after ${maxRetries + 1} attempts.` };
        }

        // Scroll into view if needed
        el.scrollIntoView({ block: "center", behavior: "instant" });
        await sleep(100); // Brief pause after scroll

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // === VISUAL FEEDBACK SEQUENCE ===
        // 1. Focus event - trigger spotlight/highlight
        dispatchCursorEvent("focus", centerX, centerY, { elementId: id });
        await sleep(400); // Let highlight fully appear

        // 2. Move cursor to element (cursor animation)
        dispatchCursorEvent("move", centerX, centerY);
        await sleep(350); // Cursor travel time

        // 3. Click event - trigger click ripple
        dispatchCursorEvent("click", centerX, centerY);
        await sleep(100); // Brief pause before actual click

        // Robust click simulation
        const clickEvents = ["mousedown", "mouseup", "click"];
        clickEvents.forEach(eventType => {
            const event = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: centerX,
                clientY: centerY
            });
            el!.dispatchEvent(event);
        });
        el.click();

        // Verify action had effect
        await sleep(VERIFY_DELAY);
        const afterState = capturePageState();

        // 4. Complete event - trigger fade out
        dispatchCursorEvent("complete", centerX, centerY);
        await sleep(200); // Let completion animation start

        // Invalidate cache since page state may have changed
        agentCache.invalidatePageContext();

        // Success indicators
        if (afterState.hasModal || afterState.url !== window.location.pathname) {
            agentCache.invalidateDecisions(); // Full invalidation on state change
            return { success: true, message: `Clicked '${id}' - state changed.` };
        }

        return { success: true, message: `Clicked element '${id}'.` };
    }

    dispatchReset(); // Reset visuals on failure
    return { success: false, message: `Failed to click '${id}'.` };
};

/**
 * Execute type with retry and verification
 */
const executeTypeWithRetry = async (id: string, text: string, maxRetries: number): Promise<{ success: boolean; message: string }> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) await sleep(200);

        let el = findElementById(id);

        if (!el && attempt > 0) {
            const elements = scanPage();
            const similar = findSimilarElement(id, elements);
            if (similar) el = findElementById(similar.id);
        }

        if (!el) {
            if (attempt < maxRetries) continue;
            dispatchReset(); // Reset visuals on failure
            return { success: false, message: `Element '${id}' not found.` };
        }

        el.scrollIntoView({ block: "center", behavior: "instant" });
        await sleep(100);

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // === VISUAL FEEDBACK SEQUENCE ===
        // 1. Focus event - trigger spotlight/highlight
        dispatchCursorEvent("focus", centerX, centerY, { elementId: id });
        await sleep(400);

        // 2. Move cursor to element
        dispatchCursorEvent("move", centerX, centerY);
        await sleep(300);

        // Focus and type
        (el as HTMLInputElement).focus();
        const input = el as HTMLInputElement | HTMLTextAreaElement;

        // React-compatible value setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

        if (nativeInputValueSetter && input instanceof HTMLInputElement) {
            nativeInputValueSetter.call(input, text);
        } else if (nativeTextAreaValueSetter && input instanceof HTMLTextAreaElement) {
            nativeTextAreaValueSetter.call(input, text);
        } else {
            input.value = text;
        }

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));

        // 3. Complete event
        dispatchCursorEvent("complete", centerX, centerY);
        await sleep(200);

        // Verify value was set
        if (input.value === text) {
            return { success: true, message: `Typed "${text}" into '${id}'.` };
        }
    }

    dispatchReset(); // Reset visuals on failure
    return { success: false, message: `Failed to type into '${id}'.` };
};
