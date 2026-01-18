import { AgentAction, AgentResult } from "./types";
import { findElementById } from "./pageScanner";

// Dispatch visual events for the GhostCursor to listen to
const dispatchCursorEvent = (type: string, x: number, y: number) => {
    const event = new CustomEvent(`agent:cursor-${type}`, {
        detail: { x, y }
    });
    window.dispatchEvent(event);
};

export const executeAction = async (action: AgentAction): Promise<{ success: boolean; message: string }> => {
    console.log("Agents executing:", action);

    if (action.type === "click_element") {
        const el = findElementById(action.parameters.id || "");
        if (!el) return { success: false, message: `Element with ID '${action.parameters.id}' not found.` };

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Visual: Move cursor -> Wait -> Click
        dispatchCursorEvent("move", centerX, centerY);

        // Simulate human delay
        await new Promise(r => setTimeout(r, 800));

        dispatchCursorEvent("click", centerX, centerY);

        // Robust Click: Simulating full event chain for React/UI frameworks
        const clickEvents = ['mousedown', 'mouseup', 'click'];
        clickEvents.forEach(eventType => {
            const event = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: centerX,
                clientY: centerY
            });
            el.dispatchEvent(event);
        });

        // Native click fallback
        el.click();

        return { success: true, message: `Clicked element '${action.parameters.id}'.` };
    }

    if (action.type === "type_text") {
        const el = findElementById(action.parameters.id || "");
        if (!el) return { success: false, message: `Element '${action.parameters.id}' not found.` };

        // Visual: Move to element
        const rect = el.getBoundingClientRect();
        dispatchCursorEvent("move", rect.left + rect.width / 2, rect.top + rect.height / 2);
        await new Promise(r => setTimeout(r, 500));

        // Type logic with React state update support
        const input = el as HTMLInputElement | HTMLTextAreaElement;

        // Clear first if needed (optional, keeping it simple for now)

        // React's setter hack to ensure state updates
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

        if (nativeInputValueSetter && input instanceof HTMLInputElement) {
            nativeInputValueSetter.call(input, action.parameters.text);
        } else if (nativeTextAreaValueSetter && input instanceof HTMLTextAreaElement) {
            nativeTextAreaValueSetter.call(input, action.parameters.text);
        } else {
            input.value = action.parameters.text || "";
        }

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        return { success: true, message: `Typed "${action.parameters.text}" into '${action.parameters.id}'.` };
    }

    if (action.type === "navigate") {
        // This is typically handled by the UI component controlling the router, 
        // but the executor validates the request.
        return { success: true, message: `Navigating to ${action.parameters.route}` };
    }

    return { success: false, message: "Unknown action type" };
};
