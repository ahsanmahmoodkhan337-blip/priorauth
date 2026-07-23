'use client';

import React, { useState, useCallback } from 'react';
import { FileText, BarChart3, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import SampleCaseSelector from '@/components/HUD/SampleCaseSelector';
import type { SampleCaseData } from '@/components/HUD/SampleCaseSelector';
import ChartEditor from '@/components/HUD/ChartEditor';
import OCRUploadButton from '@/components/HUD/OCRUploadButton';
import ScoreGauge from '@/components/HUD/ScoreGauge';
import CriteriaChecklist from '@/components/HUD/CriteriaChecklist';
import PolicyCitationDrawer from '@/components/HUD/PolicyCitationDrawer';
import PacketGeneratorModal from '@/components/HUD/PacketGeneratorModal';

// ---------------------------------------------------------------------------
// Types — mirrored from the evaluation engine & API
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

interface PolicyShape {
  payerName: string;
  cptCode: string;
  lcdNumber: string;
  versionDate: string;
  criteria: PolicyCriterion[];
}

interface EvaluationApiResponse {
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
// Helper — derive LCD-like policies for drawer display from the raw API shape
// ---------------------------------------------------------------------------

function derivePolicyForDrawer(apiResult: EvaluationApiResponse): PolicyShape {
  return {
    payerName: apiResult.payerName,
    cptCode: apiResult.cptCode,
    lcdNumber: 'N/A',
    versionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    criteria: [
      ...apiResult.satisfiedCriteria.map((c) => ({
        id: c.id,
        description: c.description,
      })),
      ...apiResult.missingCriteria.map((c) => ({
        id: c.id,
        description: c.description,
      })),
    ],
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SplitScreenContainer() {
  // ---- UI State -----------------------------------------------------------
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [chartNote, setChartNote] = useState('');
  const [payerName, setPayerName] = useState<string | null>(null);
  const [cptCode, setCptCode] = useState<string | null>(null);

  const [evalResult, setEvalResult] = useState<EvaluationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isPacketOpen, setIsPacketOpen] = useState(false);

  // ---- Handlers -----------------------------------------------------------

  const handleSelectCase = useCallback((caseData: SampleCaseData) => {
    setSelectedCaseId(caseData.caseId);
    setChartNote(caseData.chartNote);
    setPayerName(caseData.payerName);
    setCptCode(caseData.cptCode);
    // Reset previous evaluation since chart/payer changed
    setEvalResult(null);
    setError(null);
  }, []);

  const handleChartChange = useCallback((value: string) => {
    setChartNote(value);
    // Clear stale results when user edits the note
    if (evalResult) {
      setEvalResult(null);
      setError(null);
    }
  }, [evalResult]);

  /** Trigger the /api/audit-necessity endpoint */
  const handleRunAudit = useCallback(async () => {
    if (!chartNote.trim() || !payerName || !cptCode) {
      setError(
        'Please select a sample case (or enter a chart note) and ensure a payer and CPT code are available before running the audit.'
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvalResult(null);

    try {
      const res = await fetch('/api/audit-necessity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartNote: chartNote,
          payerName,
          cptCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ?? `Server responded with status ${res.status}`
        );
      }

      const data: EvaluationApiResponse = await res.json();
      setEvalResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [chartNote, payerName, cptCode]);

  /** Pseudo-OCR handler — just fills the editor */
  const handleOCRComplete = useCallback(
    (text: string, caseId?: string) => {
      setChartNote(text);
      if (caseId) setSelectedCaseId(caseId);
      setEvalResult(null);
      setError(null);
    },
    []
  );

  // ---- Derived values -----------------------------------------------------
  const score = evalResult?.approvalScore ?? 0;
  const riskLevel = evalResult?.riskLevel ?? 'High';
  const satisfiedCriteria: SatisfiedCriterion[] =
    evalResult?.satisfiedCriteria ?? [];
  const missingCriteria: MissingCriterion[] =
    evalResult?.missingCriteria ?? [];
  const policy: PolicyShape | null = evalResult
    ? derivePolicyForDrawer(evalResult)
    : null;
  const letter = evalResult?.justificationLetter ?? '';

  const canRunAudit =
    chartNote.trim().length > 0 && payerName !== null && cptCode !== null;

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
          <div className="glass-card p-1 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-light">
              <div className="p-1.5 rounded-md bg-accent-blue/10">
                <FileText size={16} className="text-accent-blue" />
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

            <div className="p-4 space-y-4">
              {/* Sample Case Selector */}
              <SampleCaseSelector onSelectCase={handleSelectCase} />

              {/* Chart Editor */}
              <div className="min-h-0">
                <ChartEditor value={chartNote} onChange={handleChartChange} />
              </div>

              {/* ---- Action Row: Run Audit + OCR ---- */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Run Audit button */}
                <button
                  onClick={handleRunAudit}
                  disabled={!canRunAudit || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                             rounded-lg bg-gradient-to-r from-accent-gold/80 to-accent-gold
                             text-heading-navy text-xs font-semibold
                             hover:brightness-110 transition-all duration-200
                             disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={14} />
                      Run Audit
                    </>
                  )}
                </button>

                {/* OCR Upload Button */}
                <OCRUploadButton
                  onOCRComplete={handleOCRComplete}
                  selectedCaseId={selectedCaseId}
                />
              </div>

              {/* ---- Active payer / CPT badge ---- */}
              {payerName && cptCode && (
                <div className="flex items-center gap-2 text-[10px] text-text-secondary/70">
                  <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-medium">
                    {payerName}
                  </span>
                  <span>CPT {cptCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL — Audit Scorecard                                     */}
        {/* ================================================================ */}
        <div className="flex-1 lg:w-1/2 flex flex-col gap-4 min-h-0">
          <div className="glass-card p-1 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-light">
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

            <div
              className="overflow-y-auto p-4 space-y-6"
              style={{ maxHeight: 'calc(100vh - 14rem)' }}
            >
              {/* ---- Loading state ---- */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 size={36} className="animate-spin text-accent-blue" />
                  <p className="text-sm text-text-secondary">
                    Analyzing clinical documentation...
                  </p>
                </div>
              )}

              {/* ---- Error state ---- */}
              {error && !isLoading && (
                <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-status-red/5 border border-status-red/15">
                  <AlertCircle size={28} className="text-status-red" />
                  <p className="text-sm text-status-red text-center max-w-xs">{error}</p>
                  <button
                    onClick={handleRunAudit}
                    disabled={!canRunAudit}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium
                               bg-status-red/10 text-status-red
                               hover:bg-status-red/20 transition-colors
                               disabled:opacity-30"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ---- Empty state (no evaluation yet) ---- */}
              {!evalResult && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 p-4 rounded-full bg-accent-gold/5 border border-accent-gold/10">
                    <BarChart3 size={40} className="text-accent-gold/30" />
                  </div>
                  <p className="text-sm text-text-secondary/60 max-w-xs">
                    Select a sample case and click <strong>Run Audit</strong> to see the
                    approval likelihood score.
                  </p>
                </div>
              )}

              {/* ---- Results ---- */}
              {evalResult && !isLoading && (
                <>
                  {/* Score Gauge */}
                  <ScoreGauge score={score} riskLevel={riskLevel} />

                  {/* Criteria Checklist */}
                  <CriteriaChecklist
                    satisfiedCriteria={satisfiedCriteria}
                    missingCriteria={missingCriteria}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsPolicyOpen(true)}
                      disabled={!policy}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                                 border border-accent-blue/30 text-accent-blue text-xs font-medium
                                 hover:bg-accent-blue/10 transition-all duration-200
                                 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <BookOpen size={14} />
                      View Active LCD/NCD Policy
                    </button>

                    <button
                      onClick={() => setIsPacketOpen(true)}
                      disabled={!letter}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                                 bg-gradient-to-r from-accent-blue/20 to-accent-blue/5
                                 border border-accent-blue/40 text-accent-blue text-xs font-medium
                                 hover:from-accent-blue/30 hover:to-accent-blue/10
                                 transition-all duration-200
                                 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FileText size={14} />
                      Generate Appeal Packet
                    </button>
                  </div>
                </>
              )}
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
