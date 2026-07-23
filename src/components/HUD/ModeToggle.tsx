'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Clock, FileSpreadsheet, Layers } from 'lucide-react';

interface ModeToggleProps {
  mode: 'student' | 'b2b';
  onToggle: () => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Toggle Pill */}
      <button
        onClick={onToggle}
        className="relative flex items-center rounded-lg border border-accent-cyan/30
                   bg-bg-primary/50 overflow-hidden"
      >
        {/* Sliding background */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-md bg-accent-cyan/15"
          initial={false}
          animate={{
            left: mode === 'student' ? '0.25rem' : '50%',
            right: mode === 'student' ? '50%' : '0.25rem',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />

        {/* Student Option */}
        <span
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      transition-colors duration-200 ${
                        mode === 'student'
                          ? 'text-accent-cyan'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
        >
          <GraduationCap size={14} />
          <span className="hidden sm:inline">Student</span>
        </span>

        {/* B2B Option */}
        <span
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      transition-colors duration-200 ${
                        mode === 'b2b'
                          ? 'text-accent-cyan'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
        >
          <Briefcase size={14} />
          <span className="hidden sm:inline">B2B</span>
        </span>
      </button>

      {/* Mode-specific extras */}
      {mode === 'student' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                     bg-accent-gold/5 border border-accent-gold/15"
        >
          <Clock size={12} className="text-accent-gold" />
          <span className="text-[10px] font-mono font-medium text-accent-gold">15:00</span>
        </motion.div>
      )}

      {mode === 'b2b' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="flex items-center gap-1"
        >
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                       bg-bg-primary/50 border border-text-secondary/15
                       text-text-secondary/40 text-[10px] font-medium
                       cursor-not-allowed"
            title="Bulk Audit — Coming Soon"
          >
            <Layers size={12} />
            <span className="hidden sm:inline">Bulk Audit</span>
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                       bg-bg-primary/50 border border-text-secondary/15
                       text-text-secondary/40 text-[10px] font-medium
                       cursor-not-allowed"
            title="CSV Export — Coming Soon"
          >
            <FileSpreadsheet size={12} />
            <span className="hidden sm:inline">CSV Export</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
