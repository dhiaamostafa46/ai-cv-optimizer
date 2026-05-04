import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(GeminiService.name);
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error(`Gemini API error: ${error.message}`, error.stack);
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  async analyzeCV(
    cvText: string,
    jobDescription: string,
    additionalNotes: string
  ): Promise<{
    matchScore: number;
    missingKeywords: string[];
    optimizedFullCv: {
      summary: string;
      experience: string;
      skills: string;
    };
    suggestions?: Array<{
      before: string;
      after: string;
      explanation: string;
    }>;
  }> {
    const prompt = `
You are a professional career coach and ATS (Applicant Tracking System) expert.
Analyze the following CV text against the provided job description and additional user notes.

CV Text:
${cvText}

Job Description:
${jobDescription}

Additional User Notes/Preferences:
${additionalNotes || 'None'}

Tasks:
1. Calculate a Match Score (0-100%) based on keyword relevance, skills alignment, and experience matching.
2. Identify missing keywords that should be added to improve ATS ranking.
3. Generate a FULLY OPTIMIZED version of the CV tailored specifically for this job.
4. The optimized version must include:
   - A compelling Professional Summary (3-4 lines)
   - Optimized Work Experience bullet points (quantified achievements)
   - A Skills section with relevant keywords

Return ONLY a valid JSON response with this exact structure:
{
  "matchScore": number,
  "missingKeywords": string[],
  "optimizedFullCv": {
    "summary": string,
    "experience": string,
    "skills": string
  },
  "suggestions": [
    {
      "before": string,
      "after": string,
      "explanation": string
    }
  ]
}

Do NOT include markdown code fences or any text outside the JSON structure.
`;

    const text = await this.generateContent(prompt);

    // Clean response: remove markdown fences if present
    const cleanedText = text.replace(/```json|```/g, '').trim();

    try {
      const result = JSON.parse(cleanedText);

      // Validate structure
      if (typeof result.matchScore === 'undefined' || !Array.isArray(result.missingKeywords)) {
        throw new Error('Invalid response structure');
      }

      return result;
    } catch (parseError) {
      // Fallback: try to extract JSON object from response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          this.logger.error(`Failed to parse AI response: ${cleanedText}`);
          throw new Error('Invalid AI response format');
        }
      }
      this.logger.error(`Failed to parse AI response: ${cleanedText}`);
      throw new Error('Failed to parse AI response');
    }
  }
}