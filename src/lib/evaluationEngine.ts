import type { PayerPolicy, PolicyCriterion } from '@/lib/policies';

// ---------------------------------------------------------------------------
// Public types returned by the evaluation engine
// ---------------------------------------------------------------------------

export interface SatisfiedCriterion {
  id: string;
  description: string;
  chartCitation: string;
}

export interface MissingCriterion {
  id: string;
  description: string;
  issue: string;
  recommendedAction: string;
}

export interface EvaluationResult {
  approvalScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  satisfiedCriteria: SatisfiedCriterion[];
  missingCriteria: MissingCriterion[];
  justificationLetter: string;
  payerName: string;
  cptCode: string;
  procedureName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function findKeywordInText(keyword: string, text: string): boolean {
  const pattern = new RegExp(
    `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
    'i'
  );
  return pattern.test(text);
}

/**
 * Check a single criterion against the chart note text.
 * Returns the first matching keyword found (as the "chart citation")
 * or `null` if no keyword matched.
 */
function evaluateCriterion(
  criterion: PolicyCriterion,
  chartNote: string
): string | null {
  if (criterion.keywords.length === 0) {
    // Keyword-less criteria are always "satisfied" — they need external
    // validation (like a date check).  The engine cannot decide, so we
    // skip them and the caller must handle them separately.
    return null;
  }
  const lowerText = normalize(chartNote);
  for (const kw of criterion.keywords) {
    if (findKeywordInText(normalize(kw), lowerText)) {
      return kw;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Patient detail extraction (lightweight — for the justification letter)
// ---------------------------------------------------------------------------

interface PatientInfo {
  age: number | null;
  gender: string;
}

function extractPatientInfo(chartNote: string): PatientInfo {
  const ageMatch = chartNote.match(/(\d{2,3})[- ]?(year[- ]?old|yo|y\.?o\.?|male|female)/i);
  let age: number | null = null;
  let gender = 'patient';

  if (ageMatch) {
    const parsed = parseInt(ageMatch[1], 10);
    if (parsed >= 18 && parsed <= 120) age = parsed;
  }

  // Try explicit age patterns
  const ageExplicit = chartNote.match(/(\d{2,3})\s*(year[- ]?old|yo|y\.?o\.?)/i);
  if (!age && ageExplicit) {
    const parsed = parseInt(ageExplicit[1], 10);
    if (parsed >= 18 && parsed <= 120) age = parsed;
  }

  if (/\bfemale\b/i.test(chartNote)) gender = 'female';
  else if (/\bmale\b/i.test(chartNote)) gender = 'male';

  return { age, gender };
}

// ---------------------------------------------------------------------------
// Justification letter generator
// ---------------------------------------------------------------------------

function generateLetter(
  result: EvaluationResult,
  chartNote: string
): string {
  const patient = extractPatientInfo(chartNote);
  const ageStr = patient.age ? `${patient.age}-year-old ${patient.gender}` : patient.gender;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const satisfiedBlock =
    result.satisfiedCriteria.length > 0
      ? result.satisfiedCriteria
          .map(
            (c) =>
              `  \u2713 ${c.description}\n    Supporting documentation: "${c.chartCitation}"`
          )
          .join('\n')
      : '  (None)';

  const missingBlock =
    result.missingCriteria.length > 0
      ? result.missingCriteria
          .map(
            (m) =>
              `  \u2717 ${m.description}\n    Issue: ${m.issue}\n    Recommendation: ${m.recommendedAction}`
          )
          .join('\n')
      : '  (None — all criteria are satisfied)';

  return `PRIOR AUTHORIZATION JUSTIFICATION LETTER
=============================================
Date: ${today}
To: ${result.payerName} Utilization Management
Re: CPT ${result.cptCode} — ${result.procedureName}
Patient: ${ageStr}

Dear Medical Reviewer,

This letter serves as a formal request for prior authorization of
${result.procedureName} (CPT ${result.cptCode}) for the above-referenced
patient.

CLINICAL SUMMARY:
The patient is a ${ageStr} presenting with clinical findings that meet
evidence-based criteria for ${result.procedureName} as outlined in the
payer's local coverage determination (${result.payerName} LCD).

The approval likelihood score for this request is ${result.approvalScore}%
(${result.riskLevel} risk of denial).

MEDICAL NECESSITY JUSTIFICATION — SATISFIED CRITERIA:
${satisfiedBlock}

CRITERIA REQUIRING ATTENTION:
${missingBlock}

We respectfully request authorization for this medically necessary study/
procedure to ensure appropriate patient care and optimal clinical outcomes.

Should additional clinical documentation be required, please do not
hesitate to contact our office.

Sincerely,
[Provider Name, MD]
[Provider NPI]
[Date: ${today}]`;
}

// ---------------------------------------------------------------------------
// Main evaluation entry point
// ---------------------------------------------------------------------------

export function evaluateChart(
  chartNote: string,
  policy: PayerPolicy
): EvaluationResult {
  const satisfied: SatisfiedCriterion[] = [];
  const missing: MissingCriterion[] = [];

  for (const criterion of policy.criteria) {
    const match = evaluateCriterion(criterion, chartNote);

    if (match) {
      satisfied.push({
        id: criterion.id,
        description: criterion.description,
        chartCitation: match,
      });
    } else if (criterion.mandatory) {
      // Mandatory and no keyword hit — this is a missing requirement
      let issue: string;
      let recommendation: string;

      if (criterion.keywords.length === 0) {
        issue =
          'Cannot automatically verify — this criterion requires manual date or document review';
        recommendation =
          'Verify this condition manually and attach supporting documentation if met';
      } else {
        issue =
          'Required clinical documentation not found in the chart note';
        recommendation =
          'Add documentation addressing this criterion and resubmit';
      }

      missing.push({
        id: criterion.id,
        description: criterion.description,
        issue,
        recommendedAction: recommendation,
      });
    }
    // Optional criteria that aren't matched are simply ignored
  }

  // ---- SCORE CALCULATION ----
  const mandatoryTotal = policy.criteria.filter((c) => c.mandatory).length;
  const mandatorySatisfied = satisfied.filter((c) => {
    const original = policy.criteria.find((o) => o.id === c.id);
    return original?.mandatory;
  }).length;

  let score = Math.round((mandatorySatisfied / Math.max(mandatoryTotal, 1)) * 100);

  // Bonus for optional criteria: up to +10%
  const optionalTotal = policy.criteria.filter((c) => !c.mandatory).length;
  if (optionalTotal > 0) {
    const optionalSatisfied = satisfied.filter((c) => {
      const original = policy.criteria.find((o) => o.id === c.id);
      return original && !original.mandatory;
    }).length;
    const bonus = Math.round((optionalSatisfied / optionalTotal) * 10);
    score = Math.min(100, score + bonus);
  }

  // ---- RISK LEVEL ----
  let riskLevel: 'Low' | 'Medium' | 'High';
  if (score >= 80) riskLevel = 'Low';
  else if (score >= 50) riskLevel = 'Medium';
  else riskLevel = 'High';

  const result: EvaluationResult = {
    approvalScore: score,
    riskLevel,
    satisfiedCriteria: satisfied,
    missingCriteria: missing,
    justificationLetter: '', // filled after we have the result
    payerName: policy.payerName,
    cptCode: policy.cptCode,
    procedureName: policy.procedureName,
  };

  result.justificationLetter = generateLetter(result, chartNote);

  return result;
}
