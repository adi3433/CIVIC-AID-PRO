import intentsMapping from "./intentsMapping.json";

interface Intent {
  id: string;
  route?: string;
  action?: string;
  keywords: string[];
  description: string;
  examples: string[];
}

interface VoiceNavigationResult {
  success: boolean;
  route?: string;
  action?: string;
  intent?: Intent;
  confidence?: number;
  transcript?: string;
  error?: string;
}

// Check if Fireworks API is initialized
const checkFireworksAPI = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY;
  return !!apiKey;
};

/**
 * Translate non-English text to English for intent matching
 */
async function translateToEnglish(
  text: string,
  sourceLanguage: string,
): Promise<string> {
  if (!checkFireworksAPI()) {
    console.warn("Fireworks API not configured, skipping translation");
    return text;
  }

  try {
    const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY;

    const prompt = `Translate the following ${sourceLanguage} text to English. Respond ONLY with the English translation, nothing else.

${sourceLanguage} text: "${text}"

English translation:`;

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/gpt-oss-120b",
          max_tokens: 256,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translation = data.choices[0]?.message?.content?.trim() || text;

    console.log(
      `🌐 Translated from ${sourceLanguage}:`,
      text,
      "→",
      translation,
    );
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}

/**
 * Use Gemini 2.5 Flash to match user's speech to the best intent
 */
async function matchIntentWithAI(
  transcript: string,
): Promise<{ intent: Intent; confidence: number } | null> {
  if (!checkFireworksAPI()) {
    console.warn("Fireworks API not configured, using fallback");
    return matchIntentFallback(transcript);
  }

  try {
    const apiKey = import.meta.env.VITE_FIREWORKS_API_KEY;
    const intents = intentsMapping.intents;

    // Create a concise prompt for Gemini
    const intentsInfo = intents
      .map(
        (intent) =>
          `${intent.id}: ${intent.description} (Keywords: ${intent.keywords.join(", ")})`,
      )
      .join("\n");

    const prompt = `You are a navigation intent classifier for a citizen services app.

User said: "${transcript}"

Available intents:
${intentsInfo}

TASK: Match the user's request to the BEST intent. Respond ONLY with valid JSON:
{
  "intent_id": "the_best_matching_intent_id",
  "confidence": <number between 0-100>,
  "reasoning": "brief explanation"
}

RULES:
1. Choose the MOST relevant intent based on keywords and description
2. Confidence should reflect how well it matches (exact match = 95+, good match = 70-90, weak = 50-70)
3. If no good match exists, return intent_id: "home" with low confidence`;

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/gpt-oss-120b",
          max_tokens: 512,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "";

    console.log("🤖 AI Intent Response:", aiResponse);

    // Parse JSON response
    const cleanJson = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");

    const result = JSON.parse(jsonMatch[0]);
    const matchedIntent = intents.find(
      (intent) => intent.id === result.intent_id,
    );

    if (!matchedIntent) {
      throw new Error("Intent not found");
    }

    return {
      intent: matchedIntent,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error("❌ AI intent matching error:", error);
    return matchIntentFallback(transcript);
  }
}

/**
 * Fallback intent matching using keyword search
 */
function matchIntentFallback(
  transcript: string,
): { intent: Intent; confidence: number } | null {
  const lowerTranscript = transcript.toLowerCase();
  const intents = intentsMapping.intents;

  let bestMatch: { intent: Intent; score: number } | null = null;

  for (const intent of intents) {
    let score = 0;

    // Check keywords
    for (const keyword of intent.keywords) {
      if (lowerTranscript.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Check examples (partial match)
    for (const example of intent.examples) {
      const exampleWords = example.toLowerCase().split(" ");
      const matchingWords = exampleWords.filter((word) =>
        lowerTranscript.includes(word),
      );
      score += matchingWords.length * 2;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { intent, score };
    }
  }

  if (bestMatch) {
    const confidence = Math.min(bestMatch.score * 3, 85); // Cap at 85% for fallback
    return { intent: bestMatch.intent, confidence };
  }

  // Default to home
  const homeIntent = intents.find((i) => i.id === "home");
  return homeIntent ? { intent: homeIntent, confidence: 30 } : null;
}

/**
 * Capture voice input and convert to text using Web Speech API
 */
export function captureVoiceInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported in this browser"));
      return;
    }

    const recognition = new SpeechRecognition();

    // Get current language from localStorage
    const currentLanguage = localStorage.getItem("app_language") || "en";

    // Map language codes to speech recognition locales
    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN",
      ta: "ta-IN",
      ml: "ml-IN", // Malayalam India
    };

    recognition.lang = langMap[currentLanguage] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Voice Input:", transcript, `(${recognition.lang})`);
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };

    try {
      recognition.start();
      console.log("🎤 Listening...");
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Main voice navigation function
 */
export async function processVoiceNavigation(): Promise<VoiceNavigationResult> {
  try {
    // Step 1: Capture voice input
    console.log("🎙️ Starting voice capture...");
    const transcript = await captureVoiceInput();

    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        error: "No speech detected",
      };
    }

    // Step 2: Translate to English if needed
    const currentLanguage = localStorage.getItem("app_language") || "en";
    let englishTranscript = transcript;

    if (currentLanguage !== "en") {
      console.log("🌐 Translating to English for intent matching...");
      const langNames: Record<string, string> = {
        hi: "Hindi",
        kn: "Kannada",
        ta: "Tamil",
        ml: "Malayalam",
      };
      englishTranscript = await translateToEnglish(
        transcript,
        langNames[currentLanguage] || "the input language",
      );
    }

    // Step 3: Match intent using AI (with English transcript)
    console.log("🧠 Matching intent with AI...");
    const match = await matchIntentWithAI(englishTranscript);

    if (!match) {
      return {
        success: false,
        transcript,
        error: "Could not match any intent",
      };
    }

    // Step 4: Return navigation result
    return {
      success: true,
      route: match.intent.route,
      action: match.intent.action,
      intent: match.intent,
      confidence: match.confidence,
      transcript, // Original transcript in user's language
    };
  } catch (error: any) {
    console.error("❌ Voice navigation error:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Get all available intents (for debugging/UI)
 */
export function getAllIntents(): Intent[] {
  return intentsMapping.intents;
}

/**
 * Match intent from text input (for chatbot integration)
 * Translates to English if needed before matching
 */
export async function matchIntentWithText(
  text: string,
): Promise<{ intent: Intent; confidence: number } | null> {
  // Translate to English if needed
  const currentLanguage = localStorage.getItem("app_language") || "en";
  let englishText = text;

  if (currentLanguage !== "en") {
    const langNames: Record<string, string> = {
      hi: "Hindi",
      kn: "Kannada",
      ta: "Tamil",
      ml: "Malayalam",
    };
    englishText = await translateToEnglish(
      text,
      langNames[currentLanguage] || "the input language",
    );
  }

  return matchIntentWithAI(englishText);
}
