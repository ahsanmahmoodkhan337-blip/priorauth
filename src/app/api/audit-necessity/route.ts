import { NextRequest, NextResponse } from 'next/server';
import { getPolicy, getGenericPolicy } from '@/lib/policies';
import { evaluateChart } from '@/lib/evaluationEngine';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { callOpenRouter, isOpenRouterConfigured } from '@/lib/openrouter';

/**
 * POST /api/audit-necessity
 *
 * Accepts: { chartNote: string, payerName: string, cptCode: string, phone?: string }
 * Returns: Structured evaluation JSON including approval score,
 *          risk level, satisfied/missing criteria, and a
 *          pre-formatted justification letter.
 *
 * When Supabase is configured, policies are also looked up from the
 * payer_policies table (falling back to the in-memory registry) and
 * audit results are saved to the audit_results table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const chartNote: string | undefined = body.chartNote;
    const payerName: string | undefined = body.payerName;
    const cptCode: string | undefined = body.cptCode;

    // ---- Validation ----
    if (!chartNote || typeof chartNote !== 'string' || chartNote.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "chartNote" field.' },
        { status: 400 }
      );
    }

    if (!payerName || typeof payerName !== 'string' || payerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "payerName" field.' },
        { status: 400 }
      );
    }

    if (!cptCode || typeof cptCode !== 'string' || cptCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "cptCode" field.' },
        { status: 400 }
      );
    }

    // ---- Policy lookup (Supabase-first, then in-memory registry) ----
    let policy = getPolicy(payerName, cptCode) ?? getGenericPolicy(payerName, cptCode);

    // Try Supabase policy lookup if configured
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        try {
          const { data: dbPolicy, error: dbErr } = await client
            .from('payer_policies')
            .select('*')
            .eq('payer_name', payerName)
            .eq('cpt_code', cptCode)
            .eq('is_active', true)
            .maybeSingle();

          if (!dbErr && dbPolicy) {
            // Override with DB policy if found
            policy = {
              payerName: dbPolicy.payer_name,
              cptCode: dbPolicy.cpt_code,
              procedureName: dbPolicy.procedure_name,
              lcdNumber: dbPolicy.lcd_number || 'N/A',
              criteria: Array.isArray(dbPolicy.criteria) ? dbPolicy.criteria : [],
            };
          }
        } catch (err) {
          console.warn('[audit-necessity] Supabase policy lookup error, using in-memory:', err);
        }
      }
    }

    // ---- Run evaluation ----
    const result = evaluateChart(chartNote.trim(), policy);

    // ---- AI-powered analysis (if OpenRouter key is configured) ----
    let aiAnalysis: string | null = null;
    let aiUsed = false;

    if (isOpenRouterConfigured()) {
      const aiPrompt = buildAuditPrompt(chartNote.trim(), payerName, cptCode, policy.procedureName, result);
      const aiSystemPrompt = `You are a medical prior authorization auditor for Healthcare Hustlers. 
Review the chart note against payer coverage criteria and provide a structured assessment.
Return your analysis in this EXACT format:

APPROVAL_SCORE: [number between 0-100]
RISK_LEVEL: [Low/Medium/High]
CRITERIA_ASSESSMENT: [brief paragraph about which criteria are met vs missing]
MISSING_ITEMS: [bullet list of specific missing documentation or gaps]
RECOMMENDATION: [1-2 sentence actionable recommendation]

Keep the entire response under 300 words. Be specific and cite details from the chart note.`;

      try {
        const aiResponse = await callOpenRouter(aiPrompt, aiSystemPrompt, {
          maxTokens: 500,
          temperature: 0.2,
        });

        if (aiResponse) {
          aiAnalysis = aiResponse;
          aiUsed = true;

          // Attempt to parse AI approval score to augment rule-based result
          const scoreMatch = aiResponse.match(/APPROVAL_SCORE:\s*(\d+)/i);
          if (scoreMatch) {
            const aiScore = parseInt(scoreMatch[1], 10);
            if (!isNaN(aiScore) && aiScore >= 0 && aiScore <= 100) {
              // Blend: 60% rule-based, 40% AI
              const blendedScore = Math.round(result.approvalScore * 0.6 + aiScore * 0.4);
              result.approvalScore = blendedScore;

              // Recalculate risk level
              if (blendedScore >= 80) result.riskLevel = 'Low';
              else if (blendedScore >= 50) result.riskLevel = 'Medium';
              else result.riskLevel = 'High';
            }
          }
        }
      } catch (err) {
        console.warn('[audit-necessity] AI analysis failed, using rule-based only:', err);
      }
    }

    // ---- Save audit result to Supabase (non-blocking fire-and-forget) ----
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {
        const auditRow = {
          payer_name: result.payerName,
          cpt_code: result.cptCode,
          procedure_name: result.procedureName,
          approval_score: result.approvalScore,
          risk_level: result.riskLevel,
          satisfied_criteria: result.satisfiedCriteria,
          missing_criteria: result.missingCriteria,
          justification_letter: result.justificationLetter,
          chart_note_snapshot: chartNote.trim(),
        };

        // Fire-and-forget — don't block the response
        client.from('audit_results').insert(auditRow).then(({ error }) => {
          if (error) console.warn('[audit-necessity] Failed to save audit result:', error.message);
        }, (err: unknown) => {
          console.warn('[audit-necessity] Error saving audit result to Supabase:', err);
        });
      }
    }

    return NextResponse.json({
      ...result,
      aiAnalysis,
      aiUsed,
    }, { status: 200 });
  } catch (err) {
    console.error('[audit-necessity] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * Build the user prompt for the OpenRouter AI audit call.
 */
function buildAuditPrompt(
  chartNote: string,
  payerName: string,
  cptCode: string,
  procedureName: string,
  ruleBasedResult: {
    approvalScore: number;
    riskLevel: string;
    satisfiedCriteria: { description: string; chartCitation: string }[];
    missingCriteria: { description: string; recommendedAction: string }[];
  }
): string {
  return `PRIOR AUTHORIZATION AUDIT REQUEST

PAYER: ${payerName}
CPT CODE: ${cptCode}
PROCEDURE: ${procedureName}

RULE-BASED RESULT: ${ruleBasedResult.approvalScore}% (${ruleBasedResult.riskLevel} risk)

SATISFIED CRITERIA:
${ruleBasedResult.satisfiedCriteria.map((c) => `- ${c.description} [citation: ${c.chartCitation}]`).join('\n') || '(none)'}

MISSING CRITERIA:
${ruleBasedResult.missingCriteria.map((c) => `- ${c.description} → ${c.recommendedAction}`).join('\n') || '(none)'}

CHART NOTE:
"""
${chartNote}
"""

Please provide your expert assessment of this prior authorization request. Consider the payer's typical coverage criteria, the clinical documentation provided, and the rule-based engine's findings. Return your analysis in the requested format.`;
}
