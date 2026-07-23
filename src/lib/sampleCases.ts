/**
 * Pre-loaded sample clinical chart notes for the Prior Auth HUD.
 * Each case is keyed by a unique string and carries its own payer/CPT pair.
 */

export interface SampleCaseData {
  caseId: string;
  label: string;
  payerName: string;
  cptCode: string;
  riskLevel: 'high-denial' | 'moderate' | 'high-approval';
  chartNote: string;
}

// ---------------------------------------------------------------------------
// CASE 1: Lumbar MRI — High Denial Risk (~42%)
// ---------------------------------------------------------------------------

const CASE_LUMBAR_MRI: SampleCaseData = {
  caseId: 'lumbar-mri',
  label: 'Case 1: Lumbar Spine MRI (CPT 72148) — Aetna',
  payerName: 'Aetna',
  cptCode: '72148',
  riskLevel: 'high-denial',
  chartNote: `HISTORY OF PRESENT ILLNESS:
The patient is a 52-year-old male who presents with acute low back pain of 2 weeks duration. The pain began after lifting a heavy box at work and is described as sharp and constant, rated 7/10 in severity. Pain radiates into the right buttock and posterior thigh with occasional tingling in the right great toe. No bowel or bladder dysfunction. No fever, chills, or unexplained weight loss. The patient has been taking over-the-counter acetaminophen with minimal relief. He has not tried any NSAIDs, muscle relaxants, or prescription analgesics. No physical therapy or chiropractic care has been initiated. The patient reports that bending forward and prolonged sitting aggravate the pain, while lying supine provides partial relief.

PHYSICAL EXAMINATION:
Lumbar spine: Paravertebral muscle spasm noted bilaterally at L4-S1 level. Tenderness to palpation over the right L5-S1 facet joint. Straight leg raise test is positive at 55 degrees on the right with reproduction of radicular symptoms. Diminished sensation to light touch over the right L5 dermatome. Motor strength is 5/5 in all lower extremity muscle groups except right extensor hallucis longus which is 4+/5. Deep tendon reflexes are 2+ and symmetric at both patellae but the right Achilles reflex is slightly diminished compared to the left. Gait is antalgic favoring the left side.

ASSESSMENT / PLAN:
1. Acute right-sided lumbar radiculopathy, likely L5-S1 disc herniation.
2. Failed initial conservative measures — patient has not improved with 2 weeks of rest and acetaminophen.
3. Plan: Advance to prescription NSAIDs. Refer for physical therapy evaluation. Consider lumbar spine MRI without contrast (CPT 72148) if no improvement after conservative care.
4. Patient advised to follow up in 2 weeks for reassessment.`,
};

// ---------------------------------------------------------------------------
// CASE 2: Knee Arthroplasty — Moderate Approval (~75%)
// ---------------------------------------------------------------------------

const CASE_KNEE_ARTHROPLASTY: SampleCaseData = {
  caseId: 'knee-arthroplasty',
  label: 'Case 2: Total Knee Arthroplasty (CPT 27447) — BCBS',
  payerName: 'Blue Cross Blue Shield',
  cptCode: '27447',
  riskLevel: 'moderate',
  chartNote: `HISTORY OF PRESENT ILLNESS:
The patient is a 68-year-old female with a longstanding history of severe tricompartmental osteoarthritis of the right knee. She reports progressive worsening of pain and functional limitation despite comprehensive non-surgical management. The patient has completed 8 weeks of structured physical therapy with a home exercise program and has trialed multiple NSAIDs including naproxen 500 mg BID and celecoxib 200 mg daily without adequate relief. She received two intra-articular corticosteroid injections (most recent 2 months ago) which provided only transient improvement lasting 1-2 weeks each. Viscosupplementation with hyaluronic acid was performed 4 months ago with minimal benefit.

PHYSICAL EXAMINATION:
Right knee: Visible varus deformity of approximately 8 degrees. Moderate joint effusion present. Passive range of motion is limited to 5-95 degrees with pain at terminal flexion and extension. Marked crepitus throughout range of motion with audible grinding. Medial joint line tenderness to palpation. Ligamentous laxity noted — grade 1 medial collateral ligament laxity. No erythema or warmth to suggest acute infection. BMI of 32.1. The patient ambulates with a noticeable limp and uses a cane for community ambulation.

IMAGING:
Weight-bearing AP and lateral radiographs of the right knee (performed 5 months ago) demonstrate Kellgren-Lawrence grade 4 osteoarthritis with complete loss of medial joint space, large marginal osteophytes, and subchondral sclerosis. Patellofemoral compartment also shows severe degenerative changes with lateral patellar tilt.

ASSESSMENT / PLAN:
1. End-stage tricompartmental osteoarthritis of the right knee, Kellgren-Lawrence grade 4.
2. Failed comprehensive non-surgical management over > 3 months including PT, NSAIDs, corticosteroid injections, and viscosupplementation.
3. Significant functional limitation — difficulty with ADLs including stair climbing, prolonged standing, and walking more than one block.
4. Plan: Obtain updated weight-bearing knee X-ray. Refer for pre-operative medical clearance. Schedule right total knee arthroplasty (CPT 27447) once surgical clearance is obtained.`,
};

