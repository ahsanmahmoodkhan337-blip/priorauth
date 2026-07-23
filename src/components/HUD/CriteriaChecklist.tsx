'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface SatisfiedCriterion {
  id: string;
  description: string;
  chartCitation: string;
}

interface MissingCriterion {
  id: string;
  description: string;
  issue: string;
  recommendedAction: string;
}

interface CriteriaChecklistProps {
  satisfiedCriteria: SatisfiedCriterion[];
  missingCriteria: MissingCriterion[];
}

function SectionHeader({
  title,
  isOpen,
  onToggle,
  icon,
  count,
  colorClass,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  count: number;
  colorClass: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3
                 hover:bg-gray-50 transition-colors duration-150"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {count}
        </span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight size={16} className="text-text-secondary" />
      </motion.div>
    </button>
  );
}

export default function CriteriaChecklist({
  satisfiedCriteria,
  missingCriteria,
}: CriteriaChecklistProps) {
  const [satisfiedOpen, setSatisfiedOpen] = useState(true);
  const [missingOpen, setMissingOpen] = useState(true);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-sm font-semibold text-text-primary">Criteria Checklist</h3>
        <p className="text-[10px] text-text-secondary mt-0.5">
          Payer policy requirements vs. clinical documentation
        </p>
      </div>

      {/* Satisfied Criteria Section */}
      <div className="border-b border-border-light">
        <SectionHeader
          title="Satisfied Criteria"
          isOpen={satisfiedOpen}
          onToggle={() => setSatisfiedOpen(!satisfiedOpen)}
          icon={<CheckCircle2 size={16} className="text-status-green" />}
          count={satisfiedCriteria.length}
          colorClass="bg-status-green/10 text-status-green"
        />

        <AnimatePresence initial={false}>
          {satisfiedOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-2">
                {satisfiedCriteria.length === 0 ? (
                  <p className="text-xs text-text-secondary/60 py-3 text-center italic">
                    No criteria satisfied yet
                  </p>
                ) : (
                  satisfiedCriteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="p-3 rounded-lg bg-status-green/[0.04] border border-status-green/10"
                    >
                      <p className="text-sm text-text-primary">{criterion.description}</p>
                      <p className="text-xs text-text-secondary/60 mt-1 italic">
                        {criterion.chartCitation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Missing Criteria Section */}
      <div>
        <SectionHeader
          title="Missing Criteria"
          isOpen={missingOpen}
          onToggle={() => setMissingOpen(!missingOpen)}
          icon={<XCircle size={16} className="text-status-red" />}
          count={missingCriteria.length}
          colorClass="bg-status-red/10 text-status-red"
        />

        <AnimatePresence initial={false}>
          {missingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-2">
                {missingCriteria.length === 0 ? (
                  <p className="text-xs text-text-secondary/60 py-3 text-center italic">
                    All criteria satisfied
                  </p>
                ) : (
                  missingCriteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="p-3 rounded-lg bg-status-red/[0.04] border border-status-red/10"
                    >
                      <p className="text-sm text-text-primary">{criterion.description}</p>
                      <p className="text-xs text-status-red/80 mt-1 font-medium">
                        Issue: {criterion.issue}
                      </p>
                      <p className="text-xs text-accent-gold mt-1 font-medium">
                        {criterion.recommendedAction}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
