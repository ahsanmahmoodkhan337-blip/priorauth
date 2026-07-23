'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { SAMPLE_CASES, type SampleCaseData } from '@/lib/sampleCases';
import type { EvaluationResult } from '@/lib/evaluationEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseData {
  /** Unique ID — for sample cases this matches the sample caseId */
  id: string;
  /** Display name, editable for custom cases */
  name: string;
  /** Payer name */
  payerName: string;
  /** CPT code */
  cptCode: string;
  /** The clinical chart note */
  chartNote: string;
  /** Whether this is a user-created custom case (vs pre-loaded sample) */
  isCustom: boolean;
  /** The last audit result, or null if not yet audited */
  auditResult: EvaluationResult | null;
  /** Whether an audit is currently running */
  isAuditing: boolean;
  /** Audit error message if any */
  auditError: string | null;
  /** Unix timestamp of creation */
  createdAt: number;
  /** Risk level from the sample case data (only for sample cases) */
  sampleRiskLevel?: 'high-denial' | 'moderate' | 'high-approval';
}

export interface CaseState {
  /** All cases, ordered by most-recently-created first */
  cases: CaseData[];
  /** The currently active case id */
  activeCaseId: string | null;
  /** The currently active case object (derived) */
  activeCase: CaseData | null;

  /** Create a new empty custom case, returns its id */
  createCase: () => string;
  /** Update fields on a case */
  updateCase: (id: string, data: Partial<CaseData>) => void;
  /** Delete a custom case (sample cases cannot be deleted) */
  deleteCase: (id: string) => void;
  /** Set the active case by id */
  setActiveCase: (id: string) => void;
  /** Run the audit for a specific case (uses its chartNote, payerName, cptCode) */
  runAudit: (id: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'medhero_cases';

interface PersistedCase {
  id: string;
  name: string;
  payerName: string;
  cptCode: string;
  chartNote: string;
  isCustom: boolean;
  auditResult: EvaluationResult | null;
  createdAt: number;
  sampleRiskLevel?: 'high-denial' | 'moderate' | 'high-approval';
}

function loadPersistedCases(): PersistedCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedCase[];
  } catch {
    return [];
  }
}

function savePersistedCases(cases: PersistedCase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Merge sample + persisted cases on init
// ---------------------------------------------------------------------------

function buildInitialCases(): CaseData[] {
  const persisted = loadPersistedCases();
  const persistedMap = new Map(persisted.map((c) => [c.id, c]));

  const merged: CaseData[] = [];

  // First, add sample cases (always present), updating with any persisted data
  for (const sample of SAMPLE_CASES) {
    const saved = persistedMap.get(sample.caseId);
    merged.push({
      id: sample.caseId,
      name: sample.label,
      payerName: saved?.payerName ?? sample.payerName,
      cptCode: saved?.cptCode ?? sample.cptCode,
      chartNote: saved?.chartNote ?? sample.chartNote,
      isCustom: false,
      auditResult: saved?.auditResult ?? null,
      isAuditing: false,
      auditError: null,
      createdAt: saved?.createdAt ?? Date.now(),
      sampleRiskLevel: sample.riskLevel,
    });
  }

  // Then, add custom cases that aren't sample overrides
  for (const saved of persisted) {
    const isSample = SAMPLE_CASES.some((s) => s.caseId === saved.id);
    if (!isSample) {
      merged.push({
        id: saved.id,
        name: saved.name,
        payerName: saved.payerName,
        cptCode: saved.cptCode,
        chartNote: saved.chartNote,
        isCustom: true,
        auditResult: saved.auditResult,
        isAuditing: false,
        auditError: null,
        createdAt: saved.createdAt,
      });
    }
  }

  // Sort: sample cases first, then custom by creation time
  merged.sort((a, b) => {
    if (!a.isCustom && b.isCustom) return -1;
    if (a.isCustom && !b.isCustom) return 1;
    return b.createdAt - a.createdAt;
  });

  return merged;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CaseContext = createContext<CaseState | null>(null);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseData[]>(buildInitialCases);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(() => {
    // Default to first case on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medhero_activeCaseId');
      if (saved) return saved;
    }
    const initial = buildInitialCases();
    return initial.length > 0 ? initial[0].id : null;
  });

  // Persist active case id changes
  useEffect(() => {
    if (typeof window !== 'undefined' && activeCaseId) {
      localStorage.setItem('medhero_activeCaseId', activeCaseId);
    }
  }, [activeCaseId]);

  // Persist cases whenever they change
  useEffect(() => {
    const toPersist: PersistedCase[] = cases.map((c) => ({
      id: c.id,
      name: c.name,
      payerName: c.payerName,
      cptCode: c.cptCode,
      chartNote: c.chartNote,
      isCustom: c.isCustom,
      auditResult: c.auditResult,
      createdAt: c.createdAt,
      sampleRiskLevel: c.sampleRiskLevel,
    }));
    savePersistedCases(toPersist);
  }, [cases]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  // ---- Actions ----

  const createCase = useCallback((): string => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newCase: CaseData = {
      id,
      name: `Case ${cases.filter((c) => c.isCustom).length + 1}`,
      payerName: '',
      cptCode: '',
      chartNote: '',
      isCustom: true,
      auditResult: null,
      isAuditing: false,
      auditError: null,
      createdAt: Date.now(),
    };
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(id);
    return id;
  }, [cases]);

  const updateCase = useCallback((id: string, data: Partial<CaseData>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target || !target.isCustom) return prev; // Cannot delete sample cases
      const next = prev.filter((c) => c.id !== id);
      return next;
    });
    // If deleting the active case, switch to the first remaining
    setActiveCaseId((prevId) => {
      if (prevId === id) {
        const remaining = cases.filter((c) => c.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return prevId;
    });
  }, [cases]);

  const setActiveCase = useCallback((id: string) => {
    setActiveCaseId(id);
  }, []);

  const runAudit = useCallback(async (id: string) => {
    // Mark as auditing
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isAuditing: true, auditError: null } : c
      )
    );

    const target = cases.find((c) => c.id === id);
    if (!target) {
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, isAuditing: false, auditError: 'Case not found' }
            : c
        )
      );
      return;
    }

    if (!target.chartNote.trim() || !target.payerName || !target.cptCode) {
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                isAuditing: false,
                auditError:
                  'Please ensure chart note, payer, and CPT code are all provided before running the audit.',
              }
            : c
        )
      );
      return;
    }

    try {
      const res = await fetch('/api/audit-necessity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartNote: target.chartNote,
          payerName: target.payerName,
          cptCode: target.cptCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ?? `Server responded with status ${res.status}`
        );
      }

      const result: EvaluationResult = await res.json();
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, auditResult: result, isAuditing: false, auditError: null }
            : c
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setCases((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, isAuditing: false, auditError: message }
            : c
        )
      );
    }
  }, [cases]);

  const value = useMemo<CaseState>(
    () => ({
      cases,
      activeCaseId,
      activeCase,
      createCase,
      updateCase,
      deleteCase,
      setActiveCase,
      runAudit,
    }),
    [cases, activeCaseId, activeCase, createCase, updateCase, deleteCase, setActiveCase, runAudit]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCaseState(): CaseState {
  const ctx = useContext(CaseContext);
  if (!ctx) {
    throw new Error('useCaseState must be used within a CaseProvider');
  }
  return ctx;
}
