'use client';

import React, { useState, useCallback } from 'react';
import { FileText, BarChart3, BookOpen } from 'lucide-react';
import SampleCaseSelector from '@/components/HUD/SampleCaseSelector';
import ChartEditor from '@/components/HUD/ChartEditor';
import OCRUploadButton from '@/components/HUD/OCRUploadButton';
import ScoreGauge from '@/components/HUD/ScoreGauge';
import CriteriaChecklist from '@/components/HUD/CriteriaChecklist';
import PolicyCitationDrawer from '@/components/HUD/PolicyCitationDrawer';
import PacketGeneratorModal from '@/components/HUD/PacketGeneratorModal';

// ---------------------------------------------------------------------------
// Placeholder data — wired for UI demo. Replace with real API results later.
// ---------------------------------------------------------------------------

interface SatisfiedCriterion {
  id: string;
  description: string;
  chartCitation: string;
}

interface MissingCriterion {
  id: string;
  description: string;
  issue: string;
  recommendedAction: string;
}

interface PolicyCriterion {
  id: string;
  description: string;
}

interface Policy {
  payerName: string;
  cptCode: string;
  lcdNumber: string;
  versionDate: string;
  criteria: PolicyCriterion[];
}

interface CaseEvalResult {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  satisfiedCriteria: SatisfiedCriterion[];
  missingCriteria: MissingCriterion[];
  policy: Policy;
  letter: string;
}

