import { PageElement } from "./types";

/**
 * Agent Cache System
 * Caches page context and AI decisions to reduce latency
 */

interface CachedPageContext {
    elements: PageElement[];
    timestamp: number;
    url: string;
    pageTitle: string;
}

interface CachedDecision {
    goal: string;
    url: string;
    action: string;
    parameters: Record<string, unknown>;
    confidence: number;
    timestamp: number;
}

class AgentCache {
    private pageCache: CachedPageContext | null = null;
    private decisionCache: Map<string, CachedDecision> = new Map();

    // Cache TTLs
    private PAGE_TTL = 5000;      // 5 seconds for page context
    private DECISION_TTL = 30000; // 30 seconds for decisions
    private MAX_DECISIONS = 20;   // Max cached decisions

    /**
     * Generate a cache key for a decision based on goal + URL
     */
    private getDecisionKey(goal: string, url: string): string {
        // Normalize goal: lowercase, trim, remove extra spaces
        const normalizedGoal = goal.toLowerCase().trim().replace(/\s+/g, " ");
        return `${url}::${normalizedGoal}`;
    }

    /**
     * Get cached page elements if still valid
     */
    getPageContext(currentUrl: string): PageElement[] | null {
        if (
            this.pageCache &&
            this.pageCache.url === currentUrl &&
            Date.now() - this.pageCache.timestamp < this.PAGE_TTL
        ) {
            console.log("📦 Cache HIT: Page context");
            return this.pageCache.elements;
        }
        return null;
    }

    /**
     * Cache page elements after scan
     */
    setPageContext(url: string, pageTitle: string, elements: PageElement[]): void {
        this.pageCache = {
            elements,
            timestamp: Date.now(),
            url,
            pageTitle,
        };
        console.log(`📦 Cache SET: Page context (${elements.length} elements)`);
    }

    /**
     * Invalidate page cache (e.g., after navigation or action)
     */
    invalidatePageContext(): void {
        this.pageCache = null;
    }

    /**
     * Get cached decision if same goal on same page
     */
    getDecision(goal: string, url: string): CachedDecision | null {
        const key = this.getDecisionKey(goal, url);
        const cached = this.decisionCache.get(key);

        if (cached && Date.now() - cached.timestamp < this.DECISION_TTL) {
            console.log("🧠 Cache HIT: Decision for goal");
            return cached;
        }

        // Clean up expired entry
        if (cached) {
            this.decisionCache.delete(key);
        }

        return null;
    }

    /**
     * Cache a decision for reuse
     */
    setDecision(
        goal: string,
        url: string,
        action: string,
        parameters: Record<string, unknown>,
        confidence: number
    ): void {
        const key = this.getDecisionKey(goal, url);

        // Evict oldest if at capacity
        if (this.decisionCache.size >= this.MAX_DECISIONS) {
            const oldest = [...this.decisionCache.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
            if (oldest) {
                this.decisionCache.delete(oldest[0]);
            }
        }

        this.decisionCache.set(key, {
            goal,
            url,
            action,
            parameters,
            confidence,
            timestamp: Date.now(),
        });

        console.log("🧠 Cache SET: Decision cached");
    }

    /**
     * Invalidate decision cache for a URL (after state change)
     */
    invalidateDecisions(url?: string): void {
        if (url) {
            // Remove all decisions for this URL
            for (const [key] of this.decisionCache) {
                if (key.startsWith(url)) {
                    this.decisionCache.delete(key);
                }
            }
        } else {
            this.decisionCache.clear();
        }
    }

    /**
     * Full cache clear
     */
    clear(): void {
        this.pageCache = null;
        this.decisionCache.clear();
        console.log("📦 Cache CLEARED");
    }

    /**
     * Get cache stats for debugging
     */
    getStats(): { pageContextCached: boolean; decisionsCount: number } {
        return {
            pageContextCached: this.pageCache !== null,
            decisionsCount: this.decisionCache.size,
        };
    }
}

// Singleton instance
export const agentCache = new AgentCache();
