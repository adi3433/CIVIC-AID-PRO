import { PageElement } from "./types";

/**
 * Scans the current page for interactive elements and returns a simplified
 * accessibility tree for the agent to understand.
 */
export const scanPage = (): PageElement[] => {
    const elements: PageElement[] = [];

    // Select all potentially interactive elements
    const interactiveSelectors = [
        "button",
        "a[href]",
        "input:not([type='hidden'])",
        "textarea",
        "select",
        "[role='button']",
        "[role='tab']",
        "[role='checkbox']",
        "[role='radio']",
        ".cursor-pointer",
        "[onclick]"
    ];

    const domElements = document.querySelectorAll(interactiveSelectors.join(","));

    domElements.forEach((el) => {
        const element = el as HTMLElement;

        // Skip invisible or disabled elements
        if (!isVisible(element) || (element as HTMLButtonElement).disabled) return;

        // Determine a usable ID
        // 1. Semantic Agent ID
        // 2. HTML ID
        // 3. Aria Label
        // 4. Inner Text (cleaned)
        let id = element.getAttribute("data-agent-id") || element.id;
        const text = element.innerText || element.getAttribute("aria-label") || element.getAttribute("placeholder") || "";

        // If no ID, generate one from text content for easier referencing
        if (!id && text) {
            id = text.toLowerCase().substring(0, 20).replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/g, "");
            // Add a random suffix to ensure uniqueness if needed, or rely on position
            if (document.querySelectorAll(`[id='${id}']`).length > 0) {
                id = `${id}-${Math.floor(Math.random() * 1000)}`;
            }
            // Temporarily assign this ID to the DOM element so we can query it later
            element.setAttribute("data-autogen-id", id);
        }

        if (!id) return; // Skip if we really can't identify it

        // Determine type
        let type: PageElement["type"] = "interactive";
        const tagName = element.tagName.toLowerCase();
        if (tagName === "button" || element.getAttribute("role") === "button") type = "button";
        else if (tagName === "input" || tagName === "textarea") type = "input";
        else if (tagName === "a") type = "link";

        elements.push({
            id: id || element.getAttribute("data-autogen-id") || `el-${Math.random().toString(36).substr(2, 9)}`,
            type,
            text: text.trim().substring(0, 50), // Truncate long text
            interactable: true,
            role: element.getAttribute("role") || tagName,
            value: (element as HTMLInputElement).value
        });
    });

    return elements;
};

// Helper: Check if element is visible
const isVisible = (el: HTMLElement): boolean => {
    if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
};

// Helper: Find element by various ID strategies
export const findElementById = (id: string): HTMLElement | null => {
    // Try exact match first
    let el = document.getElementById(id);
    if (el) return el;

    // Try data-agent-id
    el = document.querySelector(`[data-agent-id='${id}']`);
    if (el) return el as HTMLElement;

    // Try auto-generated ID
    el = document.querySelector(`[data-autogen-id='${id}']`);
    if (el) return el as HTMLElement;

    // Fuzzy text match (last resort)
    // This is risky but helpful if the agent hallucinates a slightly wrong ID but correct text
    const allElements = document.querySelectorAll("*");
    for (let i = 0; i < allElements.length; i++) {
        const e = allElements[i] as HTMLElement;
        if (e.innerText?.toLowerCase().includes(id.toLowerCase()) && isVisible(e)) {
            return e;
        }
    }

    return null;
};
