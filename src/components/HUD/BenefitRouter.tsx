'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, GitBranch, Pill, Stethoscope, CheckCircle2,
  AlertTriangle, ArrowRight, Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlternativeDrug {
  name: string;
  benefit: 'Pharmacy' | 'Medical';
  paRequired: boolean;
  copayEstimate: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BenefitRouterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BenefitRouter({ isOpen, onClose }: BenefitRouterProps) {
  const [detectedRoute, setDetectedRoute] = useState<'Pharmacy' | 'Medical' | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [isRouting, setIsRouting] = useState(false);

  const drugName = 'Humira (adalimumab) 40mg/0.4mL';
  const pharmacyAlternatives: AlternativeDrug[] = [
    {
      name: 'Amjevita (adalimumab-atto) 40mg',
      benefit: 'Pharmacy',
      paRequired: false,
      copayEstimate: '$5 with copay card',
      notes: 'Biosimilar — same efficacy, no PA required on Aetna formulary',
    },
    {
      name: 'Cyltezo (adalimumab-adbm) 40mg',
      benefit: 'Pharmacy',
      paRequired: false,
      copayEstimate: '$0 with manufacturer card',
      notes: 'Interchangeable biosimilar — preferred on BCBS formulary',
    },
    {
      name: 'Hyrimoz (adalimumab-adaz) 40mg',
      benefit: 'Pharmacy',
      paRequired: false,
      copayEstimate: '$10',
      notes: 'Biosimilar — covered on UHC without PA',
    },
  ];

  const medicalAlternatives: AlternativeDrug[] = [
    {
      name: 'Remicade (infliximab) IV infusion',
      benefit: 'Medical',
      paRequired: false,
      copayEstimate: '20% coinsurance',
      notes: 'Buy-and-bill under medical benefit — no PA on most plans',
    },
  ];

  const handleRoute = () => {
    setIsRouting(true);
    // Simulate auto-detection
    setTimeout(() => {
      setDetectedRoute('Pharmacy');
      setShowAlternatives(true);
      setIsRouting(false);
    }, 1200);
  };

  const reset = () => {
    setDetectedRoute(null);
    setShowAlternatives(false);
    setIsRouting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0B1F3A]/5 to-[#FAD23B]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FAD23B]/15">
              <GitBranch size={18} className="text-[#FAD23B]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">🔀 Dual-Silo Benefit Router</h2>
              <p className="text-xs text-[#69727D]">Pharmacy Benefit (NCPDP SCRIPT) vs Medical Benefit (FHIR ePA / 278 EDI)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[#69727D]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drug Input Section */}
          <div className="rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill size={16} className="text-[#1E5CD4]" />
              <span className="text-sm font-semibold text-[#0D0F67]">Drug Analysis</span>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-[#F7F8FA] mb-3">
              <p className="text-xs text-[#111827] font-mono">{drugName}</p>
            </div>

            {!detectedRoute && !isRouting && (
              <button
                onClick={handleRoute}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                           bg-gradient-to-r from-[#1E5CD4] to-[#0D0F67] text-white
                           text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-md"
              >
                <Zap size={14} />
                🔀 Auto-Detect Benefit Route
              </button>
            )}

            {isRouting && (
              <div className="flex flex-col items-center py-4 gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <GitBranch size={24} className="text-[#1E5CD4]" />
                </motion.div>
                <p className="text-xs text-[#69727D]">Analyzing drug benefit routing...</p>
              </div>
            )}
          </div>

          {/* Detected Route */}
          <AnimatePresence>
            {detectedRoute && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 border-[#00E676]/30 bg-[#00E676]/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-[#00E676]" />
                  <span className="text-sm font-bold text-[#0D0F67]">Route Detected</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {/* Pharmacy Pill */}
                  <div className={`flex-1 rounded-lg p-3 text-center border-2 transition-all ${
                    detectedRoute === 'Pharmacy'
                      ? 'border-[#00E676] bg-[#00E676]/10'
                      : 'border-[#E5E7EB] bg-[#F7F8FA]'
                  }`}>
                    <Pill size={20} className={`mx-auto mb-1 ${detectedRoute === 'Pharmacy' ? 'text-[#00E676]' : 'text-[#69727D]/40'}`} />
                    <p className={`text-[10px] font-bold ${detectedRoute === 'Pharmacy' ? 'text-[#00E676]' : 'text-[#69727D]'}`}>
                      Pharmacy Benefit
                    </p>
                    <p className="text-[8px] text-[#69727D]">NCPDP SCRIPT</p>
                  </div>

                  <ArrowRight size={16} className="text-[#69727D] flex-shrink-0" />

                  {/* Medical */}
                  <div className={`flex-1 rounded-lg p-3 text-center border-2 transition-all ${
                    detectedRoute === 'Medical'
                      ? 'border-[#00E676] bg-[#00E676]/10'
                      : 'border-[#E5E7EB] bg-[#F7F8FA]'
                  }`}>
                    <Stethoscope size={20} className={`mx-auto mb-1 ${detectedRoute === 'Medical' ? 'text-[#00E676]' : 'text-[#69727D]/40'}`} />
                    <p className={`text-[10px] font-bold ${detectedRoute === 'Medical' ? 'text-[#00E676]' : 'text-[#69727D]'}`}>
                      Medical Benefit
                    </p>
                    <p className="text-[8px] text-[#69727D]">FHIR ePA / 278 EDI</p>
                  </div>
                </div>

                <div className="rounded-lg bg-white border border-[#E5E7EB] p-3">
                  <p className="text-[10px] text-[#111827] leading-relaxed">
                    <strong>Routing Decision:</strong> {drugName} is typically covered under{' '}
                    <span className="text-[#00E676] font-bold">{detectedRoute} Benefit</span> via{' '}
                    {detectedRoute === 'Pharmacy' ? 'NCPDP SCRIPT standard' : 'FHIR ePA / 278 EDI transaction'}.
                    {detectedRoute === 'Pharmacy'
                      ? ' Submit through pharmacy benefit manager (PBM) portal or CoverMyMeds.'
                      : ' Submit through provider portal as medical claim prior auth.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No-PA Alternatives */}
          <AnimatePresence>
            {showAlternatives && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#0D0F67] flex items-center gap-1.5">
                    <span className="text-[#00E676]">✅</span> No-PA Alternative Finder
                  </h3>
                  <p className="text-[10px] text-[#69727D]">
                    Equal therapeutic drugs on formulary requiring zero prior authorization
                  </p>
                </div>

                {/* Pharmacy Alternatives */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-[#1E5CD4] uppercase tracking-wider">
                    Pharmacy Benefit — No PA Required
                  </p>
                  {pharmacyAlternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#00E676]/25 bg-[#00E676]/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#00E676]" />
                          <span className="text-[11px] font-bold text-[#111827]">{alt.name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#00E676] bg-[#00E676]/15 px-2 py-0.5 rounded-full">
                          NO PA
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-[#69727D]">
                        <span>Copay: {alt.copayEstimate}</span>
                        <span>•</span>
                        <span>{alt.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Medical Alternatives */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-[#0D0F67] uppercase tracking-wider">
                    Medical Benefit — No PA Required
                  </p>
                  {medicalAlternatives.map((alt, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#00E676]/25 bg-[#00E676]/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#00E676]" />
                          <span className="text-[11px] font-bold text-[#111827]">{alt.name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#00E676] bg-[#00E676]/15 px-2 py-0.5 rounded-full">
                          NO PA
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-[#69727D]">
                        <span>Cost: {alt.copayEstimate}</span>
                        <span>•</span>
                        <span>{alt.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real-Time Benefit Check */}
                <div className="rounded-xl border border-[#FAD23B]/30 bg-[#FAD23B]/5 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap size={12} className="text-[#FAD23B]" />
                    <span className="text-[10px] font-bold text-[#0D0F67]">Real-Time Benefit Check (RTBC)</span>
                  </div>
                  <p className="text-[10px] text-[#111827]">
                    <span className="font-semibold">Amjevita:</span> Covered ✅ |
                    <span className="font-semibold ml-1">Cyltezo:</span> Covered ✅ |
                    <span className="font-semibold ml-1">Hyrimoz:</span> Covered ✅
                  </p>
                  <p className="text-[9px] text-[#69727D] mt-1">
                    All alternatives are on formulary with $0–$10 copay and zero prior auth required.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {detectedRoute && (
            <button
              onClick={reset}
              className="w-full text-center text-xs text-[#69727D] hover:text-[#111827] transition-colors py-1"
            >
              Analyze Another Drug
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
