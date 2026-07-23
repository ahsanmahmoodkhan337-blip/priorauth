import { NextRequest, NextResponse } from 'next/server';
import { getPolicy, getGenericPolicy } from '@/lib/policies';
import { evaluateChart } from '@/lib/evaluationEngine';

/**
 * POST /api/audit-necessity
 *
 * Accepts: { chartNote: string, payerName: string, cptCode: string }
 * Returns: Structured evaluation JSON including approval score,
 *          risk level, satisfied/missing criteria, and a
 *          pre-formatted justification letter.
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

    // ---- Policy lookup ----
    const policy = getPolicy(payerName, cptCode) ?? getGenericPolicy(payerName, cptCode);

    // ---- Run evaluation ----
    const result = evaluateChart(chartNote.trim(), policy);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[audit-necessity] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
