'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Copy, Smartphone, Mail, X, Check, Edit3 } from 'lucide-react';

interface PatientNotifierProps {
  isOpen: boolean;
  onClose: () => void;
  payerName: string;
  procedureName: string;
}

function generateMessage(patientName: string, procedure: string, payer: string): string {
  return (
    `Hi ${patientName}, your doctor ordered a ${procedure || 'procedure'}. ` +
    `We are currently working with ${payer || 'your insurance'} to get insurance approval. ` +
    `No action is needed from you right now. We will update you within 48 hours!`
  );
}

export default function PatientNotifier({
  isOpen,
  onClose,
  payerName,
  procedureName,
}: PatientNotifierProps) {
  const [patientName, setPatientName] = useState('Patient');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Generate the default message whenever inputs change
  const defaultMessage = useMemo(
    () => generateMessage(patientName, procedureName, payerName),
    [patientName, procedureName, payerName]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setMessage(defaultMessage);
    } else {
      document.body.style.overflow = '';
      setToast(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultMessage]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      showToast('Copied to clipboard!');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!');
    }
  }, [message, showToast]);

  const handleSMS = useCallback(() => {
    showToast('SMS queued for delivery');
  }, [showToast]);

  const handleEmail = useCallback(() => {
    showToast('Email queued for delivery');
  }, [showToast]);

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
            className="glass-card w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-accent-blue/10">
                  <MessageCircle size={16} className="text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    📱 Draft Patient Status Message
                  </h2>
                  <p className="text-[10px] text-text-secondary">
                    Convert prior auth jargon into plain-English updates
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Patient Name Input */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-light
                             bg-bg-secondary text-sm text-text-primary
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/30
                             placeholder:text-text-secondary/40"
                  placeholder="Enter patient name"
                />
              </div>

              {/* Auto-filled Info */}
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-accent-gold/5 border border-accent-gold/10 text-xs text-text-secondary">
                  <span className="text-text-primary/50">Payer: </span>
                  <span className="text-text-primary font-medium">{payerName || 'N/A'}</span>
                </div>
                <div className="flex-1 px-3 py-2 rounded-lg bg-accent-blue/5 border border-accent-blue/10 text-xs text-text-secondary">
                  <span className="text-text-primary/50">Procedure: </span>
                  <span className="text-text-primary font-medium">{procedureName || 'N/A'}</span>
                </div>
              </div>

              {/* Editable Message */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Edit3 size={12} className="text-text-secondary" />
                  <label className="text-xs font-medium text-text-primary">
                    Message Preview (editable)
                  </label>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-3 rounded-lg border border-border-light
                             bg-bg-secondary text-sm text-text-primary leading-relaxed
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/30
                             resize-none placeholder:text-text-secondary/40"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-light flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-accent-blue/10 border border-accent-blue/30 text-accent-blue
                           hover:bg-accent-blue/20 transition-all duration-200"
              >
                <Copy size={14} />
                📋 Copy to Clipboard
              </button>

              <button
                onClick={handleSMS}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-accent-gold/10 border border-accent-gold/30 text-accent-gold
                           hover:bg-accent-gold/20 transition-all duration-200"
              >
                <Smartphone size={14} />
                📱 Send via SMS
              </button>

              <button
                onClick={handleEmail}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                           bg-heading-navy/5 border border-heading-navy/20 text-heading-navy
                           hover:bg-heading-navy/10 transition-all duration-200"
              >
                <Mail size={14} />
                ✉️ Send via Email
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
