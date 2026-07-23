'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, AlertTriangle, FileText, Copy, CheckCircle2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RetroPAModeProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RetroPAMode({ isOpen, onClose }: RetroPAModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('72:00:00');
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  const emtalaStatement =
    'This procedure was performed emergently and could not wait for standard prior authorization under EMTALA §1867. The patient presented with an emergency medical condition requiring immediate stabilization. A delay in treatment would have resulted in serious jeopardy to the patient\'s health, serious impairment to bodily functions, or serious dysfunction of any bodily organ or part. Per 42 CFR §489.24, the hospital was obligated to provide stabilizing treatment without delay. Retrospective authorization is respectfully requested within the 72-hour emergency window.';

  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!submissionTime || isExpired) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - submissionTime.getTime()) / 1000);
      const total = 72 * 60 * 60;
      const remaining = Math.max(0, total - elapsed);

      if (remaining <= 0) {
        setTimeRemaining('00:00:00');
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setTimeRemaining(formatTime(remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [submissionTime, isExpired, formatTime]);

  const handleActivate = () => {
    const now = new Date();
    setSubmissionTime(now);
    setIsActive(true);
    setIsExpired(false);
    setTimeRemaining('72:00:00');
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setSubmissionTime(null);
    setIsExpired(false);
    setTimeRemaining('72:00:00');
  };

  const handleCopyEmtala = () => {
    navigator.clipboard.writeText(emtalaStatement).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerateRequest = () => {
    const requestBody = `RETROSPECTIVE AUTHORIZATION REQUEST — URGENT (72-Hour Window)

Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Submission Time: ${submissionTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? 'N/A'}
Time Remaining: ${timeRemaining}

EMTALA EXEMPTION STATEMENT:
${emtalaStatement}

REQUESTED ACTION: Retrospective authorization for emergency medical services provided.

Please acknowledge receipt of this retro-authorization request immediately per EMTALA compliance requirements.`;

    navigator.clipboard.writeText(requestBody).then(() => {
      alert('Retro-Authorization request copied to clipboard! Send to payer within the 72-hour window.');
    });
  };

  if (!isOpen) return null;

  const isUrgent = isActive && !isExpired && (() => {
    if (!submissionTime) return false;
    const elapsed = Math.floor((Date.now() - submissionTime.getTime()) / 1000);
    const total = 72 * 60 * 60;
    return (total - elapsed) < 12 * 60 * 60; // < 12 hours remaining
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isActive
            ? isUrgent
              ? 'bg-status-red/5 border-status-red/20'
              : 'bg-status-orange/5 border-status-orange/10'
            : 'border-border-light bg-gradient-to-r from-bg-navy/5 to-accent-blue/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-status-red/10' : 'bg-accent-blue/10'}`}>
              <span className="text-xl">🚨</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Urgent 72-Hour Retro-PA Mode</h2>
              <p className="text-xs text-text-secondary">
                Emergency retroactive authorization with EMTALA compliance
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
          {/* Activate/Deactivate Toggle */}
          <div className="rounded-xl border-2 border-border-light overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-status-red/10' : 'bg-bg-secondary'
                }`}>
                  <Clock size={20} className={isActive ? 'text-status-red' : 'text-text-secondary'} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Retrospective PA Mode</h3>
                  <p className="text-[10px] text-text-secondary">
                    {isActive ? 'Countdown active — submit within 72 hours' : 'Activate for emergency procedures'}
                  </p>
                </div>
              </div>
              <button
                onClick={isActive ? handleDeactivate : handleActivate}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-status-red' : 'bg-bg-secondary border border-border-light'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active State — Countdown + Banner */}
          {isActive && (
            <>
              {/* Red-tinted Urgent Banner */}
              <div className={`rounded-xl border-2 p-5 ${
                isExpired
                  ? 'bg-status-red/5 border-status-red/30'
                  : isUrgent
                    ? 'bg-status-red/5 border-status-red/30 animate-pulse'
                    : 'bg-status-orange/5 border-status-orange/20'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={24} className={isExpired ? 'text-status-red' : 'text-status-orange flex-shrink-0'} />
                  <div>
                    <h4 className="text-sm font-bold text-status-red">
                      {isExpired
                        ? '⚠️ 72-HOUR WINDOW EXPIRED'
                        : isUrgent
                          ? '⏰ URGENT — LESS THAN 12 HOURS REMAINING'
                          : '🚨 RETROSPECTIVE PA MODE ACTIVE'}
                    </h4>
                    {!isExpired && (
                      <p className="text-xs text-text-secondary mt-1">
                        {isUrgent
                          ? 'Immediate action required. Submit retro-authorization NOW.'
                          : 'Submit retro-authorization request within the 72-hour emergency window.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-5 py-4 bg-bg-navy text-white">
                  <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Clock size={12} />
                    Time Remaining — 72-Hour Window
                  </h3>
                </div>
                <div className="p-5 text-center">
                  <div className={`text-5xl font-mono font-bold tracking-widest ${
                    isExpired
                      ? 'text-status-red'
                      : isUrgent
                        ? 'text-status-red animate-pulse'
                        : 'text-heading-navy'
                  }`}>
                    {timeRemaining}
                  </div>
                  <p className="text-[10px] text-text-secondary mt-2">
                    Submission time: {submissionTime?.toLocaleString('en-US', {
                      hour: 'numeric', minute: '2-digit', hour12: true,
                      month: 'short', day: 'numeric'
                    })}
                  </p>
                  {isExpired && (
                    <p className="text-xs text-status-red font-medium mt-2">
                      The 72-hour emergency window has closed. Standard prior authorization required.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* EMTALA Statement */}
          <div className="rounded-xl border border-status-red/20 overflow-hidden">
            <div className="px-4 py-3 bg-status-red/5 border-b border-status-red/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-status-red" />
                <h3 className="text-xs font-semibold text-status-red uppercase tracking-wide">
                  EMTALA §1867 Exemption Statement
                </h3>
              </div>
              <button
                onClick={handleCopyEmtala}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                           bg-status-red/10 text-status-red hover:bg-status-red/20 transition-colors"
              >
                {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-4 bg-white">
              <p className="text-xs text-text-primary leading-relaxed">
                {emtalaStatement}
              </p>
            </div>
          </div>

          {/* Generate Request Button */}
          {isActive && !isExpired && (
            <button
              onClick={handleGenerateRequest}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                         bg-status-red text-white text-sm font-bold
                         hover:brightness-110 transition-all duration-200 shadow-lg"
            >
              <FileText size={14} />
              Generate Retro-Authorization Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
