import { NextRequest, NextResponse } from 'next/server';
import { getPolicy, getGenericPolicy } from '@/lib/policies';
import { evaluateChart } from '@/lib/evaluationEngine';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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
        }).catch((err) => {
          console.warn('[audit-necessity] Error saving audit result to Supabase:', err);
        });
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[audit-necessity] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
