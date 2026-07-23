'use client';

import React, { useState, useCallback } from 'react';
import { X, AlertTriangle, Clock, FileText, Send, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PayerTimeline {
  payerName: string;
  state: string;
  cptCode: string;
  submissionDate: string;
  statutoryDeadlineDays: number;
  statutoryDeadlineDate: string;
  actualResponseDate: string | null;
  hoursOverdue: number;
  isViolation: boolean;
}

interface ComplaintForm {
  toAgency: string;
  payerName: string;
  dates: string;
  violationDetails: string;
  chartSummary: string;
  fullForm: string;
}

// ---------------------------------------------------------------------------
// Simulated violation data
// ---------------------------------------------------------------------------

const SIMULATED_VIOLATIONS: PayerTimeline[] = [
  {
    payerName: 'UnitedHealthcare',
    state: 'Texas',
    cptCode: '72148',
    submissionDate: '2026-06-15',
    statutoryDeadlineDays: 3,
    statutoryDeadlineDate: '2026-06-18',
    actualResponseDate: '2026-06-22',
    hoursOverdue: 96,
    isViolation: true,
  },
  {
    payerName: 'Aetna',
    state: 'California',
    cptCode: '27447',
    submissionDate: '2026-06-20',
    statutoryDeadlineDays: 5,
    statutoryDeadlineDate: '2026-06-25',
    actualResponseDate: null,
    hoursOverdue: 0,
    isViolation: false,
  },
  {
    payerName: 'Cigna',
    state: 'Florida',
    cptCode: '99214',
    submissionDate: '2026-06-10',
    statutoryDeadlineDays: 7,
    statutoryDeadlineDate: '2026-06-17',
    actualResponseDate: '2026-06-21',
    hoursOverdue: 96,
    isViolation: true,
  },
];

// ---------------------------------------------------------------------------
// Generate complaint form
// ---------------------------------------------------------------------------

function generateComplaintForm(violation: PayerTimeline): ComplaintForm {
  const toAgency = `${violation.state} Department of Insurance`;
  const dates = `Submitted: ${violation.submissionDate} | Statutory Deadline: ${violation.statutoryDeadlineDate} | Response: ${violation.actualResponseDate}`;
  const violationDetails = `VIOLATION: Payer exceeded ${violation.state} statutory ${violation.statutoryDeadlineDays}-day deadline by ${violation.hoursOverdue} hours. CPT ${violation.cptCode} prior authorization was submitted on ${violation.submissionDate} with all required clinical documentation. The statutory deadline under ${violation.state} insurance code was ${violation.statutoryDeadlineDate}. Payer responded on ${violation.actualResponseDate}, ${Math.round(violation.hoursOverdue / 24)} calendar days beyond the legally mandated timeframe.`;

  const fullForm = `FORMAL COMPLAINT — INSURANCE COMMISSIONER

TO: ${toAgency}
Consumer Services Division

DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

COMPLAINANT:
[Provider Name / Practice Name]
[NPI Number]
[Contact Information]

RESPONDENT:
${violation.payerName}
[Payer Address]

NATURE OF COMPLAINT: Statutory Prior Authorization Deadline Violation

DETAILED STATEMENT:

1. On ${violation.submissionDate}, a prior authorization request was submitted to ${violation.payerName} for CPT ${violation.cptCode}.

2. All required clinical documentation was provided, including chart notes, diagnostic imaging reports, and specialist consultation records.

3. Under ${violation.state} insurance law, the payer is required to respond to prior authorization requests within ${violation.statutoryDeadlineDays} calendar days (statutory deadline: ${violation.statutoryDeadlineDate}).

4. ${violation.payerName} failed to provide a determination until ${violation.actualResponseDate} — ${Math.round(violation.hoursOverdue / 24)} calendar days beyond the legally mandated deadline.

5. This delay constitutes a violation of ${violation.state} prompt-pay and utilization review statutes, and has resulted in unnecessary delay of medically necessary care.

RELIEF REQUESTED:
- Investigation of ${violation.payerName}'s prior authorization turnaround practices
- Imposition of statutory penalties for prompt-pay violations
- Order requiring compliance with statutory deadlines for all future prior authorizations
- Such other relief as the Commissioner deems appropriate

Attachments: Prior auth submission confirmation, clinical documentation summary, payer response letter`;

  return { toAgency, payerName: violation.payerName, dates, violationDetails, chartSummary: `CPT ${violation.cptCode} — Full clinical documentation submitted with initial request.`, fullForm };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DOIComplaintProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DOIComplaint({ isOpen, onClose }: DOIComplaintProps) {
  const { activeCase } = useCaseState();
  const [selectedViolation, setSelectedViolation] = useState<PayerTimeline | null>(null);
  const [complaintForm, setComplaintForm] = useState<ComplaintForm | null>(null);
  const [filed, setFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  const violations = SIMULATED_VIOLATIONS.filter((v) => v.isViolation);
  const monitored = SIMULATED_VIOLATIONS;

  const handleSelect = useCallback((violation: PayerTimeline) => {
    setSelectedViolation(violation);
    setComplaintForm(generateComplaintForm(violation));
    setFiled(false);
  }, []);

  const handleFile = useCallback(() => {
    setFiled(true);
    // Simulate filing — show toast via alert
    setTimeout(() => {
      alert('🚀 Complaint filed with Insurance Commissioner! A confirmation number has been generated: DOI-2026-00421');
    }, 300);
  }, []);

  const handleCopy = useCallback(() => {
    if (!complaintForm) return;
    navigator.clipboard.writeText(complaintForm.fullForm).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [complaintForm]);

  const handleBack = useCallback(() => {
    setSelectedViolation(null);
    setComplaintForm(null);
    setFiled(false);
  }, []);

  if (!isOpen) return null;

  // No active case — show message
  if (!activeCase) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-bg-navy/5 to-accent-gold/5">
            <h2 className="text-lg font-semibold text-heading-navy">Regulatory Tool</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          <NoActiveCaseMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-status-red/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-red/10">
              <Send size={20} className="text-status-red" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">DOI Complaint Escalator</h2>
              <p className="text-xs text-text-secondary">Instant regulatory complaint filing for statutory violations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!complaintForm ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-status-red/20 bg-status-red/3 p-3 text-center">
                  <p className="text-2xl font-bold text-status-red">{violations.length}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">Deadline Violations</p>
                </div>
                <div className="rounded-lg border border-status-green/20 bg-status-green/3 p-3 text-center">
                  <p className="text-2xl font-bold text-status-green">{monitored.length - violations.length}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">In Compliance</p>
                </div>
              </div>

              {/* Monitored Payers */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Clock size={14} className="text-accent-blue" />
                  Payer Turnaround Monitor
                </h3>

                {monitored.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      item.isViolation
                        ? 'border-status-red/30 bg-status-red/3 hover:border-status-red/50'
                        : item.actualResponseDate
                          ? 'border-status-green/20 bg-status-green/3'
                          : 'border-accent-gold/20 bg-accent-gold/3'
                    }`}
                    onClick={() => item.isViolation && handleSelect(item)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">{item.payerName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-navy/5 text-text-secondary">
                            {item.state}
                          </span>
                          <span className="text-xs font-mono text-accent-blue">CPT {item.cptCode}</span>
                        </div>
                        {item.isViolation ? (
                          <span className="text-[10px] font-bold text-status-red bg-status-red/10 px-2 py-0.5 rounded-full">
                            VIOLATION
                          </span>
                        ) : item.actualResponseDate ? (
                          <span className="text-[10px] font-medium text-status-green bg-status-green/10 px-2 py-0.5 rounded-full">
                            On Time
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      {item.isViolation && (
                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-status-red/5 border border-status-red/10">
                          <AlertTriangle size={14} className="text-status-red flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-status-red font-medium">
                            VIOLATION: Payer exceeded {item.state} statutory {item.statutoryDeadlineDays}-day deadline by {item.hoursOverdue} hours
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-text-secondary">
                        <span>Submitted: {item.submissionDate}</span>
                        <span>Deadline: {item.statutoryDeadlineDate}</span>
                        {item.actualResponseDate && <span>Response: {item.actualResponseDate}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Complaint Form View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <button
                onClick={handleBack}
                className="text-xs text-accent-blue hover:underline flex items-center gap-1"
              >
                ← Back to Monitor
              </button>

              {filed ? (
                <div className="rounded-xl border-2 border-status-green/40 bg-status-green/5 p-6 text-center">
                  <CheckCircle2 size={32} className="text-status-green mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-status-green">Complaint Filed!</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Confirmation: DOI-2026-{String(Math.floor(Math.random() * 90000 + 10000))}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    A copy has been sent to the {complaintForm.toAgency}. Allow 5–10 business days for acknowledgment.
                  </p>
                </div>
              ) : (
                <>
                  {/* Violation Summary */}
                  <div className="rounded-xl border-2 border-status-red/30 bg-status-red/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-status-red flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-status-red">Statutory Deadline Violation</h3>
                        <p className="text-xs text-text-secondary mt-1">{complaintForm.violationDetails}</p>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Form Preview */}
                  <div className="rounded-xl border border-border-light overflow-hidden">
                    <div className="px-4 py-3 bg-bg-navy text-white flex items-center justify-between">
                      <span className="text-xs font-semibold flex items-center gap-2">
                        <FileText size={12} className="text-accent-gold" />
                        DOI Complaint — Auto-Populated Preview
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                                     bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                          {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-white max-h-48 overflow-y-auto">
                      <div className="mb-3 pb-3 border-b border-border-light">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">To</p>
                        <p className="text-sm font-semibold text-text-primary">{complaintForm.toAgency}</p>
                      </div>
                      <div className="mb-3 pb-3 border-b border-border-light">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">Respondent</p>
                        <p className="text-sm font-semibold text-text-primary">{complaintForm.payerName}</p>
                      </div>
                      <div className="mb-3 pb-3 border-b border-border-light">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">Violation</p>
                        <p className="text-xs text-status-red font-medium">{complaintForm.violationDetails}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">Evidence Summary</p>
                        <p className="text-xs text-text-primary">{complaintForm.chartSummary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={handleFile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                               bg-gradient-to-r from-status-red to-status-red/80
                               text-white text-sm font-bold
                               hover:brightness-110 transition-all duration-200 shadow-md"
                  >
                    <Send size={14} />
                    🚀 File Complaint with Insurance Commissioner
                  </button>

                  <p className="text-[10px] text-text-secondary text-center">
                    Filing is simulated — generates confirmation number. Actual DOI filing requires provider signature.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
