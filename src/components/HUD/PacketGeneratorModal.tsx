'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Download, X, Check } from 'lucide-react';

interface PacketGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: string;
}

export default function PacketGeneratorModal({
  isOpen,
  onClose,
  letter,
}: PacketGeneratorModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = letter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [letter]);

  const handleDownload = useCallback(() => {
    // Simulated PDF download — creates a text file for now
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prior-auth-justification-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [letter]);

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
                  <FileText size={16} className="text-accent-gold" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Prior Authorization Justification Packet
                  </h2>
                  <p className="text-[10px] text-text-secondary">
                    AI-generated appeal letter based on clinical documentation
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

            {/* Letter Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-lg bg-bg-secondary border border-border-light p-5">
                <pre className="text-sm text-text-primary font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {letter || 'No letter content generated yet. Run an evaluation to generate the justification letter.'}
                </pre>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-light">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           transition-all duration-200
                           ${copied
                             ? 'bg-status-green/10 border border-status-green/30 text-status-green'
                             : 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20'
                           }`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy to Clipboard
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-accent-gold/10 border border-accent-gold/30 text-accent-gold
                           hover:bg-accent-gold/20 transition-all duration-200"
              >
                <Download size={14} />
                Download as PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
