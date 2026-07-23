'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, X, Loader2, CheckCircle2, AlertCircle,
  Clock, MessageSquare, RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CallStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  detail: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VoiceBotProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VoiceBot({ isOpen, onClose }: VoiceBotProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(0);
  const [results, setResults] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const callSteps: CallStep[] = [
    { id: 1, label: 'Dialing Aetna Provider Line', status: 'pending', detail: '1-800-xxx-xxxx...' },
    { id: 2, label: 'Navigating IVR', status: 'pending', detail: 'Press 1 for Provider, Press 3 for Prior Auth...' },
    { id: 3, label: 'On Hold', status: 'pending', detail: 'Estimated wait: 12 minutes' },
    { id: 4, label: 'Connected to Agent', status: 'pending', detail: 'Obtaining prior authorization status...' },
    { id: 5, label: 'Status Retrieved', status: 'pending', detail: 'Extracting case notes and timeline' },
  ];

  const simulatedResults = `📋 VOICE BOT CALL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━
📞 Called: Aetna Provider Line (1-800-xxx-xxxx)
⏱️ Total Call Duration: 16 min 42 sec
👤 Agent: Maria R. (Ref #AET-88472)

📊 CASE STATUS:
• PA-2026-08421 — Lumbar Laminectomy (CPT 63030)
• Status: IN REVIEW → Pending additional clinicals
• Urgency: Standard (15-day review clock started 07/21/2026)
• Days Remaining: 8

🚨 ACTION ITEMS:
• Agent requests updated MRI report (within 90 days)
• Physical therapy notes for last 6 months needed
• Peer-to-peer review may be scheduled if not resolved

📎 REFERENCE: Call ref #VOX-20260723-001`;

  const startCall = async () => {
    setIsRunning(true);
    setCurrentStepId(0);
    setResults(null);
    setShowResults(false);

    try {
      await fetch('/api/deploy-voice-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer: 'Aetna', paNumber: 'PA-2026-08421' }),
      });
    } catch {
      // Continue with simulation
    }

    // Step through call flow
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step <= callSteps.length) {
        setCurrentStepId(step);
      }
      if (step >= callSteps.length) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setIsRunning(false);
          setResults(simulatedResults);
          setShowResults(true);
        }, 800);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getStepWithStatus = (step: CallStep): CallStep => {
    if (step.id < currentStepId) return { ...step, status: 'complete' };
    if (step.id === currentStepId) return { ...step, status: 'active' };
    return { ...step, status: 'pending' };
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentStepId(0);
    setResults(null);
    setShowResults(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0B1F3A]/5 to-[#00E676]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0B1F3A]/10">
              <Phone size={18} className="text-[#1E5CD4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">🤖 Autonomous Voice AI Phone Bot</h2>
              <p className="text-xs text-[#69727D]">Automated payer phone calls for PA status checks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[#69727D]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Deploy Button */}
          {!isRunning && !showResults && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <button
                onClick={startCall}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                           bg-gradient-to-r from-[#1E5CD4] to-[#0D0F67] text-white
                           text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-md"
              >
                <Phone size={18} />
                🤖 Deploy Voice Bot to Call Payer
              </button>
              <p className="text-[10px] text-[#69727D] text-center">
                AI bot will navigate IVR, wait on hold, and extract PA status details
              </p>
            </motion.div>
          )}

          {/* Call Flow Animation */}
          {isRunning && (
            <div className="space-y-3">
              {callSteps.map((step) => {
                const s = getStepWithStatus(step);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.id * 0.1 }}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                      s.status === 'active'
                        ? 'border-[#1E5CD4] bg-[#1E5CD4]/5'
                        : s.status === 'complete'
                          ? 'border-[#00E676]/30 bg-[#00E676]/5'
                          : 'border-[#E5E7EB] bg-[#F7F8FA]/50'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {s.status === 'complete' ? (
                        <CheckCircle2 size={16} className="text-[#00E676]" />
                      ) : s.status === 'active' ? (
                        <Loader2 size={16} className="animate-spin text-[#1E5CD4]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#E5E7EB]" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${
                        s.status === 'active' ? 'text-[#1E5CD4]' : s.status === 'complete' ? 'text-[#111827]' : 'text-[#69727D]'
                      }`}>
                        Step {step.id}: {s.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${
                        s.status === 'pending' ? 'text-[#69727D]/50' : 'text-[#69727D]'
                      }`}>
                        {s.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {showResults && results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Success Banner */}
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/25">
                  <CheckCircle2 size={16} className="text-[#00E676]" />
                  <span className="text-xs font-semibold text-[#00E676]">Call Complete — Status Retrieved</span>
                </div>

                {/* Results Panel */}
                <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="px-4 py-2 bg-[#0B1F3A]/5 border-b border-[#E5E7EB] flex items-center gap-2">
                    <MessageSquare size={12} className="text-[#0D0F67]" />
                    <span className="text-[10px] font-semibold text-[#0D0F67]">Extracted Status Notes</span>
                  </div>
                  <div className="p-4">
                    <pre className="text-[10px] text-[#111827] font-mono whitespace-pre-wrap leading-relaxed">
                      {results}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      /* Update dashboard - simulated */
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                               bg-gradient-to-r from-[#FAD23B] to-[#FAD23B]/80 text-[#0D0F67]
                               text-xs font-semibold hover:brightness-110 transition-all duration-200 shadow-sm"
                  >
                    <RefreshCw size={12} />
                    Update PA Dashboard
                  </button>
                  <button
                    onClick={reset}
                    className="w-full text-center text-xs text-[#69727D] hover:text-[#111827] transition-colors py-1"
                  >
                    Make Another Call
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
