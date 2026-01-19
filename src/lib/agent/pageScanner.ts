import { PageElement } from "./types";
import { agentCache } from "./agentCache";

/**
 * Scans the current page for interactive elements and returns a simplified
 * accessibility tree for the agent to understand.
 * OPTIMIZED: Caching, Priority scoring, viewport awareness, limited element count
 */
export const scanPage = (forceRefresh: boolean = false): PageElement[] => {
    const currentUrl = window.location.pathname;

    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
        const cached = agentCache.getPageContext(currentUrl);
        if (cached) {
            return cached;
        }
    }

    const elements: PageElement[] = [];
    const MAX_ELEMENTS = 100; // Limit for performance

    // Select all potentially interactive elements
    const interactiveSelectors = [
        "[data-agent-id]",  // Prioritize semantic IDs first
        "button",
        "a[href]",
        "input:not([type='hidden'])",
        "textarea",
        "select",
        "[role='button']",
        "[role='tab']",
        "[role='checkbox']",
        "[role='radio']"
    ];

    const domElements = document.querySelectorAll(interactiveSelectors.join(","));

    domElements.forEach((el) => {
        if (elements.length >= MAX_ELEMENTS) return; // Performance cap

        const element = el as HTMLElement;

        // Skip invisible or disabled elements (fast check first)
        if ((element as HTMLButtonElement).disabled) return;
        if (!isVisible(element)) return;

        // Determine a usable ID with priority scoring
        const agentId = element.getAttribute("data-agent-id");
        const htmlId = element.id;
        const ariaLabel = element.getAttribute("aria-label");
        const text = element.innerText?.trim().substring(0, 50) || element.getAttribute("placeholder") || "";

        // Priority: data-agent-id > id > aria-label > generated
        let id = agentId || htmlId || "";
        let priority = 0;

        if (agentId) {
            priority = 100;
        } else if (htmlId) {
            priority = 80;
        } else if (ariaLabel) {
            id = ariaLabel.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30);
            priority = 60;
        } else if (text) {
            id = text.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
            priority = 40;
            element.setAttribute("data-autogen-id", id);
        }

        if (!id) return;

        // Determine type
        let type: PageElement["type"] = "interactive";
        const tagName = element.tagName.toLowerCase();
        if (tagName === "button" || element.getAttribute("role") === "button") type = "button";
        else if (tagName === "input" || tagName === "textarea") type = "input";
        else if (tagName === "a") type = "link";

        elements.push({
            id,
            type,
            text: text || ariaLabel || "",
            interactable: true,
            role: element.getAttribute("role") || tagName,
            value: (element as HTMLInputElement).value,
            priority // Priority score for sorting
        });
    });

    // Sort by priority (highest first) for better agent decisions
    const sorted = elements.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Cache the results
    agentCache.setPageContext(currentUrl, document.title, sorted);

    return sorted;
};

// Helper: Check if element is visible (optimized)
const isVisible = (el: HTMLElement): boolean => {
    // Fast path: check dimensions first
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;

    // Only compute style if needed
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
};

/**
 * Find element by ID with multiple fallback strategies
 * OPTIMIZED: Ordered by likelihood of success
 */
export const findElementById = (id: string): HTMLElement | null => {
    if (!id) return null;

    // Strategy 1: Exact data-agent-id (most reliable)
    let el = document.querySelector(`[data-agent-id="${id}"]`);
    if (el) return el as HTMLElement;

    // Strategy 2: Regular HTML ID
    el = document.getElementById(id);
    if (el) return el as HTMLElement;

    // Strategy 3: Auto-generated ID
    el = document.querySelector(`[data-autogen-id="${id}"]`);
    if (el) return el as HTMLElement;

    // Strategy 4: Aria-label match
    el = document.querySelector(`[aria-label="${id}"]`);
    if (el) return el as HTMLElement;

    // Strategy 5: Partial text match (limited to interactive elements only)
    const idLower = id.toLowerCase();
    const interactiveElements = document.querySelectorAll("button, a, input, [role='button'], [role='tab']");
    for (const e of interactiveElements) {
        const htmlEl = e as HTMLElement;
        const text = htmlEl.innerText?.toLowerCase() || "";
        if (text.includes(idLower) && isVisible(htmlEl)) {
            return htmlEl;
        }
    }

    return null;
};

/**
 * Find similar element when exact match fails (for retry logic)
 */
export const findSimilarElement = (target: string, elements: PageElement[]): PageElement | null => {
    const targetLower = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    let bestMatch: PageElement | null = null;
    let bestScore = 0;

    for (const el of elements) {
        const idLower = el.id.toLowerCase().replace(/[^a-z0-9]/g, "");
        const textLower = (el.text || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        // Check ID similarity
        if (idLower.includes(targetLower) || targetLower.includes(idLower)) {
            const score = Math.min(idLower.length, targetLower.length) / Math.max(idLower.length, targetLower.length);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = el;
            }
        }

        // Check text similarity
        if (textLower.includes(targetLower) && 0.6 > bestScore) {
            bestScore = 0.6;
            bestMatch = el;
        }
    }

    return bestScore > 0.4 ? bestMatch : null;
};
