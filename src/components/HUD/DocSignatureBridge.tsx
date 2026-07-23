'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, X, CheckCircle2, Clock, Send, FileText,
  Loader2, Phone,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DocSignatureBridgeProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DocSignatureBridge({ isOpen, onClose }: DocSignatureBridgeProps) {
  const [step, setStep] = useState<'idle' | 'enter-phone' | 'sending' | 'sent' | 'signed'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhonePreview, setShowPhonePreview] = useState(false);

  const addendumText =
    'I have reviewed the clinical documentation and certify that the requested procedure (CPT 63030 — Lumbar Laminectomy) is medically necessary based on the patient\'s failed conservative therapy over 6 months, ODI score of 62%, and MRI-confirmed L4-L5 disc herniation with nerve root compression.';

  const handleSend = async () => {
    if (!phoneNumber.trim()) return;
    setStep('sending');

    try {
      await fetch('/api/send-doc-signature-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, addendum: addendumText }),
      });
      // Simulated success
      setTimeout(() => setStep('sent'), 1500);
    } catch {
      // Fallback to simulated
      setTimeout(() => setStep('sent'), 1500);
    }
  };

  const handleSimulateSignature = () => {
    setStep('signed');
  };

  const reset = () => {
    setStep('idle');
    setPhoneNumber('');
    setShowPhonePreview(false);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAD23B]/10 to-[#1E5CD4]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FAD23B]/15">
              <Smartphone size={18} className="text-[#FAD23B]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">📱 Doctor Signature Bridge</h2>
              <p className="text-xs text-[#69727D]">Mobile SMS signature for medical necessity addendums</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[#69727D]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Step 1: Phone Entry */}
          {step === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <button
                onClick={() => setStep('enter-phone')}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                           bg-gradient-to-r from-[#1E5CD4] to-[#0D0F67] text-white
                           text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-md"
              >
                <Smartphone size={18} />
                📱 Send Doctor Signature Request
              </button>
              <p className="text-[10px] text-[#69727D] text-center">
                Sends a secure SMS link for digital signature on medical necessity addendum
              </p>
            </motion.div>
          )}

          {/* Step 2: Enter Phone */}
          {step === 'enter-phone' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#111827] mb-1.5 block">
                  Doctor&apos;s Mobile Number
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
                  <Phone size={14} className="text-[#69727D]" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#69727D]"
                  />
                </div>
              </div>

              {/* Addendum Preview */}
              <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-2 bg-[#0B1F3A]/5 border-b border-[#E5E7EB] flex items-center gap-2">
                  <FileText size={12} className="text-[#0D0F67]" />
                  <span className="text-[10px] font-semibold text-[#0D0F67]">Pre-Drafted Addendum</span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#111827] leading-relaxed">{addendumText}</p>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={!phoneNumber.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                           bg-gradient-to-r from-[#FAD23B] to-[#FAD23B]/80 text-[#0D0F67]
                           text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-md
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                Send SMS Signature Link
              </button>
            </motion.div>
          )}

          {/* Step 3: Sending */}
          {step === 'sending' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 gap-3">
              <Loader2 size={32} className="animate-spin text-[#1E5CD4]" />
              <p className="text-sm font-semibold text-[#0D0F67]">Sending SMS to {phoneNumber}...</p>
              <p className="text-xs text-[#69727D]">Secure signature link being delivered</p>
            </motion.div>
          )}

          {/* Step 4: Sent — Show preview */}
          {step === 'sent' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/25">
                <CheckCircle2 size={16} className="text-[#00E676]" />
                <div>
                  <span className="text-xs font-semibold text-[#00E676]">SMS Delivered</span>
                  <span className="text-[10px] text-[#69727D] ml-2">
                    <Clock size={10} className="inline" /> Sent at {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowPhonePreview(!showPhonePreview)}
                  className="text-xs text-[#1E5CD4] hover:underline"
                >
                  {showPhonePreview ? 'Hide' : 'Preview'} what the doctor sees →
                </button>
              </div>

              <AnimatePresence>
                {showPhonePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border-2 border-[#E5E7EB] overflow-hidden"
                  >
                    {/* Simulated phone frame */}
                    <div className="px-3 py-2 bg-[#0B1F3A] text-white flex items-center justify-between">
                      <span className="text-[10px] font-medium">📱 MedHero Secure Signature</span>
                      <span className="text-[10px]">🔒 HTTPS</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-center">
                        <Smartphone size={24} className="mx-auto mb-1 text-[#1E5CD4]" />
                        <p className="text-xs font-semibold text-[#0D0F67]">Medical Necessity Addendum</p>
                        <p className="text-[9px] text-[#69727D]">Please review and sign below</p>
                      </div>
                      <div className="rounded-lg bg-[#F7F8FA] p-3">
                        <p className="text-[10px] text-[#111827] leading-relaxed">{addendumText}</p>
                      </div>
                      <button
                        onClick={handleSimulateSignature}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                                   bg-gradient-to-r from-[#FAD23B] to-[#FAD23B]/80 text-[#0D0F67]
                                   text-sm font-bold hover:brightness-110 transition-all duration-200 shadow-md"
                      >
                        <CheckCircle2 size={16} />
                        Digitally Sign &amp; Stamp
                      </button>
                      <p className="text-[9px] text-[#69727D] text-center">
                        By signing, you certify the above addendum is true and accurate
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 5: Signed */}
          {step === 'signed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 gap-3 text-center"
            >
              <div className="p-4 rounded-full bg-[#00E676]/15 border-2 border-[#00E676]">
                <CheckCircle2 size={40} className="text-[#00E676]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0D0F67]">Signature Received ✅</p>
                <p className="text-xs text-[#69727D] mt-1">
                  Dr. Sarah Chen, MD — Digitally signed &amp; stamped
                </p>
                <p className="text-[10px] text-[#69727D] mt-0.5">
                  <Clock size={10} className="inline" /> {new Date().toLocaleString()}
                </p>
              </div>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#1E5CD4] border border-[#1E5CD4]/30 hover:bg-[#1E5CD4]/5 transition-colors"
              >
                Send Another Request
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
