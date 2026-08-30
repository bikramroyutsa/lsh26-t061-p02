'use server';

import { GoogleGenAI } from '@google/genai';

const keysEnv = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;

export async function getActionSuggestion(expired: any[], atRisk: any[]) {
  if (!keysEnv) {
    return 'Gemini API Key missing. Please add GEMINI_API_KEYS to your .env file.';
  }

  const keys = keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) {
    return 'Gemini API Key missing. Please add GEMINI_API_KEYS to your .env file.';
  }

  // Pick a random key from the array to distribute load/quota
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  const ai = new GoogleGenAI({ apiKey: selectedKey });

  const prompt = `You are a financial inventory assistant for a pharmacy.
Here are the medicines that have already expired:
${expired.map((m) => `- ${m.medicine.name} (${m.medicine.quantity} units, total value at risk: ৳${Math.round(m.valueAtRisk)})`).join('\n') || 'None'}

Here are the medicines that are at risk of expiring soon:
${atRisk.map((m) => `- ${m.medicine.name} (${m.medicine.quantity} units, total value at risk: ৳${Math.round(m.valueAtRisk)}, ${m.daysRemaining} days left)`).join('\n') || 'None'}

Provide a short, actionable recommendation (2-3 sentences max) on how to handle these. Suggest returning expired items to suppliers for credit, and running a targeted discount or wholesale bulk sale for the at-risk items before they expire. Keep it professional but urgent. Do not use markdown formatting like bolding or bullet points, just output the plain text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error('Error generating suggestion from Gemini:', error);
    return 'Unable to generate recommendation at this time. Please check your Gemini API key and quota.';
  }
}
