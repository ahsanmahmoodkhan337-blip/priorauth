'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, Database, Search, Wifi, X } from 'lucide-react';

interface SyncStep {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const syncSteps: SyncStep[] = [
  { id: 1, label: 'Connecting to guideline database...', icon: <Wifi size={18} /> },
  { id: 2, label: 'Scanning LCD/NCD policy updates...', icon: <Search size={18} /> },
  { id: 3, label: 'Re-indexing coverage criteria...', icon: <Database size={18} /> },
  { id: 4, label: 'Sync complete — guidelines up to date', icon: <CheckCircle size={18} /> },
];

export default function GuidelineSyncBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleSync = useCallback(() => {
    if (isRunning) return;
    setIsOpen(true);
    setIsRunning(true);
    setCurrentStep(0);

    // Simulate the 4-step animation
    const stepDuration = 800;
    syncSteps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
        if (index === syncSteps.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
          }, 1200);
        }
      }, (index + 1) * stepDuration);
    });
  }, [isRunning]);

  const handleClose = useCallback(() => {
    if (!isRunning) {
      setIsOpen(false);
      setCurrentStep(0);
    }
  }, [isRunning]);

  return (
    <>
      {/* Sync Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 border-b border-border-light backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            {/* Status indicator */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-50" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-blue" />
              </span>
              <span className="text-xs text-text-secondary font-medium">
                Live Guidelines: <span className="text-accent-blue">Up to Date (2026 Standards)</span>
              </span>
            </div>

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-accent-blue/40 
                         text-accent-blue text-xs font-medium hover:bg-accent-blue/10 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={13}
                className={isRunning ? 'animate-spin' : ''}
              />
              <span>Sync &amp; Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md mx-4 p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-accent-blue uppercase tracking-wider">
                  Guideline Sync
                </h3>
                <button
                  onClick={handleClose}
                  disabled={isRunning}
                  className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Terminal-style steps */}
              <div className="space-y-3 font-mono text-xs">
                {syncSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: currentStep >= index + 1 ? 1 : 0.3,
                      x: currentStep >= index + 1 ? 0 : -5,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors duration-300 ${
                      currentStep >= index + 1
                        ? 'border-accent-blue/30 bg-accent-blue/5'
                        : 'border-transparent bg-bg-secondary'
                    }`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        currentStep >= index + 1
                          ? 'text-accent-blue'
                          : 'text-text-secondary/40'
                      }`}
                    >
                      {step.icon}
                    </span>
                    <span
                      className={`transition-colors duration-300 ${
                        currentStep >= index + 1
                          ? 'text-text-primary'
                          : 'text-text-secondary/40'
                      }`}
                    >
                      {step.label}
                    </span>
                    {currentStep >= index + 1 && index < syncSteps.length - 1 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-auto text-status-green"
                      >
                        <CheckCircle size={14} />
                      </motion.span>
                    )}
                    {currentStep >= index + 1 && index === syncSteps.length - 1 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto text-status-green font-bold text-[10px] uppercase tracking-wider"
                      >
                        DONE
                      </motion.span>
                    )}
                    {currentStep === index && (
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="ml-auto text-accent-blue text-[10px]"
                      >
                        ▸
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-border-light flex justify-between items-center">
                <span className="text-[10px] text-text-secondary/60 font-mono">
                  {isRunning ? 'syncing...' : 'ready_'}
                </span>
                {!isRunning && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleClose}
                    className="px-4 py-1.5 rounded-md bg-accent-blue/10 border border-accent-blue/30 
                               text-accent-blue text-xs font-medium hover:bg-accent-blue/20 transition-colors"
                  >
                    Close
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
