'use client';

import React, { useState, useCallback } from 'react';
import { X, Shield, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Target } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskFlag {
  id: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  payerPolicy: string;
  detail: string;
}

interface RiskBreakdown {
  riskProbability: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  flags: RiskFlag[];
  payerName: string;
  policyNumber: string;
  scannedAt: string;
}

// ---------------------------------------------------------------------------
// Simulated risk data for different payers
// ---------------------------------------------------------------------------

const BCBS_RISK_FLAGS: RiskFlag[] = [
  {
    id: 'bcbs-1',
    description: 'Conservative care duration insufficient',
    severity: 'high',
    payerPolicy: 'BCBS Policy #402, Section 3A',
    detail:
      'BCBS auto-denies Lumbar MRI if conservative care < 42 days. Chart shows 28 days of documented PT. Add 2 weeks of PT documentation or a specialist note explaining medical necessity for early imaging.',
  },
  {
    id: 'bcbs-2',
    description: 'Missing prior authorization for specialty referral',
    severity: 'high',
    payerPolicy: 'BCBS Policy #402, Section 5B',
    detail:
      'BCBS requires prior auth for specialist referral before approving advanced imaging. No specialist referral document found in chart. Recommend obtaining ortho/neuro referral and resubmitting.',
  },
  {
    id: 'bcbs-3',
    description: 'Incomplete pain assessment documentation',
    severity: 'medium',
    payerPolicy: 'BCBS Policy #402, Section 2C',
    detail:
      'Pain scale and functional limitation assessment partially documented. Include Oswestry Disability Index (ODI) score and detailed pain diary to strengthen medical necessity argument.',
  },
  {
    id: 'bcbs-4',
    description: 'Alternative treatments not fully documented',
    severity: 'medium',
    payerPolicy: 'BCBS Policy #402, Section 4A',
    detail:
      'Chart mentions NSAIDs but lacks documentation of trial duration, dosage, and response. Document 6-week NSAID trial with specific medication, dosage, and outcome.',
  },
  {
    id: 'bcbs-5',
    description: 'MRI CPT code mismatch risk',
    severity: 'low',
    payerPolicy: 'BCBS Policy #402, Appendix B',
    detail:
      'Ensure CPT 72148 (Lumbar MRI w/o contrast) is appropriate. If contrast is clinically indicated, use CPT 72149 and include rationale.',
  },
];

const AETNA_RISK_FLAGS: RiskFlag[] = [
  {
    id: 'aetna-1',
    description: 'Step therapy requirement not met',
    severity: 'high',
    payerPolicy: 'Aetna LCD L36789, Section 4A',
    detail:
      'Aetna requires 6 weeks of conservative management including formal PT program, NSAIDs, and activity modification. Chart shows only 3 weeks. Add 3 more weeks or provide medical necessity exception letter.',
  },
  {
    id: 'aetna-2',
    description: 'Missing red flag screening documentation',
    severity: 'high',
    payerPolicy: 'Aetna LCD L36789, Section 2B',
    detail:
      'Aetna requires explicit documentation ruling out red flags (cauda equina, infection, fracture, tumor). Chart lacks red flag screening. Add explicit negative red-flag assessment.',
  },
  {
    id: 'aetna-3',
    description: 'Radiologist consultation not cited',
    severity: 'medium',
    payerPolicy: 'Aetna LCD L36789, Section 3C',
    detail:
      'Prior imaging results referenced but radiologist report not formally cited. Attach radiologist report or include detailed findings in chart addendum.',
  },
];

