'use client';

import React, { useState, useCallback } from 'react';
import {
  FileText, BarChart3, BookOpen, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import SampleCaseSelector from '@/components/HUD/SampleCaseSelector';
import type { SampleCaseData } from '@/components/HUD/SampleCaseSelector';
import ChartEditor from '@/components/HUD/ChartEditor';
import OCRUploadButton from '@/components/HUD/OCRUploadButton';
import ScoreGauge from '@/components/HUD/ScoreGauge';
import CriteriaChecklist from '@/components/HUD/CriteriaChecklist';
import PolicyCitationDrawer from '@/components/HUD/PolicyCitationDrawer';
import PacketGeneratorModal from '@/components/HUD/PacketGeneratorModal';
import FaxPacketAssembler from '@/components/HUD/FaxPacketAssembler';
import StatuteClock from '@/components/HUD/StatuteClock';
import PatientNotifier from '@/components/HUD/PatientNotifier';
import SessionKeepAlive from '@/components/HUD/SessionKeepAlive';
import RxStepTherapy from '@/components/HUD/RxStepTherapy';
import AppealEngine from '@/components/HUD/AppealEngine';
import RetroPAMode from '@/components/HUD/RetroPAMode';
import PortalSSOVault from '@/components/HUD/PortalSSOVault';
import AudioBrief from '@/components/HUD/AudioBrief';
import CopayMatcher from '@/components/HUD/CopayMatcher';
import AntiAIDenial from '@/components/HUD/AntiAIDenial';
import GoldCardTracker from '@/components/HUD/GoldCardTracker';
import DOIComplaint from '@/components/HUD/DOIComplaint';
import FHIRClient from '@/components/HUD/FHIRClient';
import RevenuePrioritizer from '@/components/HUD/RevenuePrioritizer';
import P2PCalendar from '@/components/HUD/P2PCalendar';

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
  const [isFaxOpen, setIsFaxOpen] = useState(false);
  const [isPatientNotifierOpen, setIsPatientNotifierOpen] = useState(false);
  const [isWorkloadToolsExpanded, setIsWorkloadToolsExpanded] = useState(false);
  const [isPACommandCenterExpanded, setIsPACommandCenterExpanded] = useState(false);

  // ---- PA-OS Module State --------------------------------------------------
  const [isRxStepTherapyOpen, setIsRxStepTherapyOpen] = useState(false);
  const [isAppealEngineOpen, setIsAppealEngineOpen] = useState(false);
  const [isRetroPAModeOpen, setIsRetroPAModeOpen] = useState(false);
  const [isPortalSSOVaultOpen, setIsPortalSSOVaultOpen] = useState(false);
  const [isAudioBriefOpen, setIsAudioBriefOpen] = useState(false);
  const [isCopayMatcherOpen, setIsCopayMatcherOpen] = useState(false);

  // ---- Regulatory & Legal Power-Tools State ---------------------------------
  const [isRegulatoryExpanded, setIsRegulatoryExpanded] = useState(false);
  const [isAntiAIDenialOpen, setIsAntiAIDenialOpen] = useState(false);
  const [isGoldCardTrackerOpen, setIsGoldCardTrackerOpen] = useState(false);
  const [isDOIComplaintOpen, setIsDOIComplaintOpen] = useState(false);
  const [isFHIRClientOpen, setIsFHIRClientOpen] = useState(false);
  const [isRevenuePrioritizerOpen, setIsRevenuePrioritizerOpen] = useState(false);
  const [isP2PCalendarOpen, setIsP2PCalendarOpen] = useState(false);

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

              {/* ---- Quick-Action Workload Tools (always visible) ---- */}
              <div className="border-t border-border-light mt-2 pt-2">
                <button
                  onClick={() => setIsWorkloadToolsExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             hover:bg-accent-gold/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-accent-gold/10">
                      <Zap size={12} className="text-accent-gold" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      ⚡ Quick-Action Workload Tools
                    </span>
                  </div>
                  {isWorkloadToolsExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  )}
                </button>

                {/* Expandable Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isWorkloadToolsExpanded ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3 space-y-3">
                    {/* Tool 1: Fax Packet Assembler */}
                    <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} className="text-accent-gold" />
                          <span className="text-[11px] font-semibold text-text-primary">
                            📄 AI e-Fax &amp; PDF Packet
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-secondary mb-2">
                        HIPAA cover sheet + justification letter + evidence binder + citations
                      </p>
                      <button
                        onClick={() => setIsFaxOpen(true)}
                        disabled={!letter}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md
                                   bg-accent-gold/10 border border-accent-gold/25 text-accent-gold text-[10px] font-medium
                                   hover:bg-accent-gold/20 transition-all duration-200
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FileText size={12} />
                        Compile HIPAA e-Fax Packet
                      </button>
                    </div>

                    {/* Tool 2: ERISA & State Prompt-Pay Statute Clock */}
                    <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[11px] font-semibold text-text-primary">
                          ⏱️ ERISA &amp; State Prompt-Pay Clock
                        </span>
                      </div>
                      <StatuteClock compact />
                    </div>

                    {/* Tool 3: Patient SMS/Email Generator */}
                    <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[11px] font-semibold text-text-primary">
                          📱 Patient Status Message Generator
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary mb-2">
                        Convert PA jargon into plain-English SMS/email updates
                      </p>
                      <button
                        onClick={() => setIsPatientNotifierOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md
                                   bg-accent-blue/10 border border-accent-blue/25 text-accent-blue text-[10px] font-medium
                                   hover:bg-accent-blue/20 transition-all duration-200"
                      >
                        📱 Draft Patient Status SMS/Email
                      </button>
                    </div>

                    {/* Tool 4: Portal Keep-Alive */}
                    <div className="rounded-lg border border-status-green/20 bg-status-green/3 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[11px] font-semibold text-text-primary">
                          🔄 Portal Anti-Timeout Keep-Alive
                        </span>
                      </div>
                      <SessionKeepAlive compact />
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- Prior Auth Command Center (PA-OS Enterprise Modules) ---- */}
              <div className="border-t border-border-light mt-2 pt-2">
                <button
                  onClick={() => setIsPACommandCenterExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             hover:bg-accent-blue/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-accent-blue/10">
                      <span className="text-sm">🏛️</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      Prior Auth Command Center
                    </span>
                  </div>
                  {isPACommandCenterExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  )}
                </button>

                {/* Expandable PA-OS Grid */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isPACommandCenterExpanded ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Module 1: Rx Step-Therapy */}
                      <button
                        onClick={() => setIsRxStepTherapyOpen(true)}
                        className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-2.5 text-left
                                   hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all duration-200 group"
                      >
                        <span className="text-base">💊</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Specialty Rx & Step-Therapy
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          Formulary lookup + exception letters
                        </p>
                      </button>

                      {/* Module 2: Appeal Engine */}
                      <button
                        onClick={() => setIsAppealEngineOpen(true)}
                        className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-2.5 text-left
                                   hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200 group"
                      >
                        <span className="text-base">📋</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Multi-Tier Appeal Tracker
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          Level 1 → IRO escalation
                        </p>
                      </button>

                      {/* Module 3: Retro-PA Mode */}
                      <button
                        onClick={() => setIsRetroPAModeOpen(true)}
                        className="rounded-lg border border-status-red/20 bg-status-red/3 p-2.5 text-left
                                   hover:border-status-red/40 hover:bg-status-red/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🚨</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          72-Hour Retro-PA Mode
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          EMTALA emergency authorization
                        </p>
                      </button>

                      {/* Module 4: Portal SSO Vault */}
                      <button
                        onClick={() => setIsPortalSSOVaultOpen(true)}
                        className="rounded-lg border border-bg-navy/20 bg-bg-navy/3 p-2.5 text-left
                                   hover:border-bg-navy/40 hover:bg-bg-navy/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🔑</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Portal SSO Vault
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          AES-256 encrypted credentials
                        </p>
                      </button>

                      {/* Module 5: Audio Brief */}
                      <button
                        onClick={() => setIsAudioBriefOpen(true)}
                        className="rounded-lg border border-status-green/20 bg-status-green/3 p-2.5 text-left
                                   hover:border-status-green/40 hover:bg-status-green/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🎧</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          60-Sec Doctor Audio Brief
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          AI P2P call prep script
                        </p>
                      </button>

                      {/* Module 6: Copay Matcher */}
                      <button
                        onClick={() => setIsCopayMatcherOpen(true)}
                        className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-2.5 text-left
                                   hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200 group"
                      >
                        <span className="text-base">💰</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Copay Assistance Programs
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          Manufacturer + foundation match
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- ⚖️ Regulatory & Legal Power-Tools ---- */}
              <div className="border-t border-border-light mt-2 pt-2">
                <button
                  onClick={() => setIsRegulatoryExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             hover:bg-status-red/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-status-red/10">
                      <span className="text-sm">⚖️</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      ⚖️ Regulatory &amp; Legal Power-Tools
                    </span>
                  </div>
                  {isRegulatoryExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  )}
                </button>

                {/* Expandable Grid */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isRegulatoryExpanded ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Tool 1: Anti-AI Denial */}
                      <button
                        onClick={() => setIsAntiAIDenialOpen(true)}
                        className="rounded-lg border border-status-red/20 bg-status-red/3 p-2.5 text-left
                                   hover:border-status-red/40 hover:bg-status-red/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🛡️</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Anti-AI Denial Countermeasure
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          CMS-0057-F algorithmic audit
                        </p>
                      </button>

                      {/* Tool 2: Gold-Card Tracker */}
                      <button
                        onClick={() => setIsGoldCardTrackerOpen(true)}
                        className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-2.5 text-left
                                   hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🏆</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Gold-Card Exemption Tracker
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          TX, WV, LA statutory exemptions
                        </p>
                      </button>

                      {/* Tool 3: DOI Complaint */}
                      <button
                        onClick={() => setIsDOIComplaintOpen(true)}
                        className="rounded-lg border border-status-red/20 bg-status-red/3 p-2.5 text-left
                                   hover:border-status-red/40 hover:bg-status-red/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🚀</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          DOI Complaint Escalator
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          Instant regulatory filing
                        </p>
                      </button>

                      {/* Tool 4: FHIR ePA Client */}
                      <button
                        onClick={() => setIsFHIRClientOpen(true)}
                        className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-2.5 text-left
                                   hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all duration-200 group"
                      >
                        <span className="text-base">🔗</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          FHIR Da Vinci ePA Client
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          CRD / DTR / PAS engine
                        </p>
                      </button>

                      {/* Tool 5: Revenue Prioritizer */}
                      <button
                        onClick={() => setIsRevenuePrioritizerOpen(true)}
                        className="rounded-lg border border-accent-gold/20 bg-accent-gold/3 p-2.5 text-left
                                   hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-all duration-200 group"
                      >
                        <span className="text-base">💰</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          Revenue-at-Risk Prioritizer
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          Sorted by financial impact
                        </p>
                      </button>

                      {/* Tool 6: P2P Calendar */}
                      <button
                        onClick={() => setIsP2PCalendarOpen(true)}
                        className="rounded-lg border border-status-green/20 bg-status-green/3 p-2.5 text-left
                                   hover:border-status-green/40 hover:bg-status-green/5 transition-all duration-200 group"
                      >
                        <span className="text-base">📅</span>
                        <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">
                          P2P Calendar Concierge
                        </p>
                        <p className="text-[9px] text-text-secondary/60 mt-0.5">
                          1-click booking + battle card
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
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

      <FaxPacketAssembler
        isOpen={isFaxOpen}
        onClose={() => setIsFaxOpen(false)}
        letter={letter}
        payerName={payerName ?? ''}
        cptCode={cptCode ?? ''}
        procedureName={evalResult?.procedureName ?? ''}
        satisfiedCriteria={satisfiedCriteria}
        lcdNumber="L36789"
      />

      <PatientNotifier
        isOpen={isPatientNotifierOpen}
        onClose={() => setIsPatientNotifierOpen(false)}
        payerName={payerName ?? ''}
        procedureName={evalResult?.procedureName ?? ''}
      />

      {/* ---- PA-OS Enterprise Module Modals ---- */}
      <RxStepTherapy
        isOpen={isRxStepTherapyOpen}
        onClose={() => setIsRxStepTherapyOpen(false)}
      />

      <AppealEngine
        isOpen={isAppealEngineOpen}
        onClose={() => setIsAppealEngineOpen(false)}
      />

      <RetroPAMode
        isOpen={isRetroPAModeOpen}
        onClose={() => setIsRetroPAModeOpen(false)}
      />

      <PortalSSOVault
        isOpen={isPortalSSOVaultOpen}
        onClose={() => setIsPortalSSOVaultOpen(false)}
      />

      <AudioBrief
        isOpen={isAudioBriefOpen}
        onClose={() => setIsAudioBriefOpen(false)}
      />

      <CopayMatcher
        isOpen={isCopayMatcherOpen}
        onClose={() => setIsCopayMatcherOpen(false)}
        cptCode={cptCode}
        procedureName={evalResult?.procedureName}
      />

      {/* ---- ⚖️ Regulatory & Legal Power-Tools Modals ---- */}
      <AntiAIDenial
        isOpen={isAntiAIDenialOpen}
        onClose={() => setIsAntiAIDenialOpen(false)}
      />

      <GoldCardTracker
        isOpen={isGoldCardTrackerOpen}
        onClose={() => setIsGoldCardTrackerOpen(false)}
      />

      <DOIComplaint
        isOpen={isDOIComplaintOpen}
        onClose={() => setIsDOIComplaintOpen(false)}
      />

      <FHIRClient
        isOpen={isFHIRClientOpen}
        onClose={() => setIsFHIRClientOpen(false)}
      />

      <RevenuePrioritizer
        isOpen={isRevenuePrioritizerOpen}
        onClose={() => setIsRevenuePrioritizerOpen(false)}
      />

      <P2PCalendar
        isOpen={isP2PCalendarOpen}
        onClose={() => setIsP2PCalendarOpen(false)}
      />
    </>
  );
}
