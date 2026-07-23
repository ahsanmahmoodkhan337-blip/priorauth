'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';

interface ChartEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ChartEditor({ value, onChange }: ChartEditorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePHIToggle = useCallback(() => {
    setShowTooltip((prev) => !prev);
  }, []);

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-text-primary">Clinical Chart Note</h3>
        </div>

        {/* PHI Scrubbing Badge */}
        <div className="relative">
          <button
            onClick={handlePHIToggle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                       bg-status-green/10 border border-status-green/20
                       hover:bg-status-green/15 transition-colors duration-200"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ShieldCheck size={14} className="text-status-green" />
            </motion.div>
            <span className="text-[10px] font-medium text-status-green">PHI Protected</span>
          </button>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg
                           bg-white border border-border-light shadow-xl z-50"
              >
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-accent-blue flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    All PHI is anonymized client-side before transmission. No protected health
                    information leaves your browser.
                  </p>
                </div>
                {/* Arrow */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-white border-l border-t border-border-light" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter or paste clinical chart notes here..."
          className="w-full h-full min-h-[280px] bg-bg-secondary border border-border-light
                     rounded-lg p-4 text-sm text-text-primary placeholder-text-secondary/40
                     resize-y focus:outline-none focus:border-accent-blue/40
                     focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200
                     font-mono leading-relaxed"
          style={{
            fontFamily:
              "'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'Menlo', monospace",
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
