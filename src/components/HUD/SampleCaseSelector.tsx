'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Circle,
  Shield,
} from 'lucide-react';
import { useCaseState, type CaseData } from '@/lib/useCaseState';

// ---- Risk config ----

type RiskLevel = 'high-denial' | 'moderate' | 'high-approval';

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; text: string; dot: string }
> = {
  'high-denial': {
    label: 'High Denial',
    bg: 'bg-status-red/10',
    text: 'text-status-red',
    dot: 'bg-status-red',
  },
  moderate: {
    label: 'Moderate',
    bg: 'bg-status-orange/10',
    text: 'text-status-orange',
    dot: 'bg-status-orange',
  },
  'high-approval': {
    label: 'High Approval',
    bg: 'bg-status-green/10',
    text: 'text-status-green',
    dot: 'bg-status-green',
  },
};

function deriveRiskLevel(c: CaseData): RiskLevel {
  if (c.sampleRiskLevel) return c.sampleRiskLevel;
  if (!c.auditResult) return 'high-denial';
  const score = c.auditResult.approvalScore;
  if (score >= 80) return 'high-approval';
  if (score >= 50) return 'moderate';
  return 'high-denial';
}

function deriveApprovalScore(c: CaseData): number | null {
  return c.auditResult?.approvalScore ?? null;
}

// ---- Payer dropdown options ----

const PAYER_OPTIONS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Cigna',
  'Medicare MAC (Novitas)',
  'Humana',
];

// ---- Component ----

export default function SampleCaseSelector() {
  const {
    cases,
    activeCaseId,
    activeCase,
    createCase,
    updateCase,
    deleteCase,
    setActiveCase,
  } = useCaseState();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus edit input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function handleSelect(c: CaseData) {
    setActiveCase(c.id);
    setIsOpen(false);
  }

  function handleCreateNew() {
    const newId = createCase();
    setIsOpen(true);
    // Start editing name immediately
    setTimeout(() => {
      setEditingId(newId);
      const newCase = cases.find((c) => c.id === newId);
      setEditName(newCase?.name ?? '');
    }, 50);
  }

  function startEdit(e: React.MouseEvent, c: CaseData) {
    e.stopPropagation();
    setEditingId(c.id);
    setEditName(c.name);
  }

  function commitEdit(c: CaseData) {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== c.name) {
      updateCase(c.id, { name: trimmed });
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleDeleteClick(e: React.MouseEvent, c: CaseData) {
    e.stopPropagation();
    if (!c.isCustom) return;
    setConfirmDeleteId(c.id);
  }

  function confirmDelete(c: CaseData) {
    deleteCase(c.id);
    setConfirmDeleteId(null);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  const selectedCaseLabel = activeCase
    ? `${activeCase.name} — ${activeCase.payerName || 'No payer'} / CPT ${activeCase.cptCode || '???'}`
    : 'Select a case...';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ---- Trigger Button ---- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card px-4 py-3 flex items-center gap-3 text-left
                   hover:border-accent-blue/30 transition-all duration-200 group"
      >
        <div className="p-1.5 rounded-md bg-accent-blue/10 flex-shrink-0">
          <Stethoscope size={16} className="text-accent-blue" />
        </div>
        <div className="flex-1 min-w-0">
          {activeCase ? (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-text-primary truncate">
                {activeCase.name}
              </p>
              {activeCase.payerName && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-medium flex-shrink-0">
                  {activeCase.payerName}
                </span>
              )}
              {activeCase.cptCode && (
                <span className="text-[10px] text-text-secondary flex-shrink-0">
                  CPT {activeCase.cptCode}
                </span>
              )}
              {deriveApprovalScore(activeCase) !== null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    RISK_CONFIG[deriveRiskLevel(activeCase)].bg
                  } ${RISK_CONFIG[deriveRiskLevel(activeCase)].text}`}
                >
                  {deriveApprovalScore(activeCase)}%
                </span>
              )}
              {activeCase.isCustom && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold font-medium flex-shrink-0">
                  custom
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Select a case...</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            size={16}
            className="text-text-secondary group-hover:text-accent-blue transition-colors"
          />
        </motion.div>
      </button>

      {/* ---- Dropdown ---- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-50 top-full left-0 right-0 mt-2 glass-card overflow-hidden origin-top"
          >
            {/* "+ New Case" button */}
            <button
              onClick={handleCreateNew}
              className="w-full px-4 py-3 flex items-center gap-3 text-left
                         bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors duration-150
                         border-b border-accent-gold/20"
            >
              <div className="p-1.5 rounded-md bg-accent-gold/15 flex-shrink-0">
                <Plus size={16} className="text-accent-gold" />
              </div>
              <span className="text-sm font-semibold text-accent-gold">
                + New Case
              </span>
            </button>

            {/* Case list */}
            <div className="max-h-[420px] overflow-y-auto">
              {cases.map((c) => {
                const risk = RISK_CONFIG[deriveRiskLevel(c)];
                const score = deriveApprovalScore(c);
                const isActive = c.id === activeCaseId;
                const isEditing = editingId === c.id;
                const isConfirmingDelete = confirmDeleteId === c.id;

                return (
                  <div key={c.id}>
                    <div
                      onClick={() => {
                        if (!isEditing && !isConfirmingDelete) handleSelect(c);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left
                                  hover:bg-accent-blue/5 transition-colors duration-150 cursor-pointer
                                  border-b border-border-light last:border-b-0
                                  ${isActive ? 'bg-accent-blue/5 border-l-2 border-l-accent-blue' : ''}`}
                    >
                      {/* Active indicator */}
                      <div className="flex-shrink-0 w-5 flex justify-center">
                        {isActive ? (
                          <Shield size={14} className="text-accent-blue" />
                        ) : (
                          <Circle size={8} className="text-text-secondary/30" />
                        )}
                      </div>

                      {/* Case info */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit(c);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 text-sm font-medium text-text-primary bg-bg-secondary
                                         border border-accent-blue/40 rounded-md px-2 py-1
                                         focus:outline-none focus:border-accent-blue"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                commitEdit(c);
                              }}
                              className="p-1 rounded hover:bg-status-green/10 text-status-green"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                              }}
                              className="p-1 rounded hover:bg-status-red/10 text-status-red"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-text-primary truncate font-medium">
                              {c.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-text-secondary">
                                {c.payerName || 'No payer'}
                              </span>
                              <span className="text-[9px] text-text-secondary/50">•</span>
                              <span className="text-[10px] text-text-secondary">
                                CPT {c.cptCode || '...'}
                              </span>
                              {score !== null && (
                                <>
                                  <span className="text-[9px] text-text-secondary/50">•</span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${risk.bg} ${risk.text}`}
                                  >
                                    {score}%
                                  </span>
                                </>
                              )}
                              {c.isCustom && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold font-medium">
                                  custom
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions (for custom cases) */}
                      {c.isCustom && !isEditing && !isConfirmingDelete && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={(e) => startEdit(e, c)}
                            className="p-1.5 rounded hover:bg-accent-blue/10 text-text-secondary hover:text-accent-blue transition-colors"
                            title="Rename"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, c)}
                            className="p-1.5 rounded hover:bg-status-red/10 text-text-secondary hover:text-status-red transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      {/* Confirm delete */}
                      {isConfirmingDelete && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-status-red font-medium">Delete?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(c);
                            }}
                            className="p-1 rounded bg-status-red/10 text-status-red hover:bg-status-red/20"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelDelete();
                            }}
                            className="p-1 rounded hover:bg-bg-secondary text-text-secondary"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
