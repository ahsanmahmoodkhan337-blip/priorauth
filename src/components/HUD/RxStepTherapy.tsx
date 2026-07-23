'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, FileText, ChevronDown, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepTherapyTier {
  tier: number;
  label: string;
  drugs: string[];
  required: boolean;
}

interface StepTherapyResult {
  drug: string;
  payer: string;
  tiers: StepTherapyTier[];
  patientStatus: 'not_satisfied' | 'partial' | 'satisfied';
  message: string;
}

// ---------------------------------------------------------------------------
// Drug → Payer → Step-Therapy mapping (simulated)
// ---------------------------------------------------------------------------

const STEP_THERAPY_DATA: Record<string, Record<string, StepTherapyResult>> = {
  Humira: {
    Aetna: {
      drug: 'Humira',
      payer: 'Aetna',
      tiers: [
        { tier: 1, label: 'Tier 1: Conventional DMARDs', drugs: ['Methotrexate (MTX)', 'Leflunomide', 'Sulfasalazine'], required: true },
        { tier: 2, label: 'Tier 2: Alternative DMARDs + Biologic Trial', drugs: ['Hydroxychloroquine + MTX', 'Enbrel (etanercept)'], required: true },
        { tier: 3, label: 'Tier 3: Target Biologic', drugs: ['Humira (adalimumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT tried Methotrexate (Tier 1) — Step Therapy NOT satisfied. At least 8 weeks of MTX at 15-25mg/week required by Aetna policy.',
    },
    BCBS: {
      drug: 'Humira',
      payer: 'BCBS',
      tiers: [
        { tier: 1, label: 'Tier 1: Conventional DMARDs', drugs: ['Methotrexate (MTX)', 'Leflunomide'], required: true },
        { tier: 2, label: 'Tier 2: Biologic Alternative', drugs: ['Enbrel', 'Remicade'], required: false },
        { tier: 3, label: 'Tier 3: Target Biologic', drugs: ['Humira (adalimumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT tried Methotrexate (Tier 1) — Step Therapy NOT satisfied. BCBS requires documented failure or contraindication.',
    },
    UHC: {
      drug: 'Humira',
      payer: 'UHC',
      tiers: [
        { tier: 1, label: 'Tier 1: Preferred DMARDs', drugs: ['Methotrexate (MTX) 15-25mg/week'], required: true },
        { tier: 2, label: 'Tier 2: Biosimilar Trial', drugs: ['Amjevita (adalimumab-atto)', 'Cyltezo'], required: true },
        { tier: 3, label: 'Tier 3: Brand Biologic', drugs: ['Humira (adalimumab)'], required: false },
      ],
      patientStatus: 'partial',
      message: 'Patient completed MTX trial but has NOT tried a biosimilar (Tier 2) — UHC requires biosimilar before brand Humira.',
    },
    Cigna: {
      drug: 'Humira',
      payer: 'Cigna',
      tiers: [
        { tier: 1, label: 'Tier 1: Conventional DMARDs', drugs: ['Methotrexate (MTX)', 'Leflunomide', 'Hydroxychloroquine'], required: true },
        { tier: 2, label: 'Tier 2: Target Biologic', drugs: ['Humira (adalimumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT tried Methotrexate (Tier 1) — Step Therapy NOT satisfied. Cigna requires 3-month MTX trial with inadequate response.',
    },
  },
  Keytruda: {
    Aetna: {
      drug: 'Keytruda',
      payer: 'Aetna',
      tiers: [
        { tier: 1, label: 'Tier 1: First-Line Chemotherapy', drugs: ['Platinum-based doublet chemo'], required: true },
        { tier: 2, label: 'Tier 2: PD-L1 Testing + Alternative IO', drugs: ['Opdivo (nivolumab)', 'Tecentriq'], required: false },
        { tier: 3, label: 'Tier 3: Target Immunotherapy', drugs: ['Keytruda (pembrolizumab)'], required: false },
      ],
      patientStatus: 'satisfied',
      message: 'Patient has documented PD-L1 >50% and prior platinum-doublet. Step Therapy satisfied — Keytruda may be approved.',
    },
    BCBS: {
      drug: 'Keytruda',
      payer: 'BCBS',
      tiers: [
        { tier: 1, label: 'Tier 1: PD-L1 Biomarker Testing', drugs: ['PD-L1 IHC 22C3 pharmDx assay'], required: true },
        { tier: 2, label: 'Tier 2: Target Immunotherapy', drugs: ['Keytruda (pembrolizumab)'], required: false },
      ],
      patientStatus: 'satisfied',
      message: 'PD-L1 testing complete (TPS ≥50%). Step Therapy satisfied — proceed with Keytruda.',
    },
    UHC: {
      drug: 'Keytruda',
      payer: 'UHC',
      tiers: [
        { tier: 1, label: 'Tier 1: Standard Chemotherapy', drugs: ['Platinum-doublet chemotherapy'], required: true },
        { tier: 2, label: 'Tier 2: PD-L1 + MSI Testing', drugs: ['Biomarker panel required'], required: true },
        { tier: 3, label: 'Tier 3: Target Immunotherapy', drugs: ['Keytruda (pembrolizumab)'], required: false },
      ],
      patientStatus: 'partial',
      message: 'PD-L1 testing done but MSI/dMMR testing pending. UHC requires comprehensive biomarker panel.',
    },
    Cigna: {
      drug: 'Keytruda',
      payer: 'Cigna',
      tiers: [
        { tier: 1, label: 'Tier 1: First-Line Therapy', drugs: ['Platinum-based chemotherapy'], required: true },
        { tier: 2, label: 'Tier 2: PD-L1 ≥50%', drugs: ['Keytruda monotherapy'], required: true },
        { tier: 3, label: 'Tier 3: Combination IO', drugs: ['Keytruda + chemo'], required: false },
      ],
      patientStatus: 'satisfied',
      message: 'Patient meets Cigna criteria: PD-L1 ≥50%, prior chemo completed. Keytruda monotherapy approved pathway.',
    },
  },
  Stelara: {
    Aetna: {
      drug: 'Stelara',
      payer: 'Aetna',
      tiers: [
        { tier: 1, label: 'Tier 1: Topicals + Phototherapy', drugs: ['Topical corticosteroids', 'NB-UVB phototherapy'], required: true },
        { tier: 2, label: 'Tier 2: Systemic DMARDs', drugs: ['Methotrexate', 'Cyclosporine', 'Acitretin'], required: true },
        { tier: 3, label: 'Tier 3: Target Biologic', drugs: ['Stelara (ustekinumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT completed systemic DMARD trial (Tier 2). Aetna requires 12 weeks of MTX or cyclosporine.',
    },
    BCBS: {
      drug: 'Stelara',
      payer: 'BCBS',
      tiers: [
        { tier: 1, label: 'Tier 1: Phototherapy + Systemics', drugs: ['NB-UVB + MTX 15mg/week'], required: true },
        { tier: 2, label: 'Tier 2: Alternative Biologic', drugs: ['Cosentyx', 'Taltz'], required: true },
        { tier: 3, label: 'Tier 3: Target Biologic', drugs: ['Stelara (ustekinumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has not tried Cosentyx or Taltz (Tier 2 alternatives). BCBS formulary requires IL-17 inhibitor first.',
    },
    UHC: {
      drug: 'Stelara',
      payer: 'UHC',
      tiers: [
        { tier: 1, label: 'Tier 1: First-Line Systemics', drugs: ['Methotrexate 15-25mg/week'], required: true },
        { tier: 2, label: 'Tier 2: Target Biologic', drugs: ['Stelara (ustekinumab)'], required: false },
      ],
      patientStatus: 'satisfied',
      message: 'Patient completed 12-week MTX trial with inadequate response. Step Therapy satisfied for Stelara.',
    },
    Cigna: {
      drug: 'Stelara',
      payer: 'Cigna',
      tiers: [
        { tier: 1, label: 'Tier 1: Topicals + Phototherapy', drugs: ['High-potency topical steroids', 'PUVA/NB-UVB'], required: true },
        { tier: 2, label: 'Tier 2: Oral Systemics', drugs: ['Methotrexate', 'Cyclosporine', 'Otezla'], required: true },
        { tier: 3, label: 'Tier 3: Preferred Biologic', drugs: ['Skyrizi', 'Tremfya'], required: false },
        { tier: 4, label: 'Tier 4: Target Biologic', drugs: ['Stelara (ustekinumab)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has not tried Skyrizi or Tremfya (Tier 3 IL-23 preferred alternatives). Cigna requires preferred product first.',
    },
  },
  Botox: {
    Aetna: {
      drug: 'Botox',
      payer: 'Aetna',
      tiers: [
        { tier: 1, label: 'Tier 1: Oral Preventives', drugs: ['Beta-blockers', 'Tricyclic antidepressants', 'Topiramate'], required: true },
        { tier: 2, label: 'Tier 2: Alternative Injectables', drugs: ['Aimovig', 'Emgality', 'Ajovy (CGRP mAbs)'], required: true },
        { tier: 3, label: 'Tier 3: Target Therapy', drugs: ['Botox (onabotulinumtoxinA)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT tried CGRP monoclonal antibodies (Tier 2). Aetna requires trial of at least 2 CGRP antagonists.',
    },
    BCBS: {
      drug: 'Botox',
      payer: 'BCBS',
      tiers: [
        { tier: 1, label: 'Tier 1: Oral Preventives', drugs: ['Propranolol', 'Amitriptyline', 'Topiramate', 'Valproate'], required: true },
        { tier: 2, label: 'Tier 2: Target Therapy', drugs: ['Botox (onabotulinumtoxinA)'], required: false },
      ],
      patientStatus: 'satisfied',
      message: 'Patient documented failure of 3 oral preventives. Step Therapy satisfied for chronic migraine Botox per BCBS.',
    },
    UHC: {
      drug: 'Botox',
      payer: 'UHC',
      tiers: [
        { tier: 1, label: 'Tier 1: Oral Preventives (≥3 trials)', drugs: ['Beta-blockers', 'Antidepressants', 'Anticonvulsants'], required: true },
        { tier: 2, label: 'Tier 2: CGRP Antagonist Trial', drugs: ['Aimovig', 'Emgality', 'Nurtec ODT'], required: true },
        { tier: 3, label: 'Tier 3: Botulinum Toxin', drugs: ['Botox (onabotulinumtoxinA)'], required: false },
      ],
      patientStatus: 'partial',
      message: 'Patient completed oral preventives but has NOT tried a CGRP antagonist. UHC requires CGRP trial before Botox.',
    },
    Cigna: {
      drug: 'Botox',
      payer: 'Cigna',
      tiers: [
        { tier: 1, label: 'Tier 1: ≥2 Oral Preventives', drugs: ['Propranolol', 'Topiramate', 'Amitriptyline'], required: true },
        { tier: 2, label: 'Tier 2: ≥1 CGRP Antagonist', drugs: ['Aimovig', 'Emgality', 'Ajovy'], required: true },
        { tier: 3, label: 'Tier 3: Botox', drugs: ['Botox (onabotulinumtoxinA)'], required: false },
      ],
      patientStatus: 'not_satisfied',
      message: 'Patient has NOT tried any CGRP antagonist (Tier 2). Cigna requires documented trial of at least 1 CGRP mAb.',
    },
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RxStepTherapyProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RxStepTherapy({ isOpen, onClose }: RxStepTherapyProps) {
  const [selectedDrug, setSelectedDrug] = useState<string>('Humira');
  const [selectedPayer, setSelectedPayer] = useState<string>('Aetna');
  const [showResult, setShowResult] = useState(false);

  const result = STEP_THERAPY_DATA[selectedDrug]?.[selectedPayer] ?? null;

  const handleEvaluate = () => {
    setShowResult(true);
  };

  const handleGenerateLetter = () => {
    if (!result) return;
    const letterText = `[FORMULARY EXCEPTION REQUEST]

Date: ${new Date().toLocaleDateString('en-US')}
To: ${result.payer} Pharmacy Services
Re: Formulary Exception Request for ${result.drug}

Dear Medical Reviewer,

I am writing to request a formulary exception for ${result.drug} on behalf of my patient.

STEP THERAPY ANALYSIS:
${result.tiers.map((t) => `  ${t.label}: [${t.drugs.join(', ')}] — ${t.required ? 'REQUIRED' : 'TARGET'}`).join('\n')}

CLINICAL RATIONALE:
The step therapy protocol as outlined above has not been fully satisfied. However, based on the patient's specific clinical presentation, the requested medication ${result.drug} is medically necessary because [INSERT CLINICAL JUSTIFICATION].

Please process this exception request within 72 hours per state-mandated timelines.

Sincerely,
[Provider Name]
NPI: [Provider NPI]`;

    navigator.clipboard.writeText(letterText).then(() => {
      // Toast handled by parent
    });
    alert('Formulary exception letter copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-accent-blue/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10">
              <span className="text-xl">💊</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Specialty Rx & Step-Therapy Evaluator</h2>
              <p className="text-xs text-text-secondary">Cross-reference medication against payer formulary step-therapy trees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Selection Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Select Drug</label>
              <div className="relative">
                <select
                  value={selectedDrug}
                  onChange={(e) => { setSelectedDrug(e.target.value); setShowResult(false); }}
                  className="w-full appearance-none rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                >
                  {Object.keys(STEP_THERAPY_DATA).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Select Payer</label>
              <div className="relative">
                <select
                  value={selectedPayer}
                  onChange={(e) => { setSelectedPayer(e.target.value); setShowResult(false); }}
                  className="w-full appearance-none rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
                >
                  {['Aetna', 'BCBS', 'UHC', 'Cigna'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Evaluate Button */}
          <button
            onClick={handleEvaluate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                       bg-accent-blue text-white text-sm font-semibold
                       hover:brightness-110 transition-all duration-200 shadow-md"
          >
            🔍 Evaluate Step Therapy
          </button>

          {/* Results */}
          {showResult && result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 border ${
                result.patientStatus === 'satisfied'
                  ? 'bg-status-green/5 border-status-green/20'
                  : result.patientStatus === 'partial'
                    ? 'bg-status-orange/5 border-status-orange/20'
                    : 'bg-status-red/5 border-status-red/20'
              }`}>
                <div className="flex items-start gap-2.5">
                  {result.patientStatus === 'satisfied' ? (
                    <CheckCircle2 size={18} className="text-status-green mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle size={18} className={result.patientStatus === 'partial' ? 'text-status-orange mt-0.5 flex-shrink-0' : 'text-status-red mt-0.5 flex-shrink-0'} />
                  )}
                  <p className={`text-sm font-medium ${
                    result.patientStatus === 'satisfied'
                      ? 'text-status-green'
                      : result.patientStatus === 'partial'
                        ? 'text-status-orange'
                        : 'text-status-red'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Step Therapy Tree */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    📋 {result.payer} Step-Therapy Tree — {result.drug}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {result.tiers.map((tier, idx) => (
                    <div key={tier.tier} className="relative">
                      <div className={`rounded-lg border p-3 ${
                        tier.required
                          ? 'border-accent-gold/30 bg-accent-gold/5'
                          : 'border-status-green/20 bg-status-green/5'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-heading-navy">
                            {tier.label}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            tier.required
                              ? 'bg-accent-gold/20 text-accent-gold'
                              : 'bg-status-green/10 text-status-green'
                          }`}>
                            {tier.required ? 'REQUIRED' : 'TARGET'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {tier.drugs.map((drug) => (
                            <span
                              key={drug}
                              className="text-[10px] px-2 py-1 rounded-full bg-bg-secondary text-text-secondary font-medium"
                            >
                              {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                      {idx < result.tiers.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ArrowRight size={14} className="text-text-secondary/40 rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Exception Letter Button */}
              <button
                onClick={handleGenerateLetter}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                           bg-gradient-to-r from-accent-gold/20 to-accent-gold/5
                           border border-accent-gold/40 text-accent-gold text-sm font-semibold
                           hover:from-accent-gold/30 hover:to-accent-gold/10
                           transition-all duration-200"
              >
                <FileText size={14} />
                Generate Formulary Exception Letter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
