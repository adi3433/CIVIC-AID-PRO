export type AgentActionType =
    | "click_element"
    | "type_text"
    | "navigate"
    | "read_page"
    | "analyze_image"
    | "none";

export interface AgentAction {
    type: AgentActionType;
    parameters: {
        id?: string;
        text?: string;
        route?: string;
        description?: string;
    };
    rationale?: string;
}

export interface AgentState {
    isProcessing: boolean;
    currentAction?: AgentAction;
    history: string[];
    error?: string;
    isActive: boolean;
}

export interface AgentResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface PageElement {
    id: string;
    type: "button" | "input" | "link" | "text" | "interactive";
    text: string;
    position?: { x: number; y: number };
    interactable: boolean;
    role?: string;
    value?: string;
}

export interface AgentContext {
    currentUrl: string;
    pageTitle: string;
    interactiveElements: PageElement[];
    lastActionSuccess?: boolean;
}
