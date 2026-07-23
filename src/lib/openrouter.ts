/**
 * OpenRouter AI Client
 * 
 * Calls the OpenRouter API with free models. Used by the audit engine
 * and DeepAI Copilot for real AI-powered responses. Gracefully falls
 * back to empty string when the API key is missing or the call fails.
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';
const DEFAULT_SYSTEM_PROMPT = 'You are a medical prior authorization AI assistant for Healthcare Hustlers. Be concise, factual, and cite clinical guidelines when possible.';

export interface OpenRouterOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Call OpenRouter chat completions and return the text response.
 * Returns empty string on any failure (missing key, network error, API error)
 * so callers can always fall back to rule-based logic.
 */
export async function callOpenRouter(
  prompt: string,
  systemPrompt?: string,
  options?: OpenRouterOptions
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return '';

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://healthcarehustlers.org',
        'X-Title': 'MedHero PriorAuth AI',
      },
      body: JSON.stringify({
        model: options?.model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: options?.maxTokens ?? 500,
        temperature: options?.temperature ?? 0.3,
      }),
      // Timeout after 15s so the UI isn't blocked indefinitely
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.warn('[openrouter] API returned', response.status, response.statusText);
      return '';
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  } catch (err) {
    console.warn('[openrouter] Call failed:', err);
    return '';
  }
}

/**
 * Check whether the OpenRouter API key is configured.
 */
export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}
