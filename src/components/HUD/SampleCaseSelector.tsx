'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, ChevronDown } from 'lucide-react';

interface SampleCase {
  id: string;
  label: string;
  riskLevel: 'high-denial' | 'moderate' | 'high-approval';
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'lumbar-mri',
    label: 'Case 1: Lumbar Spine MRI (CPT 72148) — Aetna',
    riskLevel: 'high-denial',
  },
  {
    id: 'knee-arthroplasty',
    label: 'Case 2: Total Knee Arthroplasty (CPT 27447) — BCBS',
    riskLevel: 'moderate',
  },
  {
    id: 'cardiac-echo',
    label: 'Case 3: Cardiac Echocardiogram (CPT 93306) — Medicare MAC',
    riskLevel: 'high-approval',
  },
];

const RISK_CONFIG: Record<
  SampleCase['riskLevel'],
  { label: string; bg: string; text: string; dot: string }
> = {
  'high-denial': {
    label: 'High Denial',
    bg: 'bg-status-red/10',
    text: 'text-status-red',
    dot: 'bg-status-red',
  },
  moderate: {
    label: 'Moderate',
    bg: 'bg-status-orange/10',
    text: 'text-status-orange',
    dot: 'bg-status-orange',
  },
  'high-approval': {
    label: 'High Approval',
    bg: 'bg-status-green/10',
    text: 'text-status-green',
    dot: 'bg-status-green',
  },
};

interface SampleCaseSelectorProps {
  onSelectCase: (caseId: string) => void;
}

export default function SampleCaseSelector({ onSelectCase }: SampleCaseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SampleCase | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(c: SampleCase) {
    setSelectedCase(c);
    setIsOpen(false);
    onSelectCase(c.id);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card px-4 py-3 flex items-center gap-3 text-left
                   hover:border-accent-cyan/30 transition-all duration-200 group"
      >
        <div className="p-1.5 rounded-md bg-accent-cyan/10 flex-shrink-0">
          <Stethoscope size={16} className="text-accent-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          {selectedCase ? (
            <>
              <p className="text-sm font-medium text-text-primary truncate">
                {selectedCase.label}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${RISK_CONFIG[selectedCase.riskLevel].bg} ${RISK_CONFIG[selectedCase.riskLevel].text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG[selectedCase.riskLevel].dot}`} />
                {RISK_CONFIG[selectedCase.riskLevel].label}
              </span>
            </>
          ) : (
            <p className="text-sm text-text-secondary">Select a pre-loaded sample case...</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={16} className="text-text-secondary group-hover:text-accent-cyan transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-50 top-full left-0 right-0 mt-2 glass-card overflow-hidden origin-top"
          >
            {SAMPLE_CASES.map((c) => {
              const risk = RISK_CONFIG[c.riskLevel];
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left
                              hover:bg-accent-cyan/5 transition-colors duration-150
                              border-b border-accent-cyan/5 last:border-b-0
                              ${selectedCase?.id === c.id ? 'bg-accent-cyan/5' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{c.label}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${risk.bg} ${risk.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                    {risk.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
