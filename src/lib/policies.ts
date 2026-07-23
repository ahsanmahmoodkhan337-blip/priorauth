export interface PolicyCriterion {
  id: string;
  description: string;
  mandatory: boolean;
  keywords: string[];
}

export interface PayerPolicy {
  payerName: string;
  cptCode: string;
  procedureName: string;
  lcdNumber: string;
  criteria: PolicyCriterion[];
}

// ---------------------------------------------------------------------------
// POLICY 1: AETNA — Lumbar Spine MRI (CPT 72148) — LCD L36789
// ---------------------------------------------------------------------------

const AETNA_LUMBAR_MRI: PayerPolicy = {
  payerName: 'Aetna',
  cptCode: '72148',
  procedureName: 'MRI Lumbar Spine without Contrast',
  lcdNumber: 'L36789',
  criteria: [
    {
      id: 'aetna-lumbar-01',
      description: '6 weeks of conservative treatment documented (PT, NSAIDs, or chiropractic)',
      mandatory: true,
      keywords: [
        'physical therapy',
        'PT',
        'conservative',
        'nsaids',
        'chiropractic',
        'ibuprofen',
        'naproxen',
        'conservative care',
        'conservative treatment',
        'physiotherapy',
        'rehabilitation',
        'exercise program',
        'home exercise',
      ],
    },
    {
      id: 'aetna-lumbar-02',
      description: 'Neurological deficit documented (radiculopathy, weakness, numbness, reflex changes)',
      mandatory: true,
      keywords: [
        'radiculopathy',
        'sciatica',
        'weakness',
        'numbness',
        'reflex',
        'sensory deficit',
        'motor deficit',
        'straight leg raise',
        'SLR',
        'diminished',
        'absent reflex',
        'paresthesia',
        'tingling',
        'hypoesthesia',
        'foot drop',
      ],
    },
    {
      id: 'aetna-lumbar-03',
      description: 'Pain unresponsive to conservative measures',
      mandatory: true,
      keywords: [
        'failed',
        'persistent pain',
        'no relief',
        'worsening',
        'refractory',
        'unresponsive',
        'intractable',
        'no improvement',
        'inadequate response',
        'continued pain',
        'ongoing pain',
      ],
    },
    {
      id: 'aetna-lumbar-04',
      description: 'No prior MRI within 6 months',
      mandatory: true,
      keywords: [],
    },
    {
      id: 'aetna-lumbar-05',
      description: 'Red flags excluded (cauda equina, infection, tumor, fracture)',
      mandatory: false,
      keywords: [
        'red flags',
        'cauda equina',
        'infection',
        'tumor',
        'fracture',
        'malignancy',
        'trauma',
        'fever',
        'weight loss',
        'night sweats',
        'bowel',
        'bladder',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// POLICY 2: BCBS — Total Knee Arthroplasty (CPT 27447) — LCD L35123
// ---------------------------------------------------------------------------

const BCBS_KNEE_ARTHROPLASTY: PayerPolicy = {
  payerName: 'Blue Cross Blue Shield',
  cptCode: '27447',
  procedureName: 'Total Knee Arthroplasty',
  lcdNumber: 'L35123',
  criteria: [
    {
      id: 'bcbs-knee-01',
      description: 'Radiographic evidence of advanced osteoarthritis (K-L grade 3 or 4)',
      mandatory: true,
      keywords: [
        'Kellgren-Lawrence',
        'K-L grade',
        'K-L 3',
        'K-L 4',
        'K-L III',
        'K-L IV',
        'joint space narrowing',
        'osteophyte',
        'subchondral sclerosis',
        'bone-on-bone',
        'severe osteoarthritis',
        'advanced OA',
        'tricompartmental',
        'end-stage',
      ],
    },
    {
      id: 'bcbs-knee-02',
      description: 'Failure of at least 3 months of non-surgical management',
      mandatory: true,
      keywords: [
        'physical therapy',
        'PT',
        'nsaids',
        'conservative management',
        'failed conservative',
        'corticosteroid injection',
        'viscosupplementation',
        'hyaluronic acid',
        'failed PT',
        'activity modification',
        'weight loss',
        'bracing',
        'assistive device',
        'cane',
        'walker',
      ],
    },
    {
      id: 'bcbs-knee-03',
      description: 'Significant functional limitation affecting activities of daily living',
      mandatory: true,
      keywords: [
        'functional limitation',
        'ADL',
        'activities of daily living',
        'ambulation',
        'stair climbing',
        'standing',
        'walking',
        'range of motion',
        'varus',
        'valgus',
        'deformity',
        'contracture',
        'stiffness',
        'instability',
        'walk',
        'mobility',
      ],
    },
    {
      id: 'bcbs-knee-04',
      description: 'Weight-bearing X-ray within 3 months of request',
      mandatory: true,
      keywords: [],
    },
    {
      id: 'bcbs-knee-05',
      description: 'Pre-operative medical clearance completed',
      mandatory: false,
      keywords: [
        'medical clearance',
        'pre-operative clearance',
        'cardiac clearance',
        'surgical clearance',
        'PCP evaluation',
        'medically cleared',
        'anesthesia clearance',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// POLICY 3: MEDICARE MAC — Cardiac Echocardiogram (CPT 93306) — LCD L34567
// ---------------------------------------------------------------------------

const MEDICARE_CARDIAC_ECHO: PayerPolicy = {
  payerName: 'Medicare MAC (Novitas)',
  cptCode: '93306',
  procedureName: 'Transthoracic Echocardiogram, Complete',
  lcdNumber: 'L34567',
  criteria: [
    {
      id: 'medicare-echo-01',
      description: 'Signs or symptoms of new or worsening cardiac disease',
      mandatory: true,
      keywords: [
        'shortness of breath',
        'dyspnea',
        'orthopnea',
        'edema',
        'chest pain',
        'palpitations',
        'syncope',
        'murmur',
        'JVD',
        'jugular venous distension',
        'crackles',
        'rales',
        'S3',
        'S4',
        'gallop',
        'fatigue',
        'exercise intolerance',
        'DOE',
        'PND',
        'paroxysmal nocturnal dyspnea',
        'new-onset',
        'worsening',
      ],
    },
    {
      id: 'medicare-echo-02',
      description: 'No prior echocardiogram within the preceding 6 months',
      mandatory: true,
      keywords: [],
    },
    {
      id: 'medicare-echo-03',
      description: 'Clinical findings that would directly impact management decisions',
      mandatory: true,
      keywords: [
        'management',
        'medication',
        'treatment plan',
        'surgical intervention',
        'GDMT',
        'guideline-directed',
        'ejection fraction',
        'valvular',
        'regurgitation',
        'stenosis',
        'HFrEF',
        'HFpEF',
        'cardiomyopathy',
        'monitoring',
        'follow-up',
      ],
    },
    {
      id: 'medicare-echo-04',
      description: 'Elevated BNP or NT-proBNP when heart failure suspected',
      mandatory: false,
      keywords: [
        'BNP',
        'NT-proBNP',
        'brain natriuretic',
        'elevated',
        'pg/mL',
        'cardiac biomarker',
        'troponin',
      ],
    },
    {
      id: 'medicare-echo-05',
      description: 'Physical exam findings consistent with structural heart disease',
      mandatory: false,
      keywords: [
        'murmur',
        'S3',
        'S4',
        'gallop',
        'rub',
        'click',
        'displaced PMI',
        'heave',
        'thrill',
        'irregularly irregular',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Registry — maps payer + CPT combos to policies
// ---------------------------------------------------------------------------

const POLICY_REGISTRY: Map<string, PayerPolicy> = new Map();

function policyKey(payerName: string, cptCode: string): string {
  return `${payerName.toUpperCase()}|${cptCode.trim()}`;
}

[
  AETNA_LUMBAR_MRI,
  BCBS_KNEE_ARTHROPLASTY,
  MEDICARE_CARDIAC_ECHO,
].forEach((policy) => {
  POLICY_REGISTRY.set(policyKey(policy.payerName, policy.cptCode), policy);
});

/**
 * Look up a payer policy by name and CPT code.
 * Returns `null` when no matching policy is found.
 */
export function getPolicy(payerName: string, cptCode: string): PayerPolicy | null {
  return POLICY_REGISTRY.get(policyKey(payerName, cptCode)) ?? null;
}

/**
 * Return every registered policy (useful for the frontend case selector).
 */
export function getAllPolicies(): PayerPolicy[] {
  return Array.from(POLICY_REGISTRY.values());
}

/**
 * Generate a generic fallback policy for payer/CPT combos not in the registry.
 * This allows custom cases to still get a meaningful audit.
 */
export function getGenericPolicy(payerName: string, cptCode: string): PayerPolicy {
  return {
    payerName,
    cptCode,
    procedureName: `Procedure ${cptCode}`,
    lcdNumber: 'N/A — Custom',
    criteria: [
      {
        id: 'generic-01',
        description: 'Clinical documentation supports medical necessity',
        mandatory: true,
        keywords: [
          'medical necessity',
          'indicated',
          'medically necessary',
          'clinical indication',
          'diagnosis',
          'assessment',
          'plan',
          'recommend',
        ],
      },
      {
        id: 'generic-02',
        description: 'Appropriate conservative management attempted (if applicable)',
        mandatory: true,
        keywords: [
          'conservative',
          'physical therapy',
          'PT',
          'nsaids',
          'medication',
          'injection',
          'failed',
          'no relief',
          'no improvement',
          'refractory',
          'unresponsive',
          'trial',
        ],
      },
      {
        id: 'generic-03',
        description: 'Relevant physical examination findings documented',
        mandatory: true,
        keywords: [
          'examination',
          'physical exam',
          'tenderness',
          'range of motion',
          'strength',
          'sensation',
          'reflex',
          'palpation',
          'inspection',
          'auscultation',
          'vital',
          'BMI',
          'weight',
          'blood pressure',
        ],
      },
      {
        id: 'generic-04',
        description: 'Prior relevant imaging or lab results documented',
        mandatory: false,
        keywords: [
          'imaging',
          'x-ray',
          'MRI',
          'CT',
          'ultrasound',
          'lab',
          'laboratory',
          'BNP',
          'creatinine',
          'radiograph',
          'scan',
          'echocardiogram',
          'EKG',
          'ECG',
        ],
      },
      {
        id: 'generic-05',
        description: 'Appropriate follow-up plan documented',
        mandatory: false,
        keywords: [
          'follow-up',
          'follow up',
          'plan',
          'schedule',
          'refer',
          'discharge',
          'monitor',
          'reassess',
          'return',
        ],
      },
    ],
  };
}
