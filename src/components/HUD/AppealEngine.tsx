'use client';

import React, { useState, useMemo } from 'react';
import { X, ChevronRight, CheckCircle2, Clock, AlertCircle, FileText, ExternalLink, Calendar } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AppealStatus = 'pending' | 'active' | 'completed';

interface AppealLevel {
  level: number;
  title: string;
  subtitle: string;
  status: AppealStatus;
  deadline: string;
  templateName: string;
  templatePreview: string;
  isCurrent: boolean;
}

interface AppealCase {
  caseId: string;
  patientName: string;
  procedureName: string;
  cptCode: string;
  payerName: string;
  levels: AppealLevel[];
  currentLevel: number;
}

// ---------------------------------------------------------------------------
// Initial Appeal Case (simulated)
// ---------------------------------------------------------------------------

const INITIAL_CASE: AppealCase = {
  caseId: 'APL-2026-00421',
  patientName: 'John Doe',
  procedureName: 'Lumbar MRI without contrast',
  cptCode: '72148',
  payerName: 'Aetna',
  currentLevel: 1,
  levels: [
    {
      level: 1,
      title: 'Level 1: Initial Reconsideration',
      subtitle: 'Peer-to-Peer Review Request',
      status: 'active',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      templateName: 'Standard Reconsideration Letter (CMS-20027)',
      templatePreview: 'I am writing to request reconsideration of the denial for CPT 72148 (Lumbar MRI). The patient has completed 8 weeks of conservative therapy including physical therapy, NSAIDs, and activity modification without improvement...',
      isCurrent: true,
    },
    {
      level: 2,
      title: 'Level 2: Medical Director Appeal',
      subtitle: 'Formal Appeal with Clinical Evidence',
      status: 'pending',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      templateName: 'Medical Director Appeal — PubMed Evidence Package',
      templatePreview: 'Per Aetna Clinical Policy Bulletin 0729, Lumbar MRI is indicated when conservative therapy fails after 6 weeks. Supporting literature: Chou R et al. (2020) JAMA; Chou R et al. (2018) Ann Intern Med; NASS Clinical Guidelines (2021)...',
      isCurrent: false,
    },
    {
      level: 3,
      title: 'Level 3: Independent Review Organization',
      subtitle: 'External IRO Appeal (Final)',
      status: 'pending',
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      templateName: 'IRO External Review Request — MAXIMUS',
      templatePreview: 'Pursuant to ERISA §503 and the Patient Protection and Affordable Care Act §2719, I request an independent external review of the denial for CPT 72148. The treating physician certifies that delay would jeopardize the patient\'s health...',
      isCurrent: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AppealEngineProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AppealEngine({ isOpen, onClose }: AppealEngineProps) {
  const { activeCase } = useCaseState();

  // Build appeal case from active case data
  const initialCase = useMemo((): AppealCase => {
    if (!activeCase) {
      return {
        caseId: 'APL-000-000',
        patientName: '—',
        procedureName: '—',
        cptCode: '—',
        payerName: '—',
        currentLevel: 1,
        levels: [],
      };
    }

    const audit = activeCase.auditResult;
    const baseDesc = audit?.procedureName || activeCase.name || 'Procedure';
    const cpt = activeCase.cptCode || 'N/A';
    const payer = activeCase.payerName || 'Unknown Payer';
    const caseId = `APL-${activeCase.id.slice(-8).toUpperCase()}`;

    return {
      caseId,
      patientName: 'Patient',
      procedureName: baseDesc,
      cptCode: cpt,
      payerName: payer,
      currentLevel: 1,
      levels: [
        {
          level: 1,
          title: 'Level 1: Initial Reconsideration',
          subtitle: 'Peer-to-Peer Review Request',
          status: 'active' as AppealStatus,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          templateName: 'Standard Reconsideration Letter (CMS-20027)',
          templatePreview: audit
            ? `Requesting reconsideration for CPT ${cpt} (${baseDesc}). Current approval score: ${audit.approvalScore}%. ${audit.missingCriteria.length} criteria need attention. ${audit.missingCriteria.map(m => m.recommendedAction).join(' ')}`
            : `Requesting reconsideration for CPT ${cpt} (${baseDesc}). Run an audit to populate the evidence base.`,
          isCurrent: true,
        },
        {
          level: 2,
          title: 'Level 2: Medical Director Appeal',
          subtitle: 'Formal Appeal with Clinical Evidence',
          status: 'pending' as AppealStatus,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          templateName: 'Medical Director Appeal — Evidence Package',
          templatePreview: audit
            ? `Formal appeal for CPT ${cpt}. ${audit.satisfiedCriteria.length} criteria met. Supporting evidence from ${payer} LCD.`
            : `Formal appeal for CPT ${cpt}. Run an audit to generate evidence.`,
          isCurrent: false,
        },
        {
          level: 3,
          title: 'Level 3: Independent Review Organization',
          subtitle: 'External IRO Appeal (Final)',
          status: 'pending' as AppealStatus,
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          templateName: 'IRO External Review Request — MAXIMUS',
          templatePreview: `Pursuant to ERISA §503 and PPACA §2719, requesting independent external review for CPT ${cpt} (${baseDesc}). Treating physician certifies delay would jeopardize patient health.`,
          isCurrent: false,
        },
      ],
    };
  }, [activeCase]);

  const [appealCase, setAppealCase] = useState<AppealCase>(initialCase);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Sync when active case changes
  useState(() => {
    setAppealCase(initialCase);
  });

  const getStatusIcon = (status: AppealStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-status-green" />;
      case 'active':
        return <Clock size={16} className="text-accent-gold" />;
      case 'pending':
        return <AlertCircle size={16} className="text-text-secondary/40" />;
    }
  };

  const getStatusBadge = (status: AppealStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', className: 'bg-status-green/10 text-status-green border-status-green/20' };
      case 'active':
        return { label: 'In Progress', className: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' };
      case 'pending':
        return { label: 'Pending', className: 'bg-bg-secondary text-text-secondary border-border-light' };
    }
  };

  const handleEscalate = () => {
    if (appealCase.currentLevel >= 3) return;

    setAppealCase((prev) => {
      const newLevels = prev.levels.map((l) => {
        if (l.level === prev.currentLevel) {
          return { ...l, status: 'completed' as AppealStatus, isCurrent: false };
        }
        if (l.level === prev.currentLevel + 1) {
          return { ...l, status: 'active' as AppealStatus, isCurrent: true };
        }
        return l;
      });
      return {
        ...prev,
        currentLevel: prev.currentLevel + 1,
        levels: newLevels,
      };
    });
  };

  if (!isOpen) return null;

  // No active case
  if (!activeCase || !activeCase.auditResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-gold/5 to-bg-navy/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-gold/10">
                <span className="text-xl">📋</span>
              </div>
              <h2 className="text-lg font-semibold text-heading-navy">Multi-Tier Appeal Engine</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          {activeCase ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-8">
              <div className="mb-4 p-4 rounded-full bg-gray-50 border border-gray-200">
                <FileText size={36} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">No audit result available</h3>
              <p className="text-sm text-[#69727D] max-w-sm">
                Run an audit on your active case first to populate appeal data and evidence packages.
              </p>
            </div>
          ) : (
            <NoActiveCaseMessage />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-gold/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-gold/10">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Multi-Tier Appeal Tracker</h2>
              <p className="text-xs text-text-secondary">
                {appealCase.caseId} • {appealCase.patientName} • {appealCase.payerName} • CPT {appealCase.cptCode}
              </p>
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
          {/* Case Info Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border-light p-3 text-center">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Procedure</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{appealCase.procedureName}</p>
            </div>
            <div className="rounded-lg border border-border-light p-3 text-center">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">CPT</p>
              <p className="text-sm font-semibold text-accent-blue mt-0.5">{appealCase.cptCode}</p>
            </div>
            <div className="rounded-lg border border-border-light p-3 text-center">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Payer</p>
              <p className="text-sm font-semibold text-heading-navy mt-0.5">{appealCase.payerName}</p>
            </div>
          </div>

          {/* Appeal Levels */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              📊 Appeal Progress
            </h3>

            {appealCase.levels.map((level) => {
              const badge = getStatusBadge(level.status);
              const isSelected = selectedLevel === level.level;

              return (
                <div key={level.level}>
                  <div
                    onClick={() => setSelectedLevel(isSelected ? null : level.level)}
                    className={`rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      level.isCurrent
                        ? 'border-accent-gold bg-accent-gold/5 shadow-md'
                        : level.status === 'completed'
                          ? 'border-status-green/30 bg-status-green/3'
                          : 'border-border-light bg-white hover:border-accent-blue/20'
                    }`}
                  >
                    {/* Level Header */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          level.isCurrent
                            ? 'bg-accent-gold text-heading-navy'
                            : level.status === 'completed'
                              ? 'bg-status-green text-white'
                              : 'bg-bg-secondary text-text-secondary'
                        }`}>
                          {level.status === 'completed' ? '✓' : level.level}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary">{level.title}</h4>
                          <p className="text-[10px] text-text-secondary">{level.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-text-secondary transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Template Preview */}
                    {isSelected && (
                      <div className="px-4 pb-4 pt-1 border-t border-border-light animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText size={12} className="text-accent-blue" />
                          <span className="text-[10px] font-semibold text-accent-blue uppercase tracking-wide">
                            Template: {level.templateName}
                          </span>
                        </div>
                        <div className="rounded-lg border border-border-light bg-bg-secondary p-3">
                          <p className="text-[11px] text-text-secondary leading-relaxed italic">
                            "{level.templatePreview}"
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Calendar size={11} className="text-status-red" />
                          <span className="text-[10px] text-status-red font-medium">
                            Deadline: {level.deadline}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium
                                            bg-accent-blue/10 text-accent-blue border border-accent-blue/20
                                            hover:bg-accent-blue/20 transition-colors">
                            <FileText size={11} />
                            Copy Template
                          </button>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium
                                            bg-status-green/10 text-status-green border border-status-green/20
                                            hover:bg-status-green/20 transition-colors">
                            <ExternalLink size={11} />
                            PubMed Citations
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Escalate Button */}
          {appealCase.currentLevel < 3 && (
            <button
              onClick={handleEscalate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                         bg-gradient-to-r from-accent-gold to-accent-gold/80
                         text-heading-navy text-sm font-bold
                         hover:brightness-110 transition-all duration-200 shadow-md"
            >
              ⬆️ Escalate to Level {appealCase.currentLevel + 1}
            </button>
          )}

          {appealCase.currentLevel >= 3 && (
            <div className="rounded-lg border border-status-green/30 bg-status-green/5 p-4 text-center">
              <CheckCircle2 size={20} className="text-status-green mx-auto mb-1" />
              <p className="text-sm font-medium text-status-green">All appeal levels completed</p>
              <p className="text-[10px] text-text-secondary mt-0.5">IRO decision is binding on the payer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
