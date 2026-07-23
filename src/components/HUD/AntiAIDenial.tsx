'use client';

import React, { useState, useCallback } from 'react';
import { X, Shield, AlertTriangle, FileText, Copy, CheckCircle2, Search } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DenialFinding {
  pattern: string;
  detected: boolean;
  snippet: string;
  severity: 'high' | 'medium' | 'low';
}

interface ScanResult {
  isAlgorithmic: boolean;
  findings: DenialFinding[];
  legalNotice: string;
  scannedAt: string;
}

// ---------------------------------------------------------------------------
// Simulated denial patterns
// ---------------------------------------------------------------------------

const DENIAL_PATTERNS: DenialFinding[] = [
  {
    pattern: 'Cookie-cutter "not medically necessary" language',
    detected: true,
    snippet: '"...the requested service is not medically necessary based on clinical policy guidelines..."',
    severity: 'high',
  },
  {
    pattern: 'No physician name or license number cited',
    detected: true,
    snippet: 'Denial letter lacks reviewer name, credentials, and license number.',
    severity: 'high',
  },
  {
    pattern: 'Generic policy citation without case-specific rationale',
    detected: true,
    snippet: '"Per policy CP.MP.123, this procedure does not meet coverage criteria."',
    severity: 'medium',
  },
  {
    pattern: 'Identical language across multiple cases (template match)',
    detected: true,
    snippet: '96% similarity to 14 other denials from same payer in last 30 days.',
    severity: 'high',
  },
  {
    pattern: 'No reference to specific clinical documentation reviewed',
    detected: true,
    snippet: 'No mention of chart notes, imaging reports, or specialist consultations.',
    severity: 'medium',
  },
  {
    pattern: 'Turnaround time under 2 hours (suggesting automated review)',
    detected: false,
    snippet: 'Turnaround time was 4.2 hours — within automated threshold range.',
    severity: 'low',
  },
];

// ---------------------------------------------------------------------------
// Legal notice template
// ---------------------------------------------------------------------------