// ---------------------------------------------------------------------------
// CASE 3: Cardiac Echo — High Approval (~95%)
// ---------------------------------------------------------------------------

const CASE_CARDIAC_ECHO: SampleCaseData = {
  caseId: 'cardiac-echo',
  label: 'Case 3: Cardiac Echocardiogram (CPT 93306) — Medicare MAC',
  payerName: 'Medicare MAC (Novitas)',
  cptCode: '93306',
  riskLevel: 'high-approval',
  chartNote: `HISTORY OF PRESENT ILLNESS:
The patient is a 72-year-old male with known coronary artery disease (prior PCI with drug-eluting stent to LAD in 2022), hypertension, type 2 diabetes mellitus, and chronic kidney disease stage 3. He presents with new-onset progressively worsening shortness of breath on exertion over the past 4 weeks. He now becomes dyspneic after walking approximately 50 feet on level ground, whereas previously he could walk half a mile without difficulty. The patient also reports orthopnea requiring three pillows to sleep comfortably and paroxysmal nocturnal dyspnea that awakens him 2-3 times per week. He denies chest pain, palpitations, or syncope.

PHYSICAL EXAMINATION:
Vital signs: BP 148/88 mmHg, HR 92 bpm (regular), RR 22/min, SpO2 94% on room air. Neck: Jugular venous distension noted at 45 degrees. Lungs: Bibasilar inspiratory crackles auscultated bilaterally. Cardiac: Regular rate and rhythm, S1 and S2 normal, grade 2/6 holosystolic murmur best heard at the apex radiating to the axilla consistent with mitral regurgitation. PMI is displaced laterally. Abdomen: Soft, non-tender, no hepatomegaly appreciated. Extremities: Bilateral 2+ pitting edema extending to the mid-shin.

PERTINENT LABS:
BNP: 1,200 pg/mL (elevated). Troponin I: <0.04 ng/mL (normal). Creatinine: 1.6 mg/dL (baseline). ECG shows sinus tachycardia at 98 bpm with non-specific ST-T wave changes in the lateral leads. Prior transthoracic echocardiogram from 2 years ago showed mild mitral regurgitation, grade 1 diastolic dysfunction, and preserved left ventricular ejection fraction of 55-60%.

ASSESSMENT / PLAN:
1. Acute decompensated heart failure with preserved ejection fraction (HFpEF), clinically worsened from baseline — evidence includes new-onset DOE, orthopnea, PND, JVD, bibasilar crackles, bilateral pitting edema, and markedly elevated BNP at 1,200 pg/mL.
2. Physical exam reveals new holosystolic murmur consistent with worsening mitral regurgitation.
3. Plan: Begin IV diuresis with furosemide. Initiate GDMT for HFpEF. Obtain urgent transthoracic echocardiogram (CPT 93306) to evaluate left ventricular function, degree of mitral regurgitation, right ventricular function, and pulmonary artery pressures prior to discharge and to guide medication optimization.
4. This study is medically necessary and will directly impact acute management decisions and discharge planning.`,
};

// ---------------------------------------------------------------------------
// Registry of all sample cases
// ---------------------------------------------------------------------------

export const SAMPLE_CASES: SampleCaseData[] = [
  CASE_LUMBAR_MRI,
  CASE_KNEE_ARTHROPLASTY,
  CASE_CARDIAC_ECHO,
];

/**
 * Retrieve a sample case by its unique ID (e.g., "lumbar-mri").
 */
export function getSampleCase(caseId: string): SampleCaseData | undefined {
  return SAMPLE_CASES.find((c) => c.caseId === caseId);
}
