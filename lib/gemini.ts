import { GoogleGenAI } from '@google/genai';
import { GeminiEnrichmentResponse } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';

/**
 * Analyzes snippet code with Gemini 2.5 Flash to extract:
 * 1. A single-sentence functional summary
 * 2. 3-5 relevant technical tags
 */
export async function enrichSnippetWithGemini(
  code: string,
  language: string
): Promise<GeminiEnrichmentResponse> {
  // Graceful fallback if no API key is provided in local dev
  if (!apiKey) {
    return {
      summary: `A reusable ${language} code snippet.`,
      tags: [language.toLowerCase(), 'snippet'],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Review the following ${language} code and return a JSON object with:
- "summary": A concise single sentence describing what this code does.
- "tags": An array of 3 to 5 lowercase keyword tags (no "#" prefix).

Code:
\`\`\`${language}
${code}
\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    return {
      summary: parsed.summary?.trim() || `A reusable ${language} code snippet.`,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((t: string) => t.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
        : [language.toLowerCase()],
    };
  } catch (error) {
    console.error('Gemini enrichment error:', error);
    // Keep user experience uninterrupted if rate-limited
    return {
      summary: `A reusable ${language} code snippet.`,
      tags: [language.toLowerCase(), 'utility'],
    };
  }
}