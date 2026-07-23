'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, Hash, Building2 } from 'lucide-react';

interface PolicyCriterion {
  id: string;
  description: string;
}

interface Policy {
  payerName: string;
  cptCode: string;
  lcdNumber: string;
  versionDate: string;
  criteria: PolicyCriterion[];
}

interface PolicyCitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

export default function PolicyCitationDrawer({
  isOpen,
  onClose,
  policy,
}: PolicyCitationDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[80] h-full w-full max-w-lg
                       bg-white border-l border-border-light shadow-2xl
                       flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-accent-blue/10">
                  <FileText size={16} className="text-accent-blue" />
                </div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Active LCD/NCD Policy
                </h2>
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
            <div className="flex-1 overflow-y-auto p-5">
              {policy ? (
                <div className="space-y-6">
                  {/* Policy Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary border border-border-light">
                      <Building2 size={16} className="text-accent-gold flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider">Payer</p>
                        <p className="text-sm font-medium text-text-primary">{policy.payerName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary border border-border-light">
                        <Hash size={14} className="text-accent-blue flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase tracking-wider">CPT Code</p>
                          <p className="text-sm font-medium text-text-primary">{policy.cptCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary border border-border-light">
                        <Calendar size={14} className="text-accent-blue flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase tracking-wider">Effective</p>
                          <p className="text-sm font-medium text-text-primary">{policy.versionDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-bg-secondary border border-border-light">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-0.5">
                        LCD/NCD Number
                      </p>
                      <p className="text-sm font-mono text-accent-blue">{policy.lcdNumber}</p>
                    </div>
                  </div>

                  {/* Criteria List */}
                  <div>
                    <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                      Required Criteria ({policy.criteria.length})
                    </h3>
                    <div className="space-y-2">
                      {policy.criteria.map((criterion, index) => (
                        <div
                          key={criterion.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary border border-border-light"
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-blue/10
                                           text-accent-blue text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <p className="text-sm text-text-primary leading-relaxed">
                            {criterion.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText size={40} className="text-text-secondary/20 mb-4" />
                  <p className="text-sm text-text-secondary/60">
                    No policy data loaded. Select a sample case to view the active LCD/NCD policy.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border-light">
              <p className="text-[10px] text-text-secondary/50 text-center">
                Policy data is for demonstration purposes only. Verify against current payer guidelines.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
