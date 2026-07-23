import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// POST /api/generate-lomn
// Generates a Letter of Medical Necessity PDF payload (simulated)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      patientName = 'John Doe',
      patientDOB = '01/15/1975',
      patientID = 'MRN-88421',
      providerName = 'Dr. Sarah Chen, MD',
      providerNPI = '1234567890',
      cptCode = '63030',
      procedureName = 'Lumbar Laminectomy',
      payerName = 'Aetna',
      diagnosisCodes = ['M51.16', 'M48.062'],
    } = body;

    const letterText = `LETTER OF MEDICAL NECESSITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To: ${payerName} Medical Review Department
From: ${providerName} | NPI: ${providerNPI}
Re: Medical Necessity Justification for ${procedureName} (CPT ${cptCode})

PATIENT INFORMATION
• Name: ${patientName}
• DOB: ${patientDOB}
• ID: ${patientID}
• Diagnosis: ${diagnosisCodes.join(', ')}

CLINICAL JUSTIFICATION

I am writing to certify that the above-named patient requires ${procedureName} (CPT ${cptCode}) as medically necessary. The patient has a confirmed diagnosis of ${diagnosisCodes[0]} with documented failure of conservative management over a period exceeding six (6) months.

The following conservative treatments have been attempted without adequate relief:
1. Physical therapy — 24 sessions over 12 weeks (completed 05/2026)
2. NSAID therapy — Naproxen 500mg BID × 8 weeks
3. Epidural steroid injections — 3 injections at L4-L5 (last 06/01/2026)
4. Activity modification and home exercise program

OBJECTIVE FINDINGS

• MRI dated 06/15/2026 reveals L4-L5 disc herniation with nerve root compression
• ODI (Oswestry Disability Index) Score: 62% — severe disability
• Physical exam: Positive straight leg raise at 30°, diminished L5 dermatome sensation
• Failed ≥6 months of conservative therapy as documented above

MEDICAL NECESSITY DETERMINATION

The requested procedure meets ${payerName} clinical policy criteria as outlined in LCD L36789 §4.2(a-d):
✓ Conservative therapy failure ≥6 months
✓ ODI score exceeds 40% threshold
✓ Imaging confirms structural pathology
✓ Specialist consultation completed (Neurosurgery — Dr. James Wilson, DO)

Based on the above clinical evidence, ${procedureName} is medically necessary for this patient to prevent further neurological deterioration and restore functional capacity.

Sincerely,
${providerName}
NPI: ${providerNPI}
License: CA-A123456

[Digitally signed — ${new Date().toISOString()}]
`;

    const payload = {
      success: true,
      letterText,
      metadata: {
        patientName,
        patientDOB,
        patientID,
        providerName,
        providerNPI,
        cptCode,
        procedureName,
        payerName,
        diagnosisCodes,
        generatedAt: new Date().toISOString(),
        lomnRef: `LOMN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate LOMN' },
      { status: 500 }
    );
  }
}
