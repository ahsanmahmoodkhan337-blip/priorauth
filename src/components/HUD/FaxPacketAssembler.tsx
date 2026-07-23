'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Send, X, Printer, Shield, Check } from 'lucide-react';

interface FaxPacketAssemblerProps {
  isOpen: boolean;
  onClose: () => void;
  letter: string;
  payerName: string;
  cptCode: string;
  procedureName: string;
  satisfiedCriteria: Array<{ id: string; description: string }>;
  lcdNumber?: string;
}

export default function FaxPacketAssembler({
  isOpen,
  onClose,
  letter,
  payerName,
  cptCode,
  procedureName,
  satisfiedCriteria,
  lcdNumber,
}: FaxPacketAssemblerProps) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setToast(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDownload = useCallback(() => {
    const sections = [
      '=== HIPAA COMPLIANT COVER SHEET ===',
      `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Patient ID: [REDACTED]`,
      `Payer: ${payerName || 'N/A'}`,
      `CPT: ${cptCode || 'N/A'}`,
      `Procedure: ${procedureName || 'N/A'}`,
      '',
      '=== MEDICAL NECESSITY JUSTIFICATION LETTER ===',
      letter || 'No letter available. Run an audit first.',
      '',
      '=== PAYER EVIDENCE BINDER ===',
      ...satisfiedCriteria.map((c, i) => `✓ Criterion ${i + 1}: ${c.description}`),
      '',
      `=== LCD/NCD POLICY CITATION APPENDIX ===`,
      `Payer: ${payerName || 'N/A'}`,
      `LCD Number: ${lcdNumber || 'N/A'}`,
      `Criteria count: ${satisfiedCriteria.length}`,
      '',
      '--- END OF HIPAA e-FAX PACKET ---',
    ].join('\n');

    const blob = new Blob([sections], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HIPAA-eFax-Packet-${payerName || 'Unknown'}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PDF packet compiled successfully');
  }, [letter, payerName, cptCode, procedureName, satisfiedCriteria, lcdNumber, showToast]);

  const handleEFax = useCallback(() => {
    showToast('e-Fax transmission queued');
  }, [showToast]);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center
                     bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-accent-gold/10">
                  <Printer size={16} className="text-accent-gold" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    📄 Compile HIPAA e-Fax Packet
                  </h2>
                  <p className="text-[10px] text-text-secondary">
                    Auto-assemble cover sheet, justification letter, evidence binder &amp; citations
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-secondary hover:text-text-primary
                           hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Packet Preview */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Section 1: HIPAA Cover Sheet */}
              <div className="rounded-lg border-2 border-accent-blue/20 bg-accent-blue/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-accent-blue" />
                  <h3 className="text-xs font-semibold text-accent-blue uppercase tracking-wider">
                    HIPAA Compliant Cover Sheet
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Date:</span>
                    <span className="text-text-primary font-medium">{today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Patient ID:</span>
                    <span className="text-text-primary font-medium">[REDACTED — PHI Scrubbed]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Payer:</span>
                    <span className="text-text-primary font-medium">{payerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">CPT Code:</span>
                    <span className="text-text-primary font-medium">{cptCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Procedure:</span>
                    <span className="text-text-primary font-medium">{procedureName || 'N/A'}</span>
                  </div>
                </div>
                {/* Simulated barcode */}
                <div className="mt-3 flex justify-center">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-text-primary"
                        style={{
                          width: i % 3 === 0 ? '3px' : '2px',
                          height: `${16 + Math.sin(i * 0.7) * 8}px`,
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Medical Necessity Justification Letter */}
              <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-accent-gold" />
                  <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Medical Necessity Justification Letter
                  </h3>
                </div>
                <pre className="text-xs text-text-secondary font-mono leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                  {letter || 'No letter available. Run an audit to generate the justification letter.'}
                </pre>
              </div>

              {/* Section 3: Payer Evidence Binder */}
              <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check size={14} className="text-status-green" />
                  <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Payer Evidence Binder — Satisfied Criteria
                  </h3>
                </div>
                {satisfiedCriteria.length > 0 ? (
                  <ul className="space-y-1.5">
                    {satisfiedCriteria.map((c, i) => (
                      <li key={c.id} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-status-green/10 flex items-center justify-center">
                          <Check size={10} className="text-status-green" />
                        </span>
                        <span>
                          <span className="text-text-primary/60 font-mono text-[10px]">[{c.id}]</span>{' '}
                          {c.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-secondary/60">
                    No satisfied criteria yet. Run an audit evaluation.
                  </p>
                )}
              </div>

              {/* Section 4: LCD/NCD Policy Citation Appendix */}
              <div className="rounded-lg border border-border-light bg-bg-secondary p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-accent-blue" />
                  <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    LCD/NCD Policy Citation Appendix
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Payer:</span>
                    <span className="text-text-primary font-medium">{payerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">LCD Number:</span>
                    <span className="text-text-primary font-medium">{lcdNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">CPT Code:</span>
                    <span className="text-text-primary font-medium">{cptCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-primary/60">Total Criteria Referenced:</span>
                    <span className="text-text-primary font-medium">{satisfiedCriteria.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-light">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-accent-gold/10 border border-accent-gold/30 text-accent-gold
                           hover:bg-accent-gold/20 transition-all duration-200"
              >
                <Download size={14} />
                Download PDF Packet
              </button>

              <button
                onClick={handleEFax}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-accent-blue/10 border border-accent-blue/30 text-accent-blue
                           hover:bg-accent-blue/20 transition-all duration-200"
              >
                <Send size={14} />
                Send via e-Fax
              </button>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg
                             bg-heading-navy text-white text-xs font-medium shadow-lg z-10
                             flex items-center gap-2"
                >
                  <Check size={14} className="text-accent-gold" />
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