const PLACEHOLDER_RESULTS: Record<string, CaseEvalResult> = {
  'lumbar-mri': {
    score: 38,
    riskLevel: 'High',
    satisfiedCriteria: [
      {
        id: 'sat-1',
        description: 'Clinical signs of radiculopathy documented',
        chartCitation: 'Chart: "Positive straight leg raise at 40°, diminished right Achilles reflex"',
      },
    ],
    missingCriteria: [
      {
        id: 'miss-1',
        description: 'Minimum 6 weeks conservative management required',
        issue: 'Only 8 weeks PT documented — Aetna requires 12 weeks comprehensive conservative care',
        recommendedAction: 'Document additional 4 weeks of structured PT with progress notes.',
      },
      {
        id: 'miss-2',
        description: 'Prior X-ray within 6 months required',
        issue: 'X-ray performed but report date > 6 months old at time of request',
        recommendedAction: 'Obtain updated weight-bearing X-rays before resubmission.',
      },
      {
        id: 'miss-3',
        description: 'Failure of at least 2 epidural steroid injections',
        issue: 'Only one ESI documented with clear failure; payer requires minimum of two attempts',
        recommendedAction: 'Administer second ESI or document contraindication with supporting rationale.',
      },
    ],
    policy: {
      payerName: 'Aetna',
      cptCode: '72148',
      lcdNumber: 'L37842',
      versionDate: '2026-06-15',
      criteria: [
        { id: 'pc-1', description: 'Clinical evidence of radiculopathy with sensory or motor deficits on physical examination' },
        { id: 'pc-2', description: 'Minimum 12 weeks of structured conservative management (PT, NSAIDs, activity modification)' },
        { id: 'pc-3', description: 'Plain radiographs (X-ray) within preceding 6 months' },
        { id: 'pc-4', description: 'Failure of at least two therapeutic epidural steroid injections' },
        { id: 'pc-5', description: 'Surgical consultation note when surgical intervention anticipated' },
      ],
    },
    letter: `PRIOR AUTHORIZATION JUSTIFICATION LETTER
=============================================
Date: July 23, 2026
To: Aetna Utilization Management
Re: CPT 72148 — MRI Lumbar Spine without Contrast
Patient ID: [REDACTED]

Dear Medical Reviewer,

This letter serves as a formal request for prior authorization of a lumbar spine MRI (CPT 72148) for the above-referenced patient.

CLINICAL SUMMARY:
57-year-old male with 6+ months of chronic low back pain radiating to the right leg. Physical exam reveals a positive straight leg raise at 40°, diminished right Achilles reflex, and 4/5 strength in right plantar flexion — objective findings consistent with L5-S1 radiculopathy.

MEDICAL NECESSITY JUSTIFICATION:
The patient has failed comprehensive conservative management including 8 weeks of structured physical therapy, NSAID therapy, and an epidural steroid injection without lasting relief. While the payer policy requires 12 weeks of conservative care, the severity and progression of neurological deficits warrant expedited imaging to rule out surgical pathology.

We respectfully request authorization for this medically necessary study to prevent further neurological deterioration and guide appropriate surgical planning.

Sincerely,
[Provider Name, MD]
[Provider NPI]
[Date]`,
  },

  'knee-arthroplasty': {
    score: 72,
    riskLevel: 'Medium',
    satisfiedCriteria: [
      {
        id: 'sat-1',
        description: 'Radiographic evidence of advanced OA (K-L grade 4)',
        chartCitation: 'Chart: "Kellgren-Lawrence grade 4 OA right knee" on X-ray',
      },
      {
        id: 'sat-2',
        description: 'Failure of conservative management > 3 months',
        chartCitation: 'Chart: "Failed PT, corticosteroid injections, viscosupplementation"',
      },
      {
        id: 'sat-3',
        description: 'Significant functional limitation documented',
        chartCitation: 'Chart: "Painful ROM 5-90°, varus deformity"',
      },
    ],
    missingCriteria: [
      {
        id: 'miss-1',
        description: 'BMI documentation and weight management counseling',
        issue: 'BMI 32 documented but no evidence of formal weight management program participation',
        recommendedAction: 'Document enrollment or referral to a structured weight management program.',
      },
    ],
    policy: {
      payerName: 'Blue Cross Blue Shield',
      cptCode: '27447',
      lcdNumber: 'L35125',
      versionDate: '2026-04-01',
      criteria: [
        { id: 'pc-1', description: 'Advanced joint disease confirmed by radiography (K-L grade 3 or 4)' },
        { id: 'pc-2', description: 'Failure of at least 3 months of non-surgical management' },
        { id: 'pc-3', description: 'Significant pain and functional limitation affecting ADLs' },
        { id: 'pc-4', description: 'BMI < 40 or documented participation in weight management program' },
        { id: 'pc-5', description: 'Pre-operative medical clearance' },
      ],
    },
    letter: `PRIOR AUTHORIZATION JUSTIFICATION LETTER
=============================================
Date: July 23, 2026
To: BCBS Utilization Management
Re: CPT 27447 — Total Knee Arthroplasty, Right
Patient ID: [REDACTED]

Dear Medical Reviewer,

This letter requests prior authorization for a right total knee arthroplasty (CPT 27447).

CLINICAL SUMMARY:
68-year-old female with end-stage tricompartmental osteoarthritis of the right knee (Kellgren-Lawrence grade 4). The patient has exhausted all conservative measures including physical therapy, multiple corticosteroid injections, and viscosupplementation over 3+ years.

MEDICAL NECESSITY JUSTIFICATION:
Radiographic and clinical findings confirm advanced degenerative joint disease refractory to comprehensive non-surgical management. The patient meets all major BCBS criteria: radiographic severity, failure of conservative treatment, and significant functional limitation.

We request authorization for this medically necessary procedure.

Sincerely,
[Provider Name, MD]
[Provider NPI]`,
  },

  'cardiac-echo': {
    score: 91,
    riskLevel: 'Low',
    satisfiedCriteria: [
      {
        id: 'sat-1',
        description: 'Clinical signs/symptoms of heart failure documented',
        chartCitation: 'Chart: "DOE, orthopnea, JVD, bibasilar crackles, 2+ pitting edema"',
      },
      {
        id: 'sat-2',
        description: 'Elevated BNP consistent with CHF',
        chartCitation: 'Chart: "BNP 1,200 pg/mL (elevated)"',
      },
      {
        id: 'sat-3',
        description: 'No prior echo within 6 months',
        chartCitation: 'Chart: No prior echocardiogram documented',
      },
      {
        id: 'sat-4',
        description: 'Physical exam findings support cardiac evaluation',
        chartCitation: 'Chart: "Sinus tachycardia, non-specific ST-T changes on ECG"',
      },
    ],
    missingCriteria: [],
    policy: {
      payerName: 'Medicare MAC (Novitas)',
      cptCode: '93306',
      lcdNumber: 'L35036',
      versionDate: '2026-05-01',
      criteria: [
        { id: 'pc-1', description: 'Signs or symptoms of new or worsening cardiac disease' },
        { id: 'pc-2', description: 'No prior echocardiogram within the preceding 6 months' },
        { id: 'pc-3', description: 'Clinical findings that would impact management decisions' },
        { id: 'pc-4', description: 'Elevated BNP or NT-proBNP when heart failure suspected' },
      ],
    },
    letter: `PRIOR AUTHORIZATION JUSTIFICATION LETTER
=============================================
Date: July 23, 2026
To: Medicare MAC (Novitas)
Re: CPT 93306 — Transthoracic Echocardiogram, Complete
Patient ID: [REDACTED]

Dear Medical Reviewer,

This letter requests prior authorization for a complete transthoracic echocardiogram (CPT 93306).

CLINICAL SUMMARY:
72-year-old male with known CAD, hypertension, and type 2 DM presenting with new-onset heart failure symptoms including dyspnea on exertion, orthopnea, bibasilar crackles, JVD, and bilateral pitting edema. BNP is markedly elevated at 1,200 pg/mL with sinus tachycardia on ECG.

MEDICAL NECESSITY JUSTIFICATION:
The patient meets all Medicare LCD criteria for echocardiography: new signs and symptoms of cardiac disease, elevated BNP consistent with decompensated heart failure, no recent echo, and clinical findings that will directly impact management (differentiation of HFpEF vs. HFrEF, evaluation for valvular pathology, and guidance of GDMT initiation).

This study is medically necessary and time-sensitive. We request expedited authorization.

Sincerely,
[Provider Name, MD]
[Provider NPI]`,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SplitScreenContainer() {
  // ---- UI State -----------------------------------------------------------
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [chartNote, setChartNote] = useState('');
  const [evalResult, setEvalResult] = useState<CaseEvalResult | null>(null);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isPacketOpen, setIsPacketOpen] = useState(false);

  // ---- Handlers -----------------------------------------------------------

  const handleSelectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    const result = PLACEHOLDER_RESULTS[caseId] || null;
    setEvalResult(result);
    // Optionally pre-fill chart note from sample data (for the OCR button flow)
    if (result) {
      // Don't auto-fill editor on case selection — user can use OCR button for that
    }
  }, []);

  const handleOCRComplete = useCallback(
    (text: string, caseId?: string) => {
      setChartNote(text);
      if (caseId) {
        setSelectedCaseId(caseId);
        const result = PLACEHOLDER_RESULTS[caseId] || null;
        setEvalResult(result);
      }
    },
    []
  );

  // ---- Derived values -----------------------------------------------------
  const score = evalResult?.score ?? 0;
  const riskLevel = evalResult?.riskLevel ?? 'High';
  const satisfiedCriteria = evalResult?.satisfiedCriteria ?? [];
  const missingCriteria = evalResult?.missingCriteria ?? [];
  const policy = evalResult?.policy ?? null;
  const letter = evalResult?.letter ?? '';

  return (
    <>
      <div
        className="flex flex-col lg:flex-row gap-4 w-full"
        style={{ minHeight: 'calc(100vh - 7rem)' }}
      >
        {/* ================================================================ */}
        {/* LEFT PANEL — Clinical Input                                       */}
        {/* ================================================================ */}
        <div className="flex-1 lg:w-1/2 flex flex-col gap-4 min-h-0">
          {/* Panel Header */}
          <div className="glass-card p-1 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-accent-cyan/10">
              <div className="p-1.5 rounded-md bg-accent-cyan/10">
                <FileText size={16} className="text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Clinical Chart Editor
                </h2>
                <p className="text-[10px] text-text-secondary">
                  Paste or type clinical notes &bull; PHI scrubbed client-side
                </p>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 space-y-4">
              {/* Sample Case Selector */}
              <SampleCaseSelector onSelectCase={handleSelectCase} />

              {/* Chart Editor */}
              <div className="min-h-0">
                <ChartEditor value={chartNote} onChange={setChartNote} />
              </div>

              {/* OCR Upload Button */}
              <OCRUploadButton
                onOCRComplete={handleOCRComplete}
                selectedCaseId={selectedCaseId}
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL — Audit Scorecard                                     */}
        {/* ================================================================ */}
        <div className="flex-1 lg:w-1/2 flex flex-col gap-4 min-h-0">
          <div className="glass-card p-1 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-accent-cyan/10">
              <div className="p-1.5 rounded-md bg-accent-gold/10">
                <BarChart3 size={16} className="text-accent-gold" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Audit Scorecard &amp; Criteria
                </h2>
                <p className="text-[10px] text-text-secondary">
                  Real-time approval likelihood &bull; Criteria checklist
                </p>
              </div>
            </div>

            {/* Scrollable right panel content */}
            <div className="overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
              {/* Score Gauge */}
              {evalResult ? (
                <ScoreGauge score={score} riskLevel={riskLevel} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 p-4 rounded-full bg-accent-gold/5 border border-accent-gold/10">
                    <BarChart3 size={40} className="text-accent-gold/30" />
                  </div>
                  <p className="text-sm text-text-secondary/60 max-w-xs">
                    Select a sample case or enter clinical notes to see the approval likelihood score.
                  </p>
                </div>
              )}

              {/* Criteria Checklist */}
              <CriteriaChecklist
                satisfiedCriteria={satisfiedCriteria}
                missingCriteria={missingCriteria}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* View Policy Button */}
                <button
                  onClick={() => setIsPolicyOpen(true)}
                  disabled={!policy}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                             border border-accent-cyan/30 text-accent-cyan text-xs font-medium
                             hover:bg-accent-cyan/10 transition-all duration-200
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <BookOpen size={14} />
                  View Active LCD/NCD Policy
                </button>

                {/* Generate Packet Button */}
                <button
                  onClick={() => setIsPacketOpen(true)}
                  disabled={!letter}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                             bg-gradient-to-r from-accent-cyan/20 to-accent-cyan/5
                             border border-accent-cyan/40 text-accent-cyan text-xs font-medium
                             hover:from-accent-cyan/30 hover:to-accent-cyan/10
                             transition-all duration-200
                             disabled:opacity-30 disabled:cursor-not-allowed
                             shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                >
                  <FileText size={14} />
                  Generate Appeal Packet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* OVERLAYS — Drawer & Modal                                        */}
      {/* ================================================================ */}
      <PolicyCitationDrawer
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        policy={policy}
      />

      <PacketGeneratorModal
        isOpen={isPacketOpen}
        onClose={() => setIsPacketOpen(false)}
        letter={letter}
      />
    </>
  );
}
