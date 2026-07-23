'use client';

import React, { useState, useMemo } from 'react';
import { X, DollarSign, TrendingDown, TrendingUp, AlertTriangle, ArrowUpDown, Clock, Shield } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RevenueCase {
  id: string;
  patientName: string;
  procedureName: string;
  cptCode: string;
  dollarValue: number;
  approvalProbability: number;
  daysToExpiration: number;
  payerName: string;
}

type SortField = 'priorityScore' | 'dollarValue' | 'daysToExpiration';

// ---------------------------------------------------------------------------
// Simulated daily queue
// ---------------------------------------------------------------------------

const SIMULATED_QUEUE: RevenueCase[] = [
  {
    id: 'REV-001',
    patientName: 'John Doe',
    procedureName: 'Lumbar MRI without contrast',
    cptCode: '72148',
    dollarValue: 3200,
    approvalProbability: 85,
    daysToExpiration: 2,
    payerName: 'Aetna',
  },
  {
    id: 'REV-002',
    patientName: 'Maria Garcia',
    procedureName: 'Total Knee Arthroplasty',
    cptCode: '27447',
    dollarValue: 28500,
    approvalProbability: 72,
    daysToExpiration: 5,
    payerName: 'UHC',
  },
  {
    id: 'REV-003',
    patientName: 'Robert Kim',
    procedureName: 'Polysomnography (Sleep Study)',
    cptCode: '95810',
    dollarValue: 4500,
    approvalProbability: 90,
    daysToExpiration: 1,
    payerName: 'BCBS',
  },
  {
    id: 'REV-004',
    patientName: 'Sarah Johnson',
    procedureName: 'Shoulder Arthroscopy',
    cptCode: '29827',
    dollarValue: 18200,
    approvalProbability: 60,
    daysToExpiration: 3,
    payerName: 'Cigna',
  },
  {
    id: 'REV-005',
    patientName: 'David Chen',
    procedureName: 'Colonoscopy — Diagnostic',
    cptCode: '45378',
    dollarValue: 2800,
    approvalProbability: 95,
    daysToExpiration: 7,
    payerName: 'Aetna',
  },
  {
    id: 'REV-006',
    patientName: 'Emily Williams',
    procedureName: 'Epidural Steroid Injection',
    cptCode: '62323',
    dollarValue: 1500,
    approvalProbability: 88,
    daysToExpiration: 1,
    payerName: 'BCBS',
  },
];

// ---------------------------------------------------------------------------
// Priority formula
// ---------------------------------------------------------------------------

