/**
 * AI-Powered Issue Analysis Service
 * 
 * This service uses a multimodal AI model to analyze an image of a civic issue
 * and automatically suggest a category, type, severity, title, and description.
 */

import { isAIEnabled, getAIStatus } from "./aiConfig";
import { generateContent } from "./geminiService";
import { ISSUE_CATEGORIES, ISSUE_TYPES, SEVERITY_LEVELS } from "./issueConfig";
import type { IssueCategory, IssueType, IssueSeverity } from "@/types/civicIssue";

export interface AIAnalysisResult {
  category: IssueCategory;
  issueType: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
}

// Function to convert a File to a base64 string
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

/**
 * Analyzes an image of a civic issue and returns structured suggestions.
 * 
 * @param imageFile The image file of the civic issue.
 * @returns A promise that resolves to an AIAnalysisResult object.
 */
export async function analyzeIssuePhoto(
  imageFile: File
): Promise<{ success: boolean; data?: AIAnalysisResult; error?: string }> {
  if (!isAIEnabled()) {
    return { success: false, error: "AI features are not enabled. Please configure the API key." };
  }

  const { model } = getAIStatus();
  if (model !== "llava-fireworks") {
      return { success: false, error: `The current AI model (${model}) does not support image analysis. Please switch to a vision-capable model.` };
  }

  try {
    const base64Image = await toBase64(imageFile);

    const categories = Object.values(ISSUE_CATEGORIES).map(c => `${c.id} (${c.label})`).join(', ');
    const types = Object.values(ISSUE_TYPES).map(t => `${t.id} (${t.label})`).join(', ');
    const severities = Object.values(SEVERITY_LEVELS).map(s => `${s.id} (${s.label})`).join(', ');

    const prompt = `
      Analyze the attached image of a civic issue. Based on the visual information, provide the following details in a structured JSON format:

      1.  **category**: Choose the most appropriate category for the issue from the following list: ${categories}.
      2.  **issueType**: Select the most specific issue type from this list: ${types}.
      3.  **severity**: Estimate the severity of the issue. Choose from: ${severities}.
      4.  **title**: Create a concise, descriptive title for the issue (max 100 characters).
      5.  **description**: Write a brief, neutral description of what is visible in the image (max 500 characters).

      Your response must be a valid JSON object with the keys "category", "issueType", "severity", "title", and "description".
    `;

    // This assumes `generateContent` is updated to handle multimodal input
    const aiResponse = await generateContent(prompt, model, [{ type: "image", base64_image: base64Image, mime_type: imageFile.type }]);
    
    const parsedResponse = JSON.parse(aiResponse);

    // Basic validation of the AI's response
    if (
      !parsedResponse.category ||
      !parsedResponse.issueType ||
      !parsedResponse.title
    ) {
      throw new Error("AI response is missing required fields.");
    }

    return {
      success: true,
      data: {
        category: parsedResponse.category as IssueCategory,
        issueType: parsedResponse.issueType as IssueType,
        severity: (parsedResponse.severity || "medium") as IssueSeverity,
        title: parsedResponse.title,
        description: parsedResponse.description || "",
      },
    };
  } catch (error) {
    console.error("Error analyzing issue photo:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during AI analysis.";
    return { success: false, error: `Failed to analyze image: ${errorMessage}` };
  }
}
