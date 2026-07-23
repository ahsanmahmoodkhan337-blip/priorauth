'use client';

import React, { useState, useCallback } from 'react';
import {
  FileText, BarChart3, BookOpen, Loader2, AlertCircle,
  ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import SampleCaseSelector from '@/components/HUD/SampleCaseSelector';
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
import PredictiveDenial from '@/components/HUD/PredictiveDenial';
import ICD10Booster from '@/components/HUD/ICD10Booster';
import EHRWriteBack from '@/components/HUD/EHRWriteBack';
import OmniSubmission from '@/components/HUD/OmniSubmission';
import P2PWhisper from '@/components/HUD/P2PWhisper';
import CMSEnforcer from '@/components/HUD/CMSEnforcer';
import PDFSnipper from '@/components/HUD/PDFSnipper';
import DocSignatureBridge from '@/components/HUD/DocSignatureBridge';
import VoiceBot from '@/components/HUD/VoiceBot';
import KanbanTracker from '@/components/HUD/KanbanTracker';
import ProviderVault from '@/components/HUD/ProviderVault';
import BenefitRouter from '@/components/HUD/BenefitRouter';
import ControlRoom from '@/components/HUD/ControlRoom';
import ROITelemetry from '@/components/HUD/ROITelemetry';

// ---------------------------------------------------------------------------
// Types
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function derivePolicyForDrawer(payerName: string, cptCode: string, satisfied: SatisfiedCriterion[], missing: MissingCriterion[], lcdNumber?: string): PolicyShape {
  return {
    payerName,
    cptCode,
    lcdNumber: lcdNumber ?? 'N/A',
    versionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    criteria: [
      ...satisfied.map((c) => ({
        id: c.id,
        description: c.description,
      })),
      ...missing.map((c) => ({
        id: c.id,
        description: c.description,
      })),
    ],
  };
}

// ---------------------------------------------------------------------------
// PAYER_OPTIONS for custom case editing
// ---------------------------------------------------------------------------

const PAYER_OPTIONS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Cigna',
  'Medicare MAC (Novitas)',
  'Humana',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SplitScreenContainer() {
  const {
    activeCase,
    updateCase,
    runAudit,
  } = useCaseState();

  // ---- UI State -----------------------------------------------------------
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

  // ---- Workload Slayers State -----------------------------------------------
  const [isWorkloadSlayersExpanded, setIsWorkloadSlayersExpanded] = useState(false);
  const [isPredictiveDenialOpen, setIsPredictiveDenialOpen] = useState(false);
  const [isICD10BoosterOpen, setIsICD10BoosterOpen] = useState(false);
  const [isEHRWriteBackOpen, setIsEHRWriteBackOpen] = useState(false);
  const [isOmniSubmissionOpen, setIsOmniSubmissionOpen] = useState(false);
  const [isP2PWhisperOpen, setIsP2PWhisperOpen] = useState(false);
  const [isCMSEnforcerOpen, setIsCMSEnforcerOpen] = useState(false);

  // ---- Standalone Architecture Modules State ---------------------------------
  const [isStandaloneExpanded, setIsStandaloneExpanded] = useState(false);
  const [isPDFSnipperOpen, setIsPDFSnipperOpen] = useState(false);
  const [isDocSignatureBridgeOpen, setIsDocSignatureBridgeOpen] = useState(false);
  const [isVoiceBotOpen, setIsVoiceBotOpen] = useState(false);
  const [isKanbanTrackerOpen, setIsKanbanTrackerOpen] = useState(false);
  const [isProviderVaultOpen, setIsProviderVaultOpen] = useState(false);
  const [isBenefitRouterOpen, setIsBenefitRouterOpen] = useState(false);
  const [isControlRoomOpen, setIsControlRoomOpen] = useState(false);

  // ---- Derived from active case ----
  const chartNote = activeCase?.chartNote ?? '';
  const payerName = activeCase?.payerName ?? null;
  const cptCode = activeCase?.cptCode ?? null;
  const evalResult = activeCase?.auditResult ?? null;
  const isLoading = activeCase?.isAuditing ?? false;
  const error = activeCase?.auditError ?? null;

  const score = evalResult?.approvalScore ?? 0;
  const riskLevel = evalResult?.riskLevel ?? 'High';
  const satisfiedCriteria: SatisfiedCriterion[] = evalResult?.satisfiedCriteria ?? [];
  const missingCriteria: MissingCriterion[] = evalResult?.missingCriteria ?? [];
  const policy: PolicyShape | null = evalResult
    ? derivePolicyForDrawer(
        evalResult.payerName,
        evalResult.cptCode,
        satisfiedCriteria,
        missingCriteria,
        (evalResult as any).lcdNumber
      )
    : null;
  const letter = evalResult?.justificationLetter ?? '';

  const canRunAudit =
    chartNote.trim().length > 0 && payerName !== null && cptCode !== null && activeCase !== null;

  // ---- Handlers ----

  const handleChartChange = useCallback(
    (value: string) => {
      if (!activeCase) return;
      updateCase(activeCase.id, { chartNote: value, auditResult: null, auditError: null });
    },
    [activeCase, updateCase]
  );

  const handlePayerChange = useCallback(
    (value: string) => {
      if (!activeCase) return;
      updateCase(activeCase.id, { payerName: value, auditResult: null, auditError: null });
    },
    [activeCase, updateCase]
  );

  const handleCPTChange = useCallback(
    (value: string) => {
      if (!activeCase) return;
      updateCase(activeCase.id, { cptCode: value, auditResult: null, auditError: null });
    },
    [activeCase, updateCase]
  );

  const handleRunAudit = useCallback(async () => {
    if (!activeCase || !canRunAudit || isLoading) return;
    await runAudit(activeCase.id);
  }, [activeCase, canRunAudit, isLoading, runAudit]);

  const handleOCRComplete = useCallback(
    (text: string) => {
      if (!activeCase) return;
      updateCase(activeCase.id, { chartNote: text, auditResult: null, auditError: null });
    },
    [activeCase, updateCase]
  );

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
              {/* Sample Case Selector (now full case manager) */}
              <SampleCaseSelector />

              {/* Custom case: Payer & CPT inputs */}
              {activeCase?.isCustom && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Payer dropdown */}
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
                      Payer
                    </label>
                    <select
                      value={activeCase.payerName}
                      onChange={(e) => handlePayerChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border-light
                                 bg-bg-secondary text-text-primary
                                 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20
                                 appearance-none cursor-pointer"
                    >
                      <option value="">Select payer...</option>
                      {PAYER_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* CPT Code input */}
                  <div>
                    <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1 block">
                      CPT Code
                    </label>
                    <input
                      type="text"
                      value={activeCase.cptCode}
                      onChange={(e) => handleCPTChange(e.target.value)}
                      placeholder="e.g. 72148"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border-light
                                 bg-bg-secondary text-text-primary placeholder:text-text-secondary/40
                                 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20"
                    />
                  </div>
                </div>
              )}

              {/* Chart Editor */}
              <div className="min-h-0">
                <ChartEditor value={chartNote} onChange={handleChartChange} />
              </div>

              {/* ---- Action Row: Run Audit + OCR ---- */}
              <div className="flex flex-col sm:flex-row gap-3">
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

                <OCRUploadButton
                  onOCRComplete={handleOCRComplete}
                  selectedCaseId={activeCase?.id ?? null}
                />
              </div>

              {/* ---- Active payer / CPT badge ---- */}
              {payerName && cptCode && (
                <div className="flex items-center gap-2 text-[10px] text-text-secondary/70">
                  <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-medium">
                    {payerName}
                  </span>
                  <span>CPT {cptCode}</span>
                  {activeCase?.isCustom && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold font-medium">
                      Custom Case
                    </span>
                  )}
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
                    Select a case and click <strong>Run Audit</strong> to see the
                    approval likelihood score.
                  </p>
                </div>
              )}

              {/* ---- Results ---- */}
              {evalResult && !isLoading && (
                <>
                  {/* Score Gauge */}
                  <ScoreGauge score={score} riskLevel={riskLevel} />

                  {/* Predictive Denial — Quick-Access Mini Card */}
                  <button
                    onClick={() => setIsPredictiveDenialOpen(true)}
                    className="w-full rounded-xl border-2 border-status-red/20 bg-status-red/3 p-3
                               hover:border-status-red/40 hover:bg-status-red/5 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔮</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-text-primary group-hover:text-status-red transition-colors">
                          Predictive Denial Risk Analysis
                        </span>
                        <p className="text-[9px] text-text-secondary mt-0.5">
                          ML-powered risk scan against {payerName || 'payer'} policy — identify weakness flags before submission
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-status-red px-2 py-0.5 rounded-full bg-status-red/10 flex-shrink-0">
                        SCAN →
                      </span>
                    </div>
                  </button>

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

                    {/* Tool 2: ERISA Statute Clock */}
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

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isPACommandCenterExpanded ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Specialty Rx & Step-Therapy', desc: 'Formulary lookup + exception letters', icon: '💊', open: () => setIsRxStepTherapyOpen(true), cls: 'border-accent-blue/20 bg-accent-blue/3 hover:border-accent-blue/40' },
                        { label: 'Multi-Tier Appeal Tracker', desc: 'Level 1 → IRO escalation', icon: '📋', open: () => setIsAppealEngineOpen(true), cls: 'border-accent-gold/20 bg-accent-gold/3 hover:border-accent-gold/40' },
                        { label: '72-Hour Retro-PA Mode', desc: 'EMTALA emergency authorization', icon: '🚨', open: () => setIsRetroPAModeOpen(true), cls: 'border-status-red/20 bg-status-red/3 hover:border-status-red/40' },
                        { label: 'Portal SSO Vault', desc: 'AES-256 encrypted credentials', icon: '🔑', open: () => setIsPortalSSOVaultOpen(true), cls: 'border-bg-navy/20 bg-bg-navy/3 hover:border-bg-navy/40' },
                        { label: '60-Sec Doctor Audio Brief', desc: 'AI P2P call prep script', icon: '🎧', open: () => setIsAudioBriefOpen(true), cls: 'border-status-green/20 bg-status-green/3 hover:border-status-green/40' },
                        { label: 'Copay Assistance Programs', desc: 'Manufacturer + foundation match', icon: '💰', open: () => setIsCopayMatcherOpen(true), cls: 'border-accent-gold/20 bg-accent-gold/3 hover:border-accent-gold/40' },
                      ].map((m, i) => (
                        <button
                          key={i}
                          onClick={m.open}
                          className={`rounded-lg border p-2.5 text-left transition-all duration-200 group ${m.cls}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">{m.label}</p>
                          <p className="text-[9px] text-text-secondary/60 mt-0.5">{m.desc}</p>
                        </button>
                      ))}
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

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isRegulatoryExpanded ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Anti-AI Denial Countermeasure', desc: 'CMS-0057-F algorithmic audit', icon: '🛡️', open: () => setIsAntiAIDenialOpen(true), cls: 'border-status-red/20 bg-status-red/3' },
                        { label: 'Gold-Card Exemption Tracker', desc: 'TX, WV, LA statutory exemptions', icon: '🏆', open: () => setIsGoldCardTrackerOpen(true), cls: 'border-accent-gold/20 bg-accent-gold/3' },
                        { label: 'DOI Complaint Escalator', desc: 'Instant regulatory filing', icon: '🚀', open: () => setIsDOIComplaintOpen(true), cls: 'border-status-red/20 bg-status-red/3' },
                        { label: 'FHIR Da Vinci ePA Client', desc: 'CRD / DTR / PAS engine', icon: '🔗', open: () => setIsFHIRClientOpen(true), cls: 'border-accent-blue/20 bg-accent-blue/3' },
                        { label: 'Revenue-at-Risk Prioritizer', desc: 'Sorted by financial impact', icon: '💰', open: () => setIsRevenuePrioritizerOpen(true), cls: 'border-accent-gold/20 bg-accent-gold/3' },
                        { label: 'P2P Calendar Concierge', desc: '1-click booking + battle card', icon: '📅', open: () => setIsP2PCalendarOpen(true), cls: 'border-status-green/20 bg-status-green/3' },
                      ].map((m, i) => (
                        <button
                          key={i}
                          onClick={m.open}
                          className={`rounded-lg border p-2.5 text-left transition-all duration-200 group hover:brightness-95 ${m.cls}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">{m.label}</p>
                          <p className="text-[9px] text-text-secondary/60 mt-0.5">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- ⚡ Workload Slayers ---- */}
              <div className="border-t border-border-light mt-2 pt-2">
                <button
                  onClick={() => setIsWorkloadSlayersExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             hover:bg-accent-gold/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-accent-gold/10">
                      <span className="text-sm">⚡</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      ⚡ Workload Slayers — Denial Prevention Suite
                    </span>
                  </div>
                  {isWorkloadSlayersExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isWorkloadSlayersExpanded ? 'max-h-[1400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Predictive Denial Risk Engine', desc: 'ML denial probability + weakness flags', icon: '🔮', open: () => setIsPredictiveDenialOpen(true), cls: 'border-status-red/20 bg-status-red/3' },
                        { label: 'ICD-10 Specificity Booster', desc: 'Auto-upgrade codes + CPT modifiers', icon: '🎯', open: () => setIsICD10BoosterOpen(true), cls: 'border-accent-blue/20 bg-accent-blue/3' },
                        { label: 'EHR InBasket Write-Back', desc: 'Push addendum to Epic/Cerner/athena', icon: '📤', open: () => setIsEHRWriteBackOpen(true), cls: 'border-accent-blue/20 bg-accent-blue/3' },
                        { label: 'Omni-Submission Engine', desc: 'FHIR + Fax + Voice AI channels', icon: '📡', open: () => setIsOmniSubmissionOpen(true), cls: 'border-status-green/20 bg-status-green/3' },
                        { label: 'P2P Whisper Co-Pilot', desc: 'Live call AI rebuttal HUD', icon: '🎙️', open: () => setIsP2PWhisperOpen(true), cls: 'border-accent-gold/20 bg-accent-gold/3' },
                        { label: 'CMS-0057-F Enforcer', desc: 'Deadline tracker + default notices', icon: '⚖️', open: () => setIsCMSEnforcerOpen(true), cls: 'border-status-red/20 bg-status-red/3' },
                      ].map((m, i) => (
                        <button
                          key={i}
                          onClick={m.open}
                          className={`rounded-lg border p-2.5 text-left transition-all duration-200 group hover:brightness-95 ${m.cls}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">{m.label}</p>
                          <p className="text-[9px] text-text-secondary/60 mt-0.5">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- 🧩 Standalone Architecture Modules ---- */}
              <div className="border-t border-border-light mt-2 pt-2">
                <button
                  onClick={() => setIsStandaloneExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                             hover:bg-[#00E676]/5 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-[#00E676]/10">
                      <span className="text-sm">🧩</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      🧩 Standalone Architecture Modules
                    </span>
                  </div>
                  {isStandaloneExpanded ? (
                    <ChevronUp size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  ) : (
                    <ChevronDown size={14} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isStandaloneExpanded ? 'max-h-[1400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'OCR PDF Snipper', desc: 'Drag-drop + evidence binder', icon: '📄', open: () => setIsPDFSnipperOpen(true), cls: 'border-[#1E5CD4]/20 bg-[#1E5CD4]/3' },
                        { label: 'Doc Signature Bridge', desc: 'SMS digital signature addendum', icon: '📱', open: () => setIsDocSignatureBridgeOpen(true), cls: 'border-[#FAD23B]/20 bg-[#FAD23B]/3' },
                        { label: 'Voice AI Phone Bot', desc: 'Auto IVR + PA status retrieval', icon: '🤖', open: () => setIsVoiceBotOpen(true), cls: 'border-[#0B1F3A]/20 bg-[#0B1F3A]/3' },
                        { label: 'Master PA Kanban', desc: 'Visual drag-drop workflow tracker', icon: '📋', open: () => setIsKanbanTrackerOpen(true), cls: 'border-[#1E5CD4]/20 bg-[#1E5CD4]/3' },
                        { label: 'Provider Credentials Vault', desc: 'NPI, PTAN, license storage', icon: '🔑', open: () => setIsProviderVaultOpen(true), cls: 'border-[#0B1F3A]/20 bg-[#0B1F3A]/3' },
                        { label: 'Dual-Silo Benefit Router', desc: 'Pharmacy vs Medical routing', icon: '🔀', open: () => setIsBenefitRouterOpen(true), cls: 'border-[#FAD23B]/20 bg-[#FAD23B]/3' },
                        { label: 'Multi-Practice Control Room', desc: 'Aggregated practice oversight', icon: '🏢', open: () => setIsControlRoomOpen(true), cls: 'border-[#1E5CD4]/20 bg-[#1E5CD4]/3' },
                      ].map((m, i) => (
                        <button
                          key={i}
                          onClick={m.open}
                          className={`rounded-lg border p-2.5 text-left transition-all duration-200 group hover:brightness-95 ${m.cls}`}
                        >
                          <span className="text-base">{m.icon}</span>
                          <p className="text-[10px] font-semibold text-text-primary mt-1 leading-tight">{m.label}</p>
                          <p className="text-[9px] text-text-secondary/60 mt-0.5">{m.desc}</p>
                        </button>
                      ))}
                      <div className="col-span-2 mt-1">
                        <ROITelemetry compact />
                      </div>
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

      {/* ---- ⚡ Workload Slayers Modals ---- */}
      <PredictiveDenial
        isOpen={isPredictiveDenialOpen}
        onClose={() => setIsPredictiveDenialOpen(false)}
        payerName={payerName}
        cptCode={cptCode}
      />

      <ICD10Booster
        isOpen={isICD10BoosterOpen}
        onClose={() => setIsICD10BoosterOpen(false)}
        cptCode={cptCode}
        payerName={payerName}
      />

      <EHRWriteBack
        isOpen={isEHRWriteBackOpen}
        onClose={() => setIsEHRWriteBackOpen(false)}
        payerName={payerName}
        cptCode={cptCode}
      />

      <OmniSubmission
        isOpen={isOmniSubmissionOpen}
        onClose={() => setIsOmniSubmissionOpen(false)}
        payerName={payerName}
        cptCode={cptCode}
      />

      <P2PWhisper
        isOpen={isP2PWhisperOpen}
        onClose={() => setIsP2PWhisperOpen(false)}
        payerName={payerName}
        cptCode={cptCode}
      />

      <CMSEnforcer
        isOpen={isCMSEnforcerOpen}
        onClose={() => setIsCMSEnforcerOpen(false)}
        payerName={payerName}
        cptCode={cptCode}
      />

      {/* ---- 🧩 Standalone Architecture Module Modals ---- */}
      <PDFSnipper
        isOpen={isPDFSnipperOpen}
        onClose={() => setIsPDFSnipperOpen(false)}
      />

      <DocSignatureBridge
        isOpen={isDocSignatureBridgeOpen}
        onClose={() => setIsDocSignatureBridgeOpen(false)}
      />

      <VoiceBot
        isOpen={isVoiceBotOpen}
        onClose={() => setIsVoiceBotOpen(false)}
      />

      <KanbanTracker
        isOpen={isKanbanTrackerOpen}
        onClose={() => setIsKanbanTrackerOpen(false)}
      />

      <ProviderVault
        isOpen={isProviderVaultOpen}
        onClose={() => setIsProviderVaultOpen(false)}
      />

      <BenefitRouter
        isOpen={isBenefitRouterOpen}
        onClose={() => setIsBenefitRouterOpen(false)}
      />

      <ControlRoom
        isOpen={isControlRoomOpen}
        onClose={() => setIsControlRoomOpen(false)}
      />
    </>
  );
}
