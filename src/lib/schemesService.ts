/**
 * Schemes Service - AI-powered scheme search and recommendations
 *
 * Performance optimization: Pass availableSchemes from cache to avoid duplicate AI calls.
 * When schemes are pre-loaded, searchByLifeEvent will filter from cache instead of generating new ones.
 */

export interface UserProfile {
  age: number;
  gender: string;
  income: number;
  occupation: string;
  location: string;
  category: string;
  disability: boolean;
  familySize?: number;
}

export const schemesService = {
  async searchByLifeEvent(
    query: string,
    availableSchemes?: any[],
    userProfile?: Partial<UserProfile>,
  ) {
    const { generateContent } = await import("@/lib/geminiService");

    // If we have cached schemes, filter and rank from them
    if (availableSchemes && availableSchemes.length > 0) {
      const schemesList = availableSchemes
        .map((s) => `- ${s.name} (${s.category}): ${s.benefits}`)
        .join("\n");

      const prompt = `User life event query: "${query}"
${userProfile ? `\nUser context: Age ${userProfile.age}, Location ${userProfile.location}, Income ₹${userProfile.income}` : ""}

From the following list of available Indian government schemes, identify and rank the most relevant ones for this life situation:

${schemesList}

Return JSON array with the most relevant schemes:
[
  {
    "scheme": "Exact scheme name from the list above",
    "relevance": "Why this scheme matches the user's situation (2-3 sentences)",
    "priority": "high/medium",
    "category": "Health/Pension/Employment/Housing/etc",
    "keyBenefits": "Brief summary of main benefits"
  }
]

Provide 3-7 most relevant schemes from the list. Be empathetic and specific to the life event.
Only return schemes that exist in the provided list.
RETURN JSON ARRAY ONLY.`;

      try {
        const text = await generateContent(
          prompt,
          "accounts/fireworks/models/gpt-oss-120b",
          2048,
        );
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (!jsonMatch) {
          console.error("No JSON array found in response:", text);
          return [];
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error("Life event search error:", error);
        throw error;
      }
    }

    // Fallback: Generate schemes if no cache available
    const prompt = `User life event query: "${query}"
${userProfile ? `\nUser context: Age ${userProfile.age}, Location ${userProfile.location}, Income ₹${userProfile.income}` : ""}

Identify relevant Indian government schemes for this life situation.
Consider schemes like:
- For military/veteran families: Ex-Servicemen Contributory Health Scheme (ECHS), Armed Forces Family Pension, War Widow Pension
- For new parents: Maternity Benefit Programme, Pradhan Mantri Matru Vandana Yojana, Child care schemes
- For unemployed: MGNREGA, PM-SVANidhi, Skill India Mission
- For students: scholarships, education loans
- For farmers: PM-KISAN, crop insurance schemes
- For senior citizens: pension schemes, senior citizen savings
- For disabled persons: disability pension, UDID, assistance schemes

Return JSON array with detailed information:
[
  {
    "scheme": "Official scheme name",
    "relevance": "Why this scheme matches the user's situation (2-3 sentences)",
    "priority": "high/medium",
    "category": "Health/Pension/Employment/Housing/etc",
    "keyBenefits": "Brief summary of main benefits"
  }
]

Provide 3-7 most relevant schemes. Be empathetic and specific to the life event.
RETURN JSON ARRAY ONLY.`;

    try {
      const text = await generateContent(
        prompt,
        "accounts/fireworks/models/gpt-oss-120b",
        2048,
      );
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        console.error("No JSON array found in response:", text);
        return [];
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Life event search error:", error);
      throw error;
    }
  },

  async checkEligibility(schemeId: string, userProfile: UserProfile) {
    const { generateContent } = await import("@/lib/geminiService");

    const prompt = `Analyze eligibility for scheme: ${schemeId}

User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Annual Income: ₹${userProfile.income}
- Occupation: ${userProfile.occupation}
- State/Location: ${userProfile.location}
- Category: ${userProfile.category}
- Disability: ${userProfile.disability ? "Yes" : "No"}
- Family Size: ${userProfile.familySize || "Not specified"}

Analyze against actual scheme rules and return JSON:
{
  "eligible": "Yes/Partial/No",
  "score": 0-100,
  "reasoning": "detailed explanation",
  "matchedCriteria": ["criterion1", "criterion2"],
  "unmatchedCriteria": ["criterion1"],
  "recommendations": ["suggestion1", "suggestion2"]
}
RETURN JSON ONLY.`;

    const text = await generateContent(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("Invalid eligibility response");
    return JSON.parse(jsonMatch[0]);
  },
};
