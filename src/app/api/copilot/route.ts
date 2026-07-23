import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, isOpenRouterConfigured } from '@/lib/openrouter';

/**
 * POST /api/copilot
 *
 * Proxies DeepAI Copilot queries to OpenRouter for real AI responses.
 * Falls back gracefully by returning { ai: false } when the API
 * key is unavailable or the call fails — the client then uses
 * its rule-based response engine.
 *
 * Body: {
 *   query: string;          // user's message
 *   context?: {             // active case context (optional)
 *     payerName?: string;
 *     cptCode?: string;
 *     procedureName?: string;
 *     chartNote?: string;
 *     approvalScore?: number | null;
 *     riskLevel?: string;
 *     satisfiedCriteria?: { description: string }[];
 *     missingCriteria?: { description: string; recommendedAction: string }[];
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string | undefined = body.query;
    const context = body.context || {};

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "query" field.' },
        { status: 400 }
      );
    }

    if (!isOpenRouterConfigured()) {
      return NextResponse.json({ ai: false, content: '' });
    }

    // Build a rich system prompt with case context
    const systemPrompt = buildSystemPrompt(context);

    const aiResponse = await callOpenRouter(query, systemPrompt, {
      maxTokens: 600,
      temperature: 0.3,
    });

    if (!aiResponse) {
      return NextResponse.json({ ai: false, content: '' });
    }

    return NextResponse.json({ ai: true, content: aiResponse });
  } catch (err) {
    console.error('[copilot] Unexpected error:', err);
    return NextResponse.json({ ai: false, content: '' });
  }
}

function buildSystemPrompt(context: Record<string, unknown>): string {
  const parts: string[] = [
    'You are MedHero DeepAI, a prior authorization AI assistant for Healthcare Hustlers.',
    'Answer concisely about the active case. Be factual and cite guidelines when possible.',
    'Format your response with markdown for readability. Keep it under 500 words.',
  ];

  if (context.payerName) {
    parts.push(`\nACTIVE CASE CONTEXT:`);
    parts.push(`- Payer: ${context.payerName}`);
    parts.push(`- CPT Code: ${context.cptCode || 'N/A'}`);
    if (context.procedureName) parts.push(`- Procedure: ${context.procedureName}`);
    if (context.approvalScore !== null && context.approvalScore !== undefined) {
      parts.push(`- Approval Score: ${context.approvalScore}% (${context.riskLevel || 'Unknown'} risk)`);
    }

    if (Array.isArray(context.satisfiedCriteria) && context.satisfiedCriteria.length > 0) {
      const criteria = context.satisfiedCriteria as { description: string }[];
      parts.push(`- Satisfied Criteria: ${criteria.map((c) => c.description).join('; ')}`);
    }

    if (Array.isArray(context.missingCriteria) && context.missingCriteria.length > 0) {
      const criteria = context.missingCriteria as { description: string; recommendedAction: string }[];
      parts.push(`- Missing Criteria: ${criteria.map((c) => `${c.description} (fix: ${c.recommendedAction})`).join('; ')}`);
    }

    if (context.chartNote) {
      const note = String(context.chartNote);
      parts.push(`- Chart Note Summary: ${note.substring(0, 300)}${note.length > 300 ? '...' : ''}`);
    }
  }

  return parts.join('\n');
}
