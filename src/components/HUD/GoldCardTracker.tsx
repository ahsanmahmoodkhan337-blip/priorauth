'use client';

import React, { useState, useCallback } from 'react';
import { X, Trophy, TrendingUp, FileText, CheckCircle2, Calendar, Star, Copy } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EligibilityState = 'eligible' | 'approaching' | 'not-eligible';

interface ProviderLedger {
  npi: string;
  doctorName: string;
  cptCode: string;
  procedureName: string;
  totalSubmissions: number;
  totalApprovals: number;
  approvalRate: number;
  period: string;
  state: string;
  statutoryBasis: string;
  eligibility: EligibilityState;
  exemptionExpiration: string | null;
}

// ---------------------------------------------------------------------------
// Simulated ledgers
// ---------------------------------------------------------------------------

const SIMULATED_LEDGERS: ProviderLedger[] = [
  {
    npi: '1234567890',
    doctorName: 'Dr. Sarah Khan',
    cptCode: '72148',
    procedureName: 'Lumbar MRI without contrast',
    totalSubmissions: 48,
    totalApprovals: 45,
    approvalRate: 93.8,
    period: 'Oct 2025 – Mar 2026',
    state: 'TX',
    statutoryBasis: 'HB 3459 (Texas Gold Card Act)',
    eligibility: 'eligible',
    exemptionExpiration: '2027-03-15',
  },
  {
    npi: '1234567890',
    doctorName: 'Dr. Sarah Khan',
    cptCode: '97110',
    procedureName: 'Therapeutic Exercise (Physical Therapy)',
    totalSubmissions: 62,
    totalApprovals: 58,
    approvalRate: 93.5,
    period: 'Oct 2025 – Mar 2026',
    state: 'TX',
    statutoryBasis: 'HB 3459 (Texas Gold Card Act)',
    eligibility: 'eligible',
    exemptionExpiration: '2027-03-15',
  },
  {
    npi: '0987654321',
    doctorName: 'Dr. Michael Patel',
    cptCode: '70553',
    procedureName: 'Brain MRI with contrast',
    totalSubmissions: 35,
    totalApprovals: 33,
    approvalRate: 94.3,
    period: 'Nov 2025 – Apr 2026',
    state: 'WV',
    statutoryBasis: 'WV Code §33-48-1 (Gold Card Law)',
    eligibility: 'eligible',
    exemptionExpiration: '2027-04-22',
  },
  {
    npi: '0987654321',
    doctorName: 'Dr. Michael Patel',
    cptCode: '99214',
    procedureName: 'Established Patient Visit Level 4',
    totalSubmissions: 120,
    totalApprovals: 104,
    approvalRate: 86.7,
    period: 'Nov 2025 – Apr 2026',
    state: 'WV',
    statutoryBasis: 'WV Code §33-48-1 (Gold Card Law)',
    eligibility: 'approaching',
    exemptionExpiration: null,
  },
  {
    npi: '1122334455',
    doctorName: 'Dr. James Lee',
    cptCode: '27447',
    procedureName: 'Total Knee Arthroplasty',
    totalSubmissions: 22,
    totalApprovals: 16,
    approvalRate: 72.7,
    period: 'Dec 2025 – May 2026',
    state: 'LA',
    statutoryBasis: 'LA R.S. 22:1019.3 (Gold Card Law)',
    eligibility: 'not-eligible',
    exemptionExpiration: null,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GoldCardTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEligibilityBadge(eligibility: EligibilityState) {
  switch (eligibility) {
    case 'eligible':
      return { label: 'ELIGIBLE — Exempt from PA', className: 'bg-status-green/10 text-status-green border-status-green/20' };
    case 'approaching':
      return { label: 'Approaching Threshold', className: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' };
    case 'not-eligible':
      return { label: 'Below Threshold', className: 'bg-bg-secondary text-text-secondary border-border-light' };
  }
}

function getRateColor(rate: number): string {
  if (rate >= 90) return 'text-status-green';
  if (rate >= 80) return 'text-accent-gold';
  return 'text-status-red';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GoldCardTracker({ isOpen, onClose }: GoldCardTrackerProps) {
  const { activeCase } = useCaseState();
  const [selectedLedger, setSelectedLedger] = useState<ProviderLedger | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const eligibleCount = SIMULATED_LEDGERS.filter((l) => l.eligibility === 'eligible').length;

  const handleGenerateLetter = useCallback((ledger: ProviderLedger) => {
    const letter = `GOLD-CARD EXEMPTION CLAIM LETTER
Issued pursuant to ${ledger.statutoryBasis}

Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To: [Payer Prior Authorization Department]

Re: Statutory Prior Authorization Exemption Claim
Provider: ${ledger.doctorName} (NPI: ${ledger.npi})
CPT Code: ${ledger.cptCode} — ${ledger.procedureName}

Dear Prior Authorization Department:

This letter serves as formal notification that the above-referenced provider qualifies for a statutory prior authorization exemption under ${ledger.statutoryBasis}.

STATUTORY BASIS:
${ledger.statutoryBasis} requires health insurers to exempt providers from prior authorization requirements for a given CPT code when the provider has maintained an approval rate exceeding 90% for that code over a minimum six-month lookback period.

APPROVAL HISTORY:
- CPT Code: ${ledger.cptCode} (${ledger.procedureName})
- Period: ${ledger.period}
- Total Submissions: ${ledger.totalSubmissions}
- Total Approvals: ${ledger.totalApprovals}
- Approval Rate: ${ledger.approvalRate}%
- Lookback: 6 months

Pursuant to state law, this provider is exempt from prior authorization requirements for CPT ${ledger.cptCode} for a period of 12 months from the date of this notice (expiring ${ledger.exemptionExpiration}).

Any denial of coverage issued in violation of this statutory exemption shall constitute an unfair claims settlement practice and will be immediately reported to the ${ledger.state} Department of Insurance.

Please update your prior authorization portal to reflect this exemption effective immediately.

Sincerely,
[Practice Administrator]
${ledger.doctorName}
NPI: ${ledger.npi}`;

    setSelectedLedger(ledger);
    setGeneratedLetter(letter);
  }, []);

  const handleCopy = useCallback(() => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedLetter]);

  const handleBack = useCallback(() => {
    setSelectedLedger(null);
    setGeneratedLetter(null);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-gold/5 to-status-green/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-gold/10">
              <Trophy size={20} className="text-accent-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Gold-Card Eligibility Ledger</h2>
              <p className="text-xs text-text-secondary">
                {eligibleCount} providers currently exempt • TX, WV, LA
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!generatedLetter ? (
            <>
              {/* Summary Bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-status-green/20 bg-status-green/3 p-3 text-center">
                  <p className="text-2xl font-bold text-status-green">{eligibleCount}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">Gold-Card Eligible</p>
                </div>
                <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-3 text-center">
                  <p className="text-2xl font-bold text-accent-gold">{SIMULATED_LEDGERS.length - eligibleCount}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">Not Yet Eligible</p>
                </div>
              </div>

              {/* Ledger List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <TrendingUp size={14} className="text-accent-blue" />
                  Provider Approval Ledger (6-Month Lookback)
                </h3>

                {SIMULATED_LEDGERS.map((ledger, idx) => {
                  const badge = getEligibilityBadge(ledger.eligibility);

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        ledger.eligibility === 'eligible'
                          ? 'border-status-green/30 bg-status-green/3'
                          : ledger.eligibility === 'approaching'
                            ? 'border-accent-gold/30 bg-accent-gold/3'
                            : 'border-border-light bg-white'
                      }`}
                    >
                      <div className="px-4 py-3">
                        {/* Top Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">
                              {ledger.doctorName}
                            </h4>
                            <p className="text-[10px] text-text-secondary">
                              NPI {ledger.npi} • {ledger.state}
                            </p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>

                        {/* CPT Row */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-accent-blue bg-accent-blue/5 px-2 py-0.5 rounded">
                            CPT {ledger.cptCode}
                          </span>
                          <span className="text-xs text-text-secondary">{ledger.procedureName}</span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className={`text-lg font-bold ${getRateColor(ledger.approvalRate)}`}>
                              {ledger.approvalRate}%
                            </span>
                            <span className="text-[10px] text-text-secondary">approval</span>
                          </div>
                          <div className="text-[10px] text-text-secondary">
                            {ledger.totalApprovals}/{ledger.totalSubmissions} submissions
                          </div>
                          <div className="text-[10px] text-text-secondary">
                            {ledger.period}
                          </div>
                        </div>

                        {/* Eligible Banner */}
                        {ledger.eligibility === 'eligible' && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-status-green/10 border border-status-green/20">
                            <Star size={14} className="text-status-green flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-status-green">
                                🏆 ELIGIBLE — Exempt from Prior Auth for 12 months
                              </p>
                              <p className="text-[10px] text-text-secondary">
                                Expires {ledger.exemptionExpiration} • {ledger.statutoryBasis}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action */}
                        {ledger.eligibility === 'eligible' && (
                          <button
                            onClick={() => handleGenerateLetter(ledger)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                                       bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-xs font-semibold
                                       hover:bg-accent-gold/20 transition-all duration-200"
                          >
                            <FileText size={12} />
                            Generate Gold-Card Exemption Claim Letter
                          </button>
                        )}

                        {ledger.eligibility === 'approaching' && (
                          <div className="mt-3 px-3 py-1.5 rounded-lg bg-accent-gold/5 border border-accent-gold/10 text-center">
                            <p className="text-[10px] text-accent-gold">
                              📊 {Math.round(90 - ledger.approvalRate)} more approvals needed to reach 90% threshold
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Generated Letter View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <button
                onClick={handleBack}
                className="text-xs text-accent-blue hover:underline flex items-center gap-1"
              >
                ← Back to Ledger
              </button>

              <div className="rounded-xl border-2 border-status-green/30 bg-status-green/3 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-status-green" />
                  <span className="text-sm font-bold text-status-green">
                    Gold-Card Exemption Letter Generated
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  {selectedLedger?.doctorName} • CPT {selectedLedger?.cptCode} • {selectedLedger?.approvalRate}% • Valid until {selectedLedger?.exemptionExpiration}
                </p>
              </div>

              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <FileText size={12} className="text-accent-gold" />
                    Exemption Claim Letter
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                               bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 bg-white max-h-64 overflow-y-auto">
                  <pre className="text-[10px] text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                    {generatedLetter}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