const LEGAL_NOTICE_TEMPLATE = `LEGAL DEMAND LETTER — ALGORITHMIC AI DENIAL
Pursuant to CMS-0057-F and 42 CFR § 422.138(f)

To: [Payer Medical Director]
Re: Suspected Algorithmic Prior Authorization Denial

Dear Sir/Madam:

This letter constitutes a formal demand for human physician review of the above-referenced prior authorization denial. CMS-0057-F (Final Rule, published February 8, 2024) explicitly prohibits Medicare Advantage organizations from using algorithms or artificial intelligence software as the sole basis for denying coverage.

Our audit of this denial has identified the following indicia of automated/algorithmic processing:

1. Cookie-cutter denial language lacking case-specific clinical rationale.
2. Absence of reviewing physician name and license number as required by 42 CFR § 422.138(f)(2).
3. Template-matched language consistent with batch-processed denials.
4. No evidence that a qualified healthcare professional reviewed the patient's individual medical records.

Pursuant to CMS-0057-F, you are hereby required to:

(a) Provide the full name, medical license number, and state of licensure of the human physician who reviewed this case;
(b) Disclose all algorithmic parameters, criteria sets, and software tools used in making this determination;
(c) Produce evidence that a human physician performed an individualized review of the patient's specific clinical documentation.

Failure to comply within 10 business days will result in escalation to the Centers for Medicare & Medicaid Services (CMS), the State Insurance Commissioner, and the Office of Inspector General.

Sincerely,
[Provider Name]
[Practice Name]
[NPI Number]`;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AntiAIDenialProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AntiAIDenial({ isOpen, onClose }: AntiAIDenialProps) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  const handleScan = useCallback(() => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate scan delay
    setTimeout(() => {
      const detectedCount = DENIAL_PATTERNS.filter((f) => f.detected).length;
      const isAlgorithmic = detectedCount >= 3;

      setScanResult({
        isAlgorithmic,
        findings: DENIAL_PATTERNS,
        legalNotice: LEGAL_NOTICE_TEMPLATE,
        scannedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setIsScanning(false);
    }, 1800);
  }, []);

  const handleCopyNotice = useCallback(() => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult.legalNotice).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    });
  }, [scanResult]);

  const handleCopyLetter = useCallback(() => {
    if (!scanResult) return;
    navigator.clipboard.writeText(LEGAL_NOTICE_TEMPLATE).then(() => {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    });
  }, [scanResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-status-red/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-red/10">
              <Shield size={20} className="text-status-red" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Anti-AI Denial Countermeasure</h2>
              <p className="text-xs text-text-secondary">CMS-0057-F algorithmic denial detection &amp; legal response</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-status-red to-status-red/80
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-wait"
          >
            {isScanning ? (
              <>
                <Search size={14} className="animate-pulse" />
                Scanning Denial for Algorithmic Patterns...
              </>
            ) : (
              <>
                <Shield size={14} />
                🛡️ Audit for Algorithmic AI Denial
              </>
            )}
          </button>

          {/* Results */}
          {scanResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Verdict Banner */}
              {scanResult.isAlgorithmic ? (
                <div className="rounded-xl border-2 border-status-red/40 bg-status-red/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-status-red/10 flex-shrink-0">
                      <AlertTriangle size={20} className="text-status-red" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-status-red">
                        ⚠️ Algorithmic Denial Detected
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        No human physician review evident. {DenialPatternCount(scanResult)} of {scanResult.findings.length} automated-denial indicators identified.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-status-green/30 bg-status-green/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-status-green/10 flex-shrink-0">
                      <CheckCircle2 size={20} className="text-status-green" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-status-green">
                        ✅ Human Review Likely — No Algorithmic Denial Detected
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Denial appears to have undergone individualized clinical review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Findings List */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white">
                  <h4 className="text-xs font-semibold flex items-center gap-2">
                    <Search size={12} className="text-accent-gold" />
                    Algorithmic Denial Indicators — Audit Results
                  </h4>
                </div>
                <div className="divide-y divide-border-light">
                  {scanResult.findings.map((finding, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${
                        finding.detected
                          ? finding.severity === 'high'
                            ? 'bg-status-red/10'
                            : finding.severity === 'medium'
                              ? 'bg-status-orange/10'
                              : 'bg-accent-gold/10'
                          : 'bg-status-green/10'
                      }`}>
                        {finding.detected ? (
                          <AlertTriangle size={12} className={
                            finding.severity === 'high' ? 'text-status-red' :
                            finding.severity === 'medium' ? 'text-status-orange' :
                            'text-accent-gold'
                          } />
                        ) : (
                          <CheckCircle2 size={12} className="text-status-green" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${
                          finding.detected ? 'text-text-primary' : 'text-text-secondary/60'
                        }`}>
                          {finding.pattern}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                          {finding.snippet}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        finding.detected
                          ? 'bg-status-red/10 text-status-red'
                          : 'bg-status-green/10 text-status-green'
                      }`}>
                        {finding.detected ? 'DETECTED' : 'CLEAR'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Notice Preview */}
              {scanResult.isAlgorithmic && (
                <div className="rounded-xl border border-status-red/20 overflow-hidden">
                  <div className="px-4 py-3 bg-status-red/5 border-b border-status-red/10 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-status-red flex items-center gap-1.5">
                      <FileText size={12} />
                      Auto-Drafted Legal Demand Letter
                    </h4>
                    <button
                      onClick={handleCopyNotice}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                                 bg-status-red/10 text-status-red border border-status-red/20
                                 hover:bg-status-red/20 transition-colors"
                    >
                      {copiedNotice ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                      {copiedNotice ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-4 bg-white max-h-48 overflow-y-auto">
                    <pre className="text-[10px] text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                      {scanResult.legalNotice}
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {scanResult.isAlgorithmic && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyLetter}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                               bg-status-red text-white text-sm font-bold
                               hover:brightness-110 transition-all duration-200 shadow-md"
                  >
                    <FileText size={14} />
                    {copiedLetter ? 'Copied!' : 'Generate Legal Demand Letter'}
                  </button>
                  <button
                    onClick={handleCopyNotice}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                               border border-status-red/30 text-status-red text-sm font-semibold
                               hover:bg-status-red/10 transition-all duration-200"
                  >
                    <Copy size={14} />
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!scanResult && !isScanning && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-5 rounded-full bg-status-red/5 border border-status-red/10 mb-4">
                <Shield size={36} className="text-status-red/30" />
              </div>
              <p className="text-sm text-text-secondary max-w-xs">
                Click <strong>Audit for Algorithmic AI Denial</strong> to analyze a payer denial letter for CMS-0057-F violations and auto-generate a legal demand letter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function DenialPatternCount(result: { findings: DenialFinding[] }): number {
  return result.findings.filter((f) => f.detected).length;
}