const UHC_RISK_FLAGS: RiskFlag[] = [
  {
    id: 'uhc-1',
    description: 'Documentation fails UHC Clinical Policy',
    severity: 'high',
    payerPolicy: 'UHC CP.MP.123, Section 2',
    detail:
      'UHC requires neurologist or orthopedist evaluation within 30 days of imaging request. No specialist evaluation found. Obtain specialist consultation and resubmit with updated documentation.',
  },
  {
    id: 'uhc-2',
    description: 'Physical therapy notes lack measurable outcomes',
    severity: 'medium',
    payerPolicy: 'UHC CP.MP.123, Section 3D',
    detail:
      'PT notes mention "improvement" but lack specific measurable outcomes (ROM degrees, strength grades, functional scores). Request updated PT progress note with objective measurements.',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PredictiveDenialProps {
  isOpen: boolean;
  onClose: () => void;
  payerName?: string | null;
  cptCode?: string | null;
}

// ---------------------------------------------------------------------------
// Helper — pick risk flags based on payer
// ---------------------------------------------------------------------------

function getRiskFlags(payerName: string | null | undefined): { flags: RiskFlag[]; policyNumber: string } {
  if (!payerName) return { flags: BCBS_RISK_FLAGS, policyNumber: 'BCBS Policy #402' };
  const name = payerName.toLowerCase();
  if (name.includes('aetna')) return { flags: AETNA_RISK_FLAGS, policyNumber: 'Aetna LCD L36789' };
  if (name.includes('united') || name.includes('uhc')) return { flags: UHC_RISK_FLAGS, policyNumber: 'UHC CP.MP.123' };
  return { flags: BCBS_RISK_FLAGS, policyNumber: 'BCBS Policy #402' };
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function getRiskColor(probability: number): { arc: string; bg: string; text: string; border: string } {
  if (probability >= 70) return { arc: '#FF1744', bg: 'bg-status-red/10', text: 'text-status-red', border: 'border-status-red' };
  if (probability >= 40) return { arc: '#FF9100', bg: 'bg-status-orange/10', text: 'text-status-orange', border: 'border-status-orange' };
  return { arc: '#00E676', bg: 'bg-status-green/10', text: 'text-status-green', border: 'border-status-green' };
}

function getSeverityColor(severity: RiskFlag['severity']): { bg: string; text: string; dot: string } {
  switch (severity) {
    case 'high': return { bg: 'bg-status-red/10', text: 'text-status-red', dot: 'bg-status-red' };
    case 'medium': return { bg: 'bg-status-orange/10', text: 'text-status-orange', dot: 'bg-status-orange' };
    case 'low': return { bg: 'bg-accent-gold/10', text: 'text-heading-navy', dot: 'bg-accent-gold' };
  }
}

// ---------------------------------------------------------------------------
// Circular gauge sub-component
// ---------------------------------------------------------------------------

function RiskGauge({ probability, colors }: { probability: number; colors: ReturnType<typeof getRiskColor> }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
        {/* Background circle */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        {/* Progress arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={colors.arc}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-extrabold"
          style={{ color: colors.arc, fontFamily: 'var(--font-dm-sans), Inter, sans-serif' }}
        >
          {probability}%
        </span>
        <span className="text-[10px] text-text-secondary font-medium mt-0.5">DENIAL RISK</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictiveDenial({ isOpen, onClose, payerName, cptCode }: PredictiveDenialProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RiskBreakdown | null>(null);
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      const { flags, policyNumber } = getRiskFlags(payerName);
      const highCount = flags.filter((f) => f.severity === 'high').length;
      const mediumCount = flags.filter((f) => f.severity === 'medium').length;

      // Simulate probability based on flag counts
      const probability = Math.min(95, highCount * 25 + mediumCount * 12 + Math.floor(Math.random() * 10));
      const riskLevel = probability >= 70 ? 'High' : probability >= 40 ? 'Medium' : 'Low';

      setResult({
        riskProbability: probability,
        riskLevel,
        flags,
        payerName: payerName || 'Blue Cross Blue Shield',
        policyNumber,
        scannedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setIsAnalyzing(false);
    }, 1500);
  }, [payerName]);

  const toggleFlag = useCallback((id: string) => {
    setExpandedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (!isOpen) return null;

  const colors = result ? getRiskColor(result.riskProbability) : getRiskColor(87);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-status-red/5 to-accent-gold/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-red/10">
              <Shield size={20} className="text-status-red" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Predictive Denial Risk Engine</h2>
              <p className="text-xs text-text-secondary">ML-powered denial probability &amp; weakness detection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Payer / CPT info */}
          {(payerName || cptCode) && (
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              {payerName && (
                <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue font-semibold">
                  {payerName}
                </span>
              )}
              {cptCode && (
                <span className="px-3 py-1 rounded-full bg-accent-gold/10 text-heading-navy font-semibold">
                  CPT {cptCode}
                </span>
              )}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-status-red to-status-red/80
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-wait"
          >
            {isAnalyzing ? (
              <>
                <TrendingUp size={14} className="animate-pulse" />
                Running Denial Risk Prediction...
              </>
            ) : (
              <>
                <Shield size={14} />
                🔍 Scan Chart for Denial Risk Factors
              </>
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Risk Gauge + Summary */}
              <div className="rounded-xl border border-border-light bg-white p-5">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <RiskGauge probability={result.riskProbability} colors={colors} />

                  <div className="flex-1 space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-bold`}>
                      <AlertTriangle size={12} />
                      {result.riskLevel.toUpperCase()} DENIAL RISK
                    </div>
                    <p className="text-sm text-text-primary font-semibold leading-relaxed">
                      🔴 {result.riskProbability}% Probability of Denial under{' '}
                      <span className="text-accent-blue">{result.policyNumber}</span>
                    </p>
                    <p className="text-xs text-text-secondary">
                      {result.flags.filter((f) => f.severity === 'high').length} critical issues •{' '}
                      {result.flags.filter((f) => f.severity === 'medium').length} warnings •{' '}
                      {result.flags.filter((f) => f.severity === 'low').length} suggestions
                    </p>
                    <p className="text-[10px] text-text-secondary/60">
                      Scanned at {result.scannedAt} • {result.payerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Flags */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white flex items-center gap-2">
                  <Target size={14} className="text-accent-gold" />
                  <h4 className="text-xs font-semibold">Denial Weakness Flags — Detailed Breakdown</h4>
                </div>
                <div className="divide-y divide-border-light">
                  {result.flags.map((flag) => {
                    const severityColors = getSeverityColor(flag.severity);
                    const isExpanded = expandedFlags.has(flag.id);
                    return (
                      <div key={flag.id} className="px-4 py-3">
                        <button
                          onClick={() => toggleFlag(flag.id)}
                          className="w-full flex items-start gap-3 text-left group"
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${severityColors.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                                {flag.description}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${severityColors.bg} ${severityColors.text}`}
                              >
                                {flag.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-1">
                              <span className="text-accent-blue font-medium">{flag.payerPolicy}</span>
                            </p>
                            {isExpanded && (
                              <div className="mt-2 p-3 rounded-lg bg-bg-secondary border border-border-light animate-in fade-in duration-200">
                                <p className="text-[11px] text-text-primary leading-relaxed">{flag.detail}</p>
                              </div>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-text-secondary flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown size={14} className="text-text-secondary flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Summary */}
              <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-accent-gold/10 flex-shrink-0">
                    <Target size={16} className="text-accent-gold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-heading-navy">
                      ⚡ AI Recommendation: Address {result.flags.filter((f) => f.severity === 'high').length} Critical Flags First
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Prioritize resolving the <strong className="text-status-red">HIGH</strong> severity flags above before submission.
                      Each resolved flag reduces denial probability by approximately 20-25%.
                      Use the <strong className="text-accent-blue">ICD-10 Booster</strong> and{' '}
                      <strong className="text-accent-blue">EHR Write-Back</strong> tools to quickly address documentation gaps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 p-4 rounded-full bg-bg-secondary border border-border-light">
                <Shield size={36} className="text-text-secondary/30" />
              </div>
              <p className="text-sm text-text-secondary/60 max-w-xs">
                Click <strong>Scan Chart for Denial Risk Factors</strong> to run the ML prediction engine against the current payer's coverage policy.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light bg-bg-secondary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary border border-border-light hover:bg-white transition-colors"
          >
            Close
          </button>
          {result && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-accent-blue hover:brightness-110 transition-all shadow-sm"
            >
              Re-Scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
