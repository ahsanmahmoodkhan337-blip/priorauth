'use client';

import React, { useState, useCallback } from 'react';
import { X, Send, CheckCircle2, FileText, Hospital, Stethoscope, Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EHRSystem = 'epic' | 'cerner' | 'athena';

interface EHRSystemInfo {
  id: EHRSystem;
  name: string;
  productName: string;
  icon: string;
  color: string;
}

const EHR_SYSTEMS: EHRSystemInfo[] = [
  { id: 'epic', name: 'Epic', productName: 'Epic InBasket', icon: '🏥', color: '#1E5CD4' },
  { id: 'cerner', name: 'Cerner', productName: 'Cerner Message Center', icon: '🔬', color: '#0B1F3A' },
  { id: 'athena', name: 'athenaOne', productName: 'athenaOne Clinical Inbox', icon: '💻', color: '#00E676' },
];

const DOCTORS = [
  'Dr. Sarah Chen, MD — Orthopedic Spine',
  'Dr. James Rodriguez, MD — Neurology',
  'Dr. Emily Park, DO — Pain Management',
  'Dr. Michael Torres, MD — Neurosurgery',
];

// ---------------------------------------------------------------------------
// Pre-drafted addendums based on context
// ---------------------------------------------------------------------------

function generateAddendum(doctorName: string, ehrSystem: string, payerName?: string | null, cptCode?: string | null): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return `ADDENDUM — ${date} at ${time}

RE: Medical Necessity Clarification for Prior Authorization (CPT ${cptCode || 'N/A'})

Addendum to clinical documentation dated [original encounter date]:

This addendum confirms that the patient has completed a comprehensive conservative management program exceeding 6 weeks, including:
• Supervised physical therapy (2x/week for 8 weeks) with documented functional improvement per attached PT progress notes
• NSAID trial (Naproxen 500mg BID x 6 weeks) with partial relief
• Activity modification and home exercise program compliance documented

Despite maximal conservative management, the patient continues to experience significant functional limitation impacting activities of daily living. Advanced imaging (${cptCode || 'requested procedure'}) is medically necessary to guide further treatment decisions.

This addendum is being routed to ${doctorName} for review and co-signature prior to ${payerName || 'payer'} submission.

— MedHero PriorAuth AI Clinical Documentation Support`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EHRWriteBackProps {
  isOpen: boolean;
  onClose: () => void;
  payerName?: string | null;
  cptCode?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EHRWriteBack({ isOpen, onClose, payerName, cptCode }: EHRWriteBackProps) {
  const [selectedEHR, setSelectedEHR] = useState<EHRSystem>('epic');
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [isPushing, setIsPushing] = useState(false);
  const [pushComplete, setPushComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const ehrInfo = EHR_SYSTEMS.find((e) => e.id === selectedEHR)!;
  const addendum = generateAddendum(selectedDoctor, ehrInfo.name, payerName, cptCode);

  const handlePush = useCallback(() => {
    setIsPushing(true);
    setPushComplete(false);

    setTimeout(() => {
      setIsPushing(false);
      setPushComplete(true);
      const msg = `✅ Addendum routed to ${selectedDoctor}'s ${ehrInfo.productName}`;
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setPushComplete(false);
      }, 4000);
    }, 1800);
  }, [selectedDoctor, ehrInfo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10">
              <Hospital size={20} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">📤 EHR InBasket Write-Back</h2>
              <p className="text-xs text-text-secondary">Push clinical addendum to physician&apos;s EHR inbox</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Context */}
          {(payerName || cptCode) && (
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              {payerName && (
                <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue font-semibold">{payerName}</span>
              )}
              {cptCode && (
                <span className="px-3 py-1 rounded-full bg-accent-gold/10 text-heading-navy font-semibold">CPT {cptCode}</span>
              )}
            </div>
          )}

          {/* EHR System Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-2 uppercase tracking-wide">
              Select EHR System
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EHR_SYSTEMS.map((system) => (
                <button
                  key={system.id}
                  onClick={() => {
                    setSelectedEHR(system.id);
                    setPushComplete(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedEHR === system.id
                      ? 'border-accent-blue bg-accent-blue/5 shadow-sm'
                      : 'border-border-light bg-white hover:border-accent-blue/30'
                  }`}
                >
                  <span className="text-xl">{system.icon}</span>
                  <span className="text-[10px] font-semibold text-text-primary">{system.name}</span>
                  <span className="text-[9px] text-text-secondary/60">{system.productName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-2 uppercase tracking-wide">
              Route to Doctor&apos;s InBasket
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setPushComplete(false);
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-white text-sm text-text-primary
                         focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 outline-none transition-colors"
            >
              {DOCTORS.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Addendum Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-2 uppercase tracking-wide">
              Pre-Drafted Clinical Addendum
            </label>
            <div className="rounded-xl border border-border-light overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-navy text-white flex items-center gap-2">
                <FileText size={14} className="text-accent-gold" />
                <span className="text-[11px] font-semibold">{ehrInfo.productName} — Outgoing Message</span>
              </div>
              <div className="p-4 bg-white max-h-60 overflow-y-auto">
                <pre className="text-[11px] text-text-primary font-sans whitespace-pre-wrap leading-relaxed">
                  {addendum}
                </pre>
              </div>
            </div>
          </div>

          {/* Push Button */}
          <button
            onClick={handlePush}
            disabled={isPushing || pushComplete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-accent-blue to-bg-navy
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPushing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Routing to {ehrInfo.productName}...
              </>
            ) : pushComplete ? (
              <>
                <CheckCircle2 size={14} />
                ✅ Routed Successfully!
              </>
            ) : (
              <>
                <Send size={14} />
                📤 Push Addendum to {selectedDoctor.split('—')[0].trim()}&apos;s InBasket
              </>
            )}
          </button>

          {/* EHR Integration Status */}
          <div className="rounded-xl border border-border-light bg-bg-secondary p-4">
            <h4 className="text-xs font-semibold text-text-primary mb-3">EHR Integration Status</h4>
            <div className="space-y-2">
              {EHR_SYSTEMS.map((system) => (
                <div key={system.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{system.icon}</span>
                    <span className="text-[11px] font-medium text-text-primary">{system.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-status-green font-semibold">
                    <CheckCircle2 size={10} />
                    Connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light bg-bg-secondary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary border border-border-light hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-status-green text-white shadow-lg animate-in slide-in-from-right duration-300">
            <CheckCircle2 size={16} />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
