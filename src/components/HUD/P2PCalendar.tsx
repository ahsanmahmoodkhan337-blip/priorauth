'use client';

import React, { useState, useCallback } from 'react';
import { X, Calendar, Clock, CheckCircle2, Copy, Send, Video, Phone, ExternalLink, User } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeSlot {
  date: string;
  time: string;
  doctorName: string;
  isAvailable: boolean;
}

interface P2PDetail {
  payerName: string;
  medicalDirector: string;
  patientName: string;
  procedureName: string;
  cptCode: string;
  caseId: string;
}

interface BattleCardPoint {
  topic: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Simulated data
// ---------------------------------------------------------------------------

const P2P_DETAIL: P2PDetail = {
  payerName: 'Aetna',
  medicalDirector: 'Dr. James Morrison, MD (Medical Director — Aetna Network)',
  patientName: 'John Doe',
  procedureName: 'Lumbar MRI without contrast',
  cptCode: '72148',
  caseId: 'PA-2026-00421',
};

const AVAILABLE_SLOTS: TimeSlot[] = [
  { date: '2026-07-24', time: '9:00 AM – 9:30 AM CT', doctorName: 'Dr. Sarah Khan', isAvailable: true },
  { date: '2026-07-24', time: '2:00 PM – 2:30 PM CT', doctorName: 'Dr. Sarah Khan', isAvailable: true },
  { date: '2026-07-25', time: '10:30 AM – 11:00 AM CT', doctorName: 'Dr. Sarah Khan', isAvailable: true },
  { date: '2026-07-25', time: '3:30 PM – 4:00 PM CT', doctorName: 'Dr. Sarah Khan', isAvailable: false },
  { date: '2026-07-26', time: '8:30 AM – 9:00 AM CT', doctorName: 'Dr. Michael Patel', isAvailable: true },
  { date: '2026-07-26', time: '1:00 PM – 1:30 PM CT', doctorName: 'Dr. Michael Patel', isAvailable: true },
];

const BATTLE_CARD: BattleCardPoint[] = [
  { topic: 'Clinical History', detail: '8 weeks PT completed — zero improvement. NSAIDs × 6 weeks. Activity modification attempted.' },
  { topic: 'Physical Exam', detail: 'L4-L5 radiculopathy confirmed — diminished patellar reflex, positive SLR at 45°, dermatomal sensory loss L4.' },
  { topic: 'Policy Reference', detail: 'Aetna CPB 0729 Section 3B — MRI indicated after 6 weeks failed conservative management. All criteria satisfied.' },
  { topic: 'Guidelines', detail: 'NASS Clinical Guidelines 2021 — recommend advanced imaging for radiculopathy >6 weeks. Chou R et al. (2020) JAMA.' },
  { topic: 'Risk of Denial', detail: 'Without MRI: risk of missing cauda equina compression, permanent nerve damage, potential malpractice exposure.' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface P2PCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function P2PCalendar({ isOpen, onClose }: P2PCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingSent, setBookingSent] = useState(false);
  const [synced, setSynced] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectSlot = useCallback((slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
    setBookingSent(false);
  }, []);

  const handleSendBooking = useCallback(() => {
    if (!selectedSlot) return;
    setBookingSent(true);
    setTimeout(() => {
      alert(`📅 P2P booking link sent to ${P2P_DETAIL.payerName}! Confirmation for ${selectedSlot.date} at ${selectedSlot.time}.`);
    }, 500);
  }, [selectedSlot]);

  const handleSyncCalendar = useCallback(() => {
    setSynced(true);
    setTimeout(() => {
      alert('📅 Calendar synced! Event added to Google/Outlook: P2P Call — Aetna re: CPT 72148');
    }, 500);
  }, []);

  const handleCopyBattleCard = useCallback(() => {
    const text = BATTLE_CARD.map((p) => `${p.topic}: ${p.detail}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-status-green/5 to-accent-blue/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-green/10">
              <Calendar size={20} className="text-status-green" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">P2P Calendar Concierge</h2>
              <p className="text-xs text-text-secondary">
                {P2P_DETAIL.caseId} • {P2P_DETAIL.payerName} • CPT {P2P_DETAIL.cptCode}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Case Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border-light p-3">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Payer</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{P2P_DETAIL.payerName}</p>
            </div>
            <div className="rounded-lg border border-border-light p-3">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Medical Director</p>
              <p className="text-xs font-semibold text-accent-blue mt-0.5">{P2P_DETAIL.medicalDirector}</p>
            </div>
            <div className="rounded-lg border border-border-light p-3">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Patient</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{P2P_DETAIL.patientName}</p>
            </div>
            <div className="rounded-lg border border-border-light p-3">
              <p className="text-[10px] text-text-secondary uppercase tracking-wide">Procedure</p>
              <p className="text-xs font-semibold text-heading-navy mt-0.5">{P2P_DETAIL.procedureName} (CPT {P2P_DETAIL.cptCode})</p>
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <Clock size={14} className="text-accent-blue" />
              Available P2P Time Slots
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SLOTS.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSlot(slot)}
                  disabled={!slot.isAvailable}
                  className={`rounded-lg border p-3 text-left transition-all duration-200 ${
                    !slot.isAvailable
                      ? 'border-border-light bg-bg-secondary opacity-40 cursor-not-allowed'
                      : selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                        ? 'border-status-green bg-status-green/5 shadow-md ring-1 ring-status-green'
                        : 'border-border-light bg-white hover:border-accent-blue/30 hover:bg-accent-blue/3'
                  }`}
                >
                  <p className="text-xs font-semibold text-text-primary">
                    {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-text-secondary">{slot.time}</p>
                  <p className="text-[10px] text-accent-blue mt-0.5">{slot.doctorName}</p>
                  {!slot.isAvailable && (
                    <p className="text-[9px] text-status-red mt-0.5">Unavailable</p>
                  )}
                  {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && (
                    <p className="text-[9px] text-status-green font-medium mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Selected
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Slot Actions */}
          {selectedSlot && (
            <div className="rounded-xl border-2 border-status-green/30 bg-status-green/3 p-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-status-green" />
                <span className="text-sm font-bold text-status-green">Slot Confirmed</span>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                {selectedSlot.date} • {selectedSlot.time} • {selectedSlot.doctorName}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSendBooking}
                  disabled={bookingSent}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-md ${
                    bookingSent
                      ? 'bg-status-green/20 text-status-green cursor-default'
                      : 'bg-status-green text-white hover:brightness-110'
                  }`}
                >
                  <Send size={14} />
                  {bookingSent ? 'Booking Sent!' : 'Send P2P Booking Link'}
                </button>

                <button
                  onClick={handleSyncCalendar}
                  disabled={synced}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    synced
                      ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                      : 'border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10'
                  }`}
                >
                  <Calendar size={14} />
                  {synced ? 'Synced!' : 'Sync to Calendar'}
                </button>
              </div>
            </div>
          )}

          {/* P2P Battle Card */}
          <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/3 overflow-hidden">
            <div className="px-4 py-3 bg-accent-gold/10 border-b border-accent-gold/15 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-accent-gold flex items-center gap-1.5">
                🛡️ P2P Battle Card — Quick Reference
              </h4>
              <button
                onClick={handleCopyBattleCard}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                           bg-accent-gold/10 text-accent-gold border border-accent-gold/20
                           hover:bg-accent-gold/20 transition-colors"
              >
                {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-3 space-y-2">
              {BATTLE_CARD.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-accent-gold min-w-[3.5rem] mt-0.5">
                    {point.topic}:
                  </span>
                  <p className="text-[10px] text-text-primary leading-relaxed">
                    {point.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyBattleCard}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg
                         border border-accent-gold/30 text-accent-gold text-xs font-semibold
                         hover:bg-accent-gold/10 transition-all duration-200"
            >
              <Copy size={12} />
              Copy Battle Card
            </button>
            <button
              onClick={() => alert('📱 SMS/Email link generated: https://p2p.medhero.ai/book/PA-2026-00421')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg
                         border border-accent-blue/30 text-accent-blue text-xs font-semibold
                         hover:bg-accent-blue/10 transition-all duration-200"
            >
              <ExternalLink size={12} />
              Copy Booking Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
