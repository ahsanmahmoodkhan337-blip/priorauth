'use client';

import React, { useState, useCallback } from 'react';
import { X, Play, Copy, CheckCircle2, Volume2, FileText, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Sample P2P Scripts
// ---------------------------------------------------------------------------

interface BriefScript {
  doctorName: string;
  payerName: string;
  patientName: string;
  procedureName: string;
  cptCode: string;
  keyPoints: string[];
  policyReference: string;
  script: string;
}

const SAMPLE_SCRIPTS: BriefScript[] = [
  {
    doctorName: 'Dr. Smith',
    payerName: 'Aetna',
    patientName: 'John Doe',
    procedureName: 'Lumbar MRI without contrast',
    cptCode: '72148',
    keyPoints: [
      'Patient completed 8 weeks of physical therapy with zero improvement',
      'NSAIDs and activity modification attempted for 6+ weeks',
      'Neurological exam shows L4-L5 radiculopathy',
    ],
    policyReference: 'Aetna Clinical Policy Bulletin 0729 — Lumbar MRI',
    script: 'Dr. Smith, you are speaking with Aetna regarding John Doe\'s Lumbar MRI CPT 72148. The key point to emphasize: Patient completed 8 weeks of physical therapy with zero improvement. Cite Aetna Clinical Policy Bulletin 0729, Section 3B, which specifies that MRI is indicated after 6 weeks of failed conservative management. Additionally, mention: (1) NSAIDs and activity modification attempted for 6+ weeks without relief, (2) Neurological exam confirms L4-L5 radiculopathy with diminished reflexes, (3) X-rays are non-diagnostic for suspected disc herniation. Be prepared to reference the NASS Clinical Guidelines 2021 supporting early MRI in radiculopathy cases. Good luck!',
  },
  {
    doctorName: 'Dr. Patel',
    payerName: 'UHC',
    patientName: 'Maria Garcia',
    procedureName: 'Physical Therapy — Extended Sessions',
    cptCode: '97110',
    keyPoints: [
      'Post-operative rotator cuff repair — standard protocol is 12 weeks',
      'Patient has achieved 60% ROM improvement in first 6 weeks',
      'Discontinuation would risk frozen shoulder',
    ],
    policyReference: 'UHC Commercial Coverage Determination — Physical Therapy',
    script: 'Dr. Patel, you are on a P2P call with UHC regarding Maria Garcia\'s extended PT sessions (CPT 97110). Key points: (1) Patient is 6 weeks post-op rotator cuff repair — standard protocol is 12 weeks of supervised PT per AAOS guidelines, (2) She has achieved 60% ROM improvement but requires continued supervised therapy to prevent frozen shoulder, (3) Cite UHC Commercial Coverage Determination Guideline Number: CCD.021.005, which authorizes up to 12 weeks post-operatively. Emphasize that premature discontinuation is contrary to evidence-based practice and would lead to re-injury requiring more costly surgical revision. Good luck!',
  },
  {
    doctorName: 'Dr. Chen',
    payerName: 'BCBS',
    patientName: 'Robert Kim',
    procedureName: 'Sleep Study (Polysomnography)',
    cptCode: '95810',
    keyPoints: [
      'Epworth Sleepiness Scale score of 18 (severe)',
      'STOP-BANG score of 5 (high risk for OSA)',
      'Home sleep study is contraindicated due to comorbid CHF',
    ],
    policyReference: 'BCBS Medical Policy 2.01.18 — Polysomnography',
    script: 'Dr. Chen, you are speaking with BCBS about Robert Kim\'s sleep study CPT 95810. Critical points: (1) Epworth Sleepiness Scale is 18 — severe daytime sleepiness affecting occupational safety (patient is a commercial driver), (2) STOP-BANG score of 5 indicates high risk for moderate-severe OSA, (3) Home sleep study is contraindicated due to comorbid CHF and potential central sleep apnea — only in-lab PSG can differentiate, (4) Cite BCBS Medical Policy 2.01.18 which supports attended PSG when home testing is contraindicated. Reference AASM clinical practice guidelines. Good luck!',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AudioBriefProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AudioBrief({ isOpen, onClose }: AudioBriefProps) {
  const [selectedScript, setSelectedScript] = useState<BriefScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = useCallback(() => {
    // Simulate generating a script from current audit data
    const randomIdx = Math.floor(Math.random() * SAMPLE_SCRIPTS.length);
    setSelectedScript(SAMPLE_SCRIPTS[randomIdx]);
    setCopied(false);
    setIsPlaying(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!selectedScript) return;
    navigator.clipboard.writeText(selectedScript.script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedScript]);

  const handleSimulateAudio = useCallback(() => {
    if (!selectedScript) return;
    setIsPlaying(true);
    // Simulate 2-second "audio playback"
    setTimeout(() => {
      setIsPlaying(false);
      alert('🎧 Audio brief ready! Simulated TTS: "Dr. Smith, here is your 60-second P2P prep brief..."');
    }, 2000);
  }, [selectedScript]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-status-green/5 to-accent-blue/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-green/10">
              <span className="text-xl">🎧</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Generate 60-Sec Doctor Audio Brief</h2>
              <p className="text-xs text-text-secondary">AI-powered P2P call preparation script</p>
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
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-status-green to-status-green/80
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md"
          >
            <RefreshCw size={14} className={selectedScript ? '' : 'animate-spin-slow'} />
            {selectedScript ? '🔄 Regenerate Brief' : '🎤 Generate Audio Brief'}
          </button>

          {/* Script Output */}
          {selectedScript && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Script Metadata */}
              <div className="rounded-xl border-2 border-status-green/20 bg-status-green/3 overflow-hidden">
                <div className="px-4 py-3 bg-status-green/5 border-b border-status-green/10">
                  <h3 className="text-xs font-semibold text-heading-navy flex items-center gap-2">
                    <FileText size={12} className="text-status-green" />
                    P2P Call Brief — 60 Seconds
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide">Doctor</p>
                    <p className="text-sm font-semibold text-text-primary">{selectedScript.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide">Payer</p>
                    <p className="text-sm font-semibold text-accent-blue">{selectedScript.payerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide">Patient</p>
                    <p className="text-sm font-semibold text-text-primary">{selectedScript.patientName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide">Procedure</p>
                    <p className="text-sm font-semibold text-text-primary">{selectedScript.cptCode} — {selectedScript.procedureName}</p>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/3 p-4">
                <h4 className="text-xs font-semibold text-accent-gold mb-2 flex items-center gap-1.5">
                  🔑 Key Talking Points
                </h4>
                <ul className="space-y-1.5">
                  {selectedScript.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                      <span className="text-accent-gold font-bold mt-0.5">{idx + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-2 border-t border-accent-gold/10">
                  <p className="text-[10px] text-text-secondary">
                    📚 <strong className="text-text-primary">Policy Reference:</strong> {selectedScript.policyReference}
                  </p>
                </div>
              </div>

              {/* Full Script */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <Volume2 size={12} className="text-status-green" />
                    Full 60-Second P2P Script
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium
                               bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy Script'}
                  </button>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {selectedScript.script}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                             border border-accent-blue/30 text-accent-blue text-sm font-semibold
                             hover:bg-accent-blue/10 transition-all duration-200"
                >
                  <Copy size={14} />
                  Copy Script
                </button>
                <button
                  onClick={handleSimulateAudio}
                  disabled={isPlaying}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                             text-sm font-bold transition-all duration-200 shadow-md
                             ${isPlaying
                               ? 'bg-status-green/20 text-status-green cursor-wait'
                               : 'bg-status-green text-white hover:brightness-110'
                             }`}
                >
                  {isPlaying ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      🎙️ Simulate Audio
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedScript && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-5 rounded-full bg-status-green/5 border border-status-green/10 mb-4">
                <Volume2 size={36} className="text-status-green/30" />
              </div>
              <p className="text-sm text-text-secondary max-w-xs">
                Click <strong>Generate Audio Brief</strong> to create a 60-second P2P call script from your current audit data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