function calcPriorityScore(c: RevenueCase): number {
  return c.dollarValue * (c.approvalProbability / 100) * (1 + (7 - c.daysToExpiration) / 7);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RevenuePrioritizerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRiskColor(score: number): { bg: string; border: string; text: string; label: string } {
  if (score >= 20000) return { bg: 'bg-status-red/5', border: 'border-status-red/30', text: 'text-status-red', label: '🔴 High Risk' };
  if (score >= 5000) return { bg: 'bg-accent-gold/5', border: 'border-accent-gold/30', text: 'text-accent-gold', label: '🟡 Medium Risk' };
  return { bg: 'bg-status-green/5', border: 'border-status-green/30', text: 'text-status-green', label: '🟢 Low Risk' };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RevenuePrioritizer({ isOpen, onClose }: RevenuePrioritizerProps) {
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedQueue = useMemo(() => {
    const queue = [...SIMULATED_QUEUE].map((c) => ({
      ...c,
      priorityScore: calcPriorityScore(c),
    }));

    queue.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'priorityScore') cmp = a.priorityScore - b.priorityScore;
      else if (sortField === 'dollarValue') cmp = a.dollarValue - b.dollarValue;
      else if (sortField === 'daysToExpiration') cmp = a.daysToExpiration - b.daysToExpiration;
      return sortAsc ? cmp : -cmp;
    });

    return queue;
  }, [sortField, sortAsc]);

  const totalRevenueSaved = useMemo(() => {
    return sortedQueue
      .filter((c) => c.approvalProbability >= 70)
      .reduce((sum, c) => sum + c.dollarValue * (c.approvalProbability / 100), 0);
  }, [sortedQueue]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-gold/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-gold/10">
              <DollarSign size={20} className="text-accent-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Revenue-at-Risk Queue Prioritizer</h2>
              <p className="text-xs text-text-secondary">Daily workflow sorted by financial impact</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Total Revenue Saved Metric */}
          <div className="rounded-xl border-2 border-accent-gold/30 bg-gradient-to-r from-accent-gold/5 to-accent-gold/10 p-4 text-center">
            <p className="text-[10px] text-text-secondary uppercase tracking-wide mb-1">
              Total Revenue-at-Risk Saved Today
            </p>
            <p className="text-3xl font-bold text-heading-navy">
              {formatCurrency(totalRevenueSaved)}
            </p>
            <p className="text-[10px] text-text-secondary mt-1">
              Based on expected approvals (≥70% probability) × dollar value
            </p>
          </div>

          {/* Formula Reference */}
          <div className="rounded-lg border border-accent-blue/20 bg-accent-blue/3 p-3">
            <p className="text-[10px] text-text-secondary">
              <strong className="text-accent-blue">Priority Score</strong> = $Value × Approval% × (1 + (7 − DaysToExpiration)/7)
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-text-secondary">Sort by:</span>
            {[
              { field: 'priorityScore' as SortField, label: 'Priority Score' },
              { field: 'dollarValue' as SortField, label: 'Dollar Value' },
              { field: 'daysToExpiration' as SortField, label: 'Days Left' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                  sortField === field
                    ? 'border-accent-blue bg-accent-blue/10 text-accent-blue font-semibold'
                    : 'border-border-light text-text-secondary hover:border-accent-blue/30'
                }`}
              >
                {label}
                {sortField === field && (
                  <ArrowUpDown size={10} className={sortAsc ? 'rotate-180' : ''} />
                )}
              </button>
            ))}
          </div>

          {/* Queue List */}
          <div className="space-y-2">
            {sortedQueue.map((caseItem) => {
              const risk = getRiskColor(caseItem.priorityScore);
              const urgencyIcon = caseItem.daysToExpiration <= 2
                ? <AlertTriangle size={12} className="text-status-red" />
                : caseItem.daysToExpiration <= 4
                  ? <Clock size={12} className="text-accent-gold" />
                  : <Shield size={12} className="text-status-green" />;

              return (
                <div
                  key={caseItem.id}
                  className={`rounded-xl border-2 transition-all duration-200 ${risk.bg} ${risk.border}`}
                >
                  <div className="px-4 py-3">
                    {/* Top Row — Patient + Priority */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary">{caseItem.patientName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-navy/5 text-text-secondary">
                          {caseItem.payerName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold ${risk.text}`}>{risk.label}</span>
                    </div>

                    {/* Mid Row — Procedure + CPT */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-text-secondary">{caseItem.procedureName}</span>
                      <span className="text-[10px] font-mono text-accent-blue bg-accent-blue/5 px-1.5 py-0.5 rounded">
                        CPT {caseItem.cptCode}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent-gold">{formatCurrency(caseItem.dollarValue)}</p>
                        <p className="text-[9px] text-text-secondary">Value</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-accent-blue">{caseItem.approvalProbability}%</p>
                        <p className="text-[9px] text-text-secondary">Approval</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {urgencyIcon}
                          <p className={`text-lg font-bold ${caseItem.daysToExpiration <= 2 ? 'text-status-red' : caseItem.daysToExpiration <= 4 ? 'text-accent-gold' : 'text-status-green'}`}>
                            {caseItem.daysToExpiration}d
                          </p>
                        </div>
                        <p className="text-[9px] text-text-secondary">Expires</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-heading-navy">
                          {Math.round(caseItem.priorityScore).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-text-secondary">Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-status-red/20 border border-status-red/30" /> High Risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-accent-gold/20 border border-accent-gold/30" /> Medium Risk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-status-green/20 border border-status-green/30" /> Low Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
