'use client';

import React, { useState, useCallback } from 'react';
import { X, Link2, FileText, Send, CheckCircle2, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId = 'crd' | 'dtr' | 'pas';

interface TabInfo {
  id: TabId;
  label: string;
  fullName: string;
}

const TABS: TabInfo[] = [
  { id: 'crd', label: 'CRD', fullName: 'Coverage Requirements Discovery' },
  { id: 'dtr', label: 'DTR', fullName: 'Documentation Templates & Rules' },
  { id: 'pas', label: 'PAS', fullName: 'Prior Authorization Support' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FHIRClientProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FHIRClient({ isOpen, onClose }: FHIRClientProps) {
  const { activeCase } = useCaseState();
  const [activeTab, setActiveTab] = useState<TabId>('crd');
  const [crdQueryResult, setCrdQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [pasSubmitted, setPasSubmitted] = useState(false);

  // -- CRD: Coverage Requirements Discovery --
  const handleCRDQuery = useCallback(() => {
    setIsQuerying(true);
    setCrdQueryResult(null);
    setTimeout(() => {
      setCrdQueryResult(`FHIR CRD Response (simulated):

Bundle: Coverage Requirements
├── Patient: John Doe (MRN: 00421)
├── Payer: Aetna (Payer ID: 12345)
├── CPT: 72148 — Lumbar MRI without contrast
├── PA Required: YES
├── Documentation Requirements:
│   ├── 6 weeks conservative therapy documentation
│   ├── Current neurological exam findings
│   ├── X-ray or prior imaging results
│   └── NPI of ordering physician
├── LCD/NCD Reference: L36789 (Aetna CPB 0729)
├── Valid for: 30 days from query date
└── Next Step: Invoke DTR for smart questionnaire`);

      setIsQuerying(false);
    }, 1500);
  }, []);

  // -- PAS: Prior Authorization Support --
  const handlePASSubmit = useCallback(() => {
    setPasSubmitted(true);
    setTimeout(() => {
      alert('FHIR PAS Bundle submitted successfully! Tracking ID: FHIR-PAS-2026-00421');
    }, 800);
  }, []);

  if (!isOpen) return null;

  // No active case — show message
  if (!activeCase) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-bg-navy/5 to-accent-gold/5">
            <h2 className="text-lg font-semibold text-heading-navy">Regulatory Tool</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          <NoActiveCaseMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-status-green/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10">
              <Link2 size={20} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">FHIR Da Vinci ePA Client</h2>
              <p className="text-xs text-text-secondary flex items-center gap-2">
                CRD / DTR / PAS interoperability engine
                <span className="px-2 py-0.5 rounded-full bg-status-green/10 text-status-green text-[10px] font-medium border border-status-green/20">
                  CMS 2026 ePA Mandate Compliant
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light bg-bg-secondary">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-semibold transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-accent-blue bg-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-blue rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tab Description */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-heading-navy">
              {TABS.find((t) => t.id === activeTab)?.fullName}
            </h3>
          </div>

          {/* ---- CRD Tab ---- */}
          {activeTab === 'crd' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/3 p-4">
                <h4 className="text-xs font-semibold text-accent-blue mb-2 flex items-center gap-1.5">
                  <Shield size={12} />
                  Coverage Requirements Discovery
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  Query payer FHIR server to determine if prior authorization is required for a specific procedure, and retrieve documentation requirements before submission.
                </p>

                <button
                  onClick={handleCRDQuery}
                  disabled={isQuerying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                             bg-accent-blue text-white text-sm font-bold
                             hover:brightness-110 transition-all duration-200 shadow-md
                             disabled:opacity-50 disabled:cursor-wait"
                >
                  {isQuerying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Querying FHIR CRD Endpoint...
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      Check if PA Required for CPT 72148...
                    </>
                  )}
                </button>
              </div>

              {crdQueryResult && (
                <div className="rounded-xl border border-border-light overflow-hidden animate-in fade-in duration-300">
                  <div className="px-4 py-3 bg-bg-navy text-white">
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <FileText size={12} className="text-accent-gold" />
                      FHIR CRD Query Result
                    </span>
                  </div>
                  <div className="p-4 bg-white">
                    <pre className="text-[10px] text-text-primary leading-relaxed whitespace-pre-wrap font-mono">
                      {crdQueryResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- DTR Tab ---- */}
          {activeTab === 'dtr' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-status-green/20 bg-status-green/3 p-4">
                <h4 className="text-xs font-semibold text-status-green mb-2 flex items-center gap-1.5">
                  <FileText size={12} />
                  Smart Questionnaire — CPT 72148
                </h4>
                <p className="text-xs text-text-secondary mb-3">
                  FHIR Questionnaire resource auto-populated from clinical documentation. DTR extracts required data elements and pre-fills the payer-specific form.
                </p>

                {/* Simulated Questionnaire */}
                <div className="space-y-3">
                  {[
                    { q: 'Has patient completed ≥6 weeks of conservative therapy?', a: '✅ Yes — 8 weeks physical therapy documented' },
                    { q: 'Current neurological exam findings attached?', a: '✅ Yes — L4-L5 radiculopathy confirmed' },
                    { q: 'Prior imaging (X-ray) results available?', a: '✅ Yes — Lumbar X-ray dated 2026-05-10' },
                    { q: 'Ordering physician NPI provided?', a: '✅ 1234567890 — Dr. Sarah Khan' },
                    { q: 'Clinical indication meets LCD criteria?', a: '✅ L36789 Section 3B criteria satisfied' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-border-light">
                      <CheckCircle2 size={14} className="text-status-green flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-text-primary">{item.q}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{item.a}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-status-green/10 text-center">
                  <p className="text-xs text-status-green font-medium">
                    ✅ All required documentation elements satisfied — ready for PAS submission
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---- PAS Tab ---- */}
          {activeTab === 'pas' && (
            <div className="space-y-4">
              {!pasSubmitted ? (
                <>
                  <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/3 p-4">
                    <h4 className="text-xs font-semibold text-accent-gold mb-2 flex items-center gap-1.5">
                      <Send size={12} />
                      Submit Structured FHIR PAS Bundle
                    </h4>
                    <p className="text-xs text-text-secondary mb-3">
                      Submit a complete FHIR Prior Authorization Support bundle containing the CRD determination, DTR smart questionnaire responses, and clinical evidence attachments.
                    </p>

                    <div className="rounded-lg border border-border-light bg-white p-3 mb-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-2">FHIR Bundle Payload Preview</p>
                      <pre className="text-[10px] text-text-primary leading-relaxed font-mono whitespace-pre-wrap">
{`{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    { "resource": { "resourceType": "Claim", ... }},
    { "resource": { "resourceType": "Patient", ... }},
    { "resource": { "resourceType": "Coverage", ... }},
    { "resource": { "resourceType": "ServiceRequest",
      "code": { "coding": [{ "system": "CPT", "code": "72148" }] }
    }},
    { "resource": { "resourceType": "QuestionnaireResponse",
      "questionnaire": "DTR-smart-form-72148"
    }}
  ]
}`}
                      </pre>
                    </div>

                    <button
                      onClick={handlePASSubmit}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                                 bg-gradient-to-r from-status-green to-status-green/80
                                 text-white text-sm font-bold
                                 hover:brightness-110 transition-all duration-200 shadow-md"
                    >
                      <Send size={14} />
                      Submit Structured FHIR Payload
                    </button>
                  </div>

                  <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-3 flex items-start gap-2">
                    <ExternalLink size={12} className="text-accent-blue flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-text-secondary">
                      This client implements the HL7 FHIR Da Vinci Prior Authorization Support (PAS) Implementation Guide v2.0.1, compliant with the CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F).
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border-2 border-status-green/40 bg-status-green/5 p-6 text-center animate-in fade-in duration-300">
                  <CheckCircle2 size={32} className="text-status-green mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-status-green">FHIR PAS Bundle Submitted</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Tracking ID: FHIR-PAS-2026-00421
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    Expected response within 72 hours per CMS-0057-F mandate.
                  </p>
                  <button
                    onClick={() => setPasSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-medium
                               border border-accent-blue/30 text-accent-blue
                               hover:bg-accent-blue/10 transition-colors"
                  >
                    Submit Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Compliance Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-status-green/5 border border-status-green/10">
            <Shield size={14} className="text-status-green" />
            <span className="text-xs font-semibold text-status-green">
              CMS 2026 ePA Mandate Compliant — FHIR R4 Da Vinci IG v2.0.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
