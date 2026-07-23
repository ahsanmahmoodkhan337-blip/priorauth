'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, Scale } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

interface StatuteClockProps {
  /** The date the denial was issued or the submission was made. Falls back to active case createdAt. */
  denialDate?: string | null;
  compact?: boolean;
}

interface TimeRemaining {
  erisaDays: number;
  stateDays: number;
}

function computeRemaining(denialDateStr: string): TimeRemaining {
  const denial = new Date(denialDateStr);
  const now = new Date();
  const diffMs = now.getTime() - denial.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const erisaRemaining = Math.max(0, 180 - diffDays);
  const stateRemaining = Math.max(0, 30 - diffDays);

  return { erisaDays: erisaRemaining, stateDays: stateRemaining };
}

function colorClass(days: number): string {
  if (days <= 3) return 'text-status-red';
  if (days < 7) return 'text-status-red';
  if (days <= 14) return 'text-status-orange';
  return 'text-status-green';
}

function bgClass(days: number): string {
  if (days <= 3) return 'bg-status-red/10 border-status-red/30';
  if (days < 7) return 'bg-status-red/5 border-status-red/20';
  if (days <= 14) return 'bg-status-orange/10 border-status-orange/30';
  return 'bg-status-green/10 border-status-green/30';
}

export default function StatuteClock({
  denialDate,
  compact = false,
}: StatuteClockProps) {
  const { activeCase } = useCaseState();

  // Use active case's createdAt as the reference date, fallback to prop, then today
  const effectiveDate = (() => {
    if (denialDate) return denialDate;
    if (activeCase?.createdAt) {
      return new Date(activeCase.createdAt).toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  })();

  const [remaining, setRemaining] = useState<TimeRemaining>(() => computeRemaining(effectiveDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(computeRemaining(effectiveDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveDate]);

  const erisaFlashing = remaining.erisaDays <= 3;
  const stateFlashing = remaining.stateDays <= 3;

  // No active case and no explicit denial date
  if (!activeCase && !denialDate) {
    if (compact) {
      return (
        <div className="space-y-1 text-[9px] text-[#69727D] text-center py-2">
          No active case — select a case to track deadlines.
        </div>
      );
    }
    return (
      <div className="glass-card p-4">
        <NoActiveCaseMessage variant="inline" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {/* ERISA Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${bgClass(remaining.erisaDays)}`}
        >
          <span className={`${erisaFlashing ? 'animate-pulse' : ''}`}>🔴</span>
          <span className={colorClass(remaining.erisaDays)}>
            ERISA Appeal: <strong>{remaining.erisaDays}</strong> days
          </span>
        </div>

        {/* State Prompt-Pay Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${bgClass(remaining.stateDays)}`}
        >
          <span className={`${stateFlashing ? 'animate-pulse' : ''}`}>🟡</span>
          <span className={colorClass(remaining.stateDays)}>
            State Prompt-Pay: <strong>{remaining.stateDays}</strong> days
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-accent-gold/10">
          <Scale size={14} className="text-accent-gold" />
        </div>
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
          Appeal &amp; Prompt-Pay Statute Clock
        </h3>
      </div>

      {/* ERISA Deadline */}
      <div
        className={`rounded-lg border p-3 ${bgClass(remaining.erisaDays)}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${erisaFlashing ? 'animate-pulse' : ''}`}>🔴</span>
            <span className={`text-sm font-bold ${colorClass(remaining.erisaDays)}`}>
              ERISA Appeal Deadline
            </span>
          </div>
          <span className={`text-lg font-bold font-mono ${colorClass(remaining.erisaDays)}`}>
            {remaining.erisaDays}
          </span>
        </div>
        <p className="text-[10px] text-text-secondary">
          Days remaining — 180-day mandatory appeal window
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              remaining.erisaDays <= 3
                ? 'bg-status-red'
                : remaining.erisaDays <= 14
                  ? 'bg-status-orange'
                  : 'bg-status-green'
            }`}
            style={{ width: `${Math.min(100, ((180 - remaining.erisaDays) / 180) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-text-secondary/60">
          Statutory citation: ERISA § 503
        </p>
      </div>

      {/* State Prompt-Pay */}
      <div
        className={`rounded-lg border p-3 ${bgClass(remaining.stateDays)}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${stateFlashing ? 'animate-pulse' : ''}`}>🟡</span>
            <span className={`text-sm font-bold ${colorClass(remaining.stateDays)}`}>
              State Prompt-Pay Law
            </span>
          </div>
          <span className={`text-lg font-bold font-mono ${colorClass(remaining.stateDays)}`}>
            {remaining.stateDays}
          </span>
        </div>
        <p className="text-[10px] text-text-secondary">
          Days remaining — 30-day decision rule
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              remaining.stateDays <= 3
                ? 'bg-status-red'
                : remaining.stateDays <= 7
                  ? 'bg-status-orange'
                  : 'bg-status-green'
            }`}
            style={{ width: `${Math.min(100, ((30 - remaining.stateDays) / 30) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-text-secondary/60">
          Statutory citation: State Insurance Code § 101
        </p>
      </div>

      {/* Reference Date */}
      <div className="flex items-center gap-1.5 text-[10px] text-text-secondary/60">
        <Clock size={10} />
        <span>
          Based on {denialDate ? 'denial' : 'submission'} date:{' '}
          {new Date(effectiveDate + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
