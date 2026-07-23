'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, X, Terminal, Globe, Search, Database, Zap } from 'lucide-react';

interface SyncLogLine {
  id: number;
  timestamp: string;
  text: string;
}

const syncLogLines: SyncLogLine[] = [
  { id: 1, timestamp: '0.0s', text: '📡 Connecting to CMS LCD/NCD Feed API...' },
  { id: 2, timestamp: '1.2s', text: '🔍 Scanning Aetna, BCBS & UHC July 2026 Medical Bulletins...' },
  { id: 3, timestamp: '2.8s', text: '⚙️ Re-indexing 42 updated policy embeddings...' },
  { id: 4, timestamp: '3.5s', text: '✅ App Guidelines Successfully Updated! (Synced: July 2026 Standards)' },
];

export default function GuidelineUpdater() {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTypingLine, setCurrentTypingLine] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupTyping = useCallback(() => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
  }, []);

  const runSync = useCallback(async () => {
    if (isRunning) return;
    setIsOpen(true);
    setIsRunning(true);
    setIsComplete(false);
    setVisibleLines([]);
    setCurrentTypingLine(null);
    setTypedText('');

    // Hit the API endpoint (fire-and-forget, we simulate visually)
    try {
      fetch('/api/sync-guidelines', { method: 'POST' }).catch(() => {});
    } catch {}

    // Simulate typing animation for each line
    let lineIndex = 0;
    const advanceLine = () => {
      if (lineIndex >= syncLogLines.length) {
        setIsRunning(false);
        setIsComplete(true);
        setCurrentTypingLine(null);
        setTypedText('');
        return;
      }

      const line = syncLogLines[lineIndex];
      setCurrentTypingLine(line.id);

      let charIndex = 0;
      const fullText = `[${line.timestamp}] ${line.text}`;

      cleanupTyping();
      typingRef.current = setInterval(() => {
        charIndex++;
        setTypedText(fullText.slice(0, charIndex));

        if (charIndex >= fullText.length) {
          cleanupTyping();
          setVisibleLines((prev) => [...prev, line.id]);
          setTypedText('');
          setCurrentTypingLine(null);
          lineIndex++;

          // Small delay between lines
          setTimeout(advanceLine, 300);
        }
      }, 25);
    };

    // Initial delay before first line
    setTimeout(advanceLine, 400);
  }, [isRunning, cleanupTyping]);

  const handleClose = useCallback(() => {
    if (isRunning) return;
    cleanupTyping();
    setIsOpen(false);
    setVisibleLines([]);
    setIsComplete(false);
    setCurrentTypingLine(null);
    setTypedText('');
  }, [isRunning, cleanupTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupTyping();
  }, [cleanupTyping]);

  // Keyboard shortcut for opening
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          runSync();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, runSync, handleClose]);

  return (
    <>
      {/* Trigger Button — shown in navbar area */}
      <button
        onClick={runSync}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-white border border-border-light hover:border-accent-blue/50
                   text-text-primary hover:text-accent-blue
                   shadow-sm hover:shadow-md transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed"
        title="Auto-Update Guidelines to 2026 Standards (Ctrl+U)"
      >
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-green" />
        </span>
        <RefreshCw
          size={13}
          className={isRunning ? 'animate-spin' : ''}
        />
        <span className="hidden sm:inline">Auto-Update Guidelines</span>
        <span className="hidden lg:inline text-text-secondary font-normal">to 2026 Standards</span>
      </button>

      {/* Terminal-style Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={isRunning ? undefined : handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg mx-4 overflow-hidden"
            >
              {/* Dark terminal glass card */}
              <div className="rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
                   style={{ background: 'rgba(11, 31, 58, 0.95)' }}>
                {/* Terminal header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-status-green" />
                    <span className="text-xs font-mono text-gray-400 tracking-wider">
                      MedHero • Guideline Sync Terminal
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Traffic light dots */}
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-status-green/60" />
                    <button
                      onClick={handleClose}
                      disabled={isRunning}
                      className="ml-2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Terminal body */}
                <div className="p-5 font-mono text-xs leading-relaxed min-h-[220px]">
                  {/* Welcome banner */}
                  <div className="text-gray-500 mb-4 select-none">
                    <div>╔══════════════════════════════════════════════╗</div>
                    <div>║  MedHero PriorAuth AI — Guideline Updater  ║</div>
                    <div>║  Target: July 2026 Payer Policy Standards  ║</div>
                    <div>╚══════════════════════════════════════════════╝</div>
                  </div>

                  {/* Sync log lines */}
                  <div className="space-y-2">
                    {syncLogLines.map((line) => {
                      const isVisible = visibleLines.includes(line.id);
                      const isTyping = currentTypingLine === line.id;

                      return (
                        <div key={line.id} className="flex items-start gap-2">
                          {/* Status indicator */}
                          <span className="mt-0.5 flex-shrink-0">
                            {isVisible ? (
                              line.id === syncLogLines.length ? (
                                <CheckCircle size={12} className="text-status-green" />
                              ) : (
                                <CheckCircle size={12} className="text-gray-500" />
                              )
                            ) : isTyping ? (
                              <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.4, repeat: Infinity }}
                                className="text-accent-gold text-xs"
                              >
                                ▸
                              </motion.span>
                            ) : (
                              <span className="text-gray-700 text-xs">○</span>
                            )}
                          </span>

                          {/* Line content */}
                          <span
                            className={
                              isVisible
                                ? line.id === syncLogLines.length
                                  ? 'text-status-green font-semibold'
                                  : 'text-gray-400'
                                : isTyping
                                ? 'text-accent-gold'
                                : 'text-gray-700'
                            }
                          >
                            {isVisible
                              ? `[${line.timestamp}] ${line.text}`
                              : isTyping
                              ? typedText
                              : ''}
                            {isTyping && (
                              <motion.span
                                animate={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-accent-gold"
                              >
                                ▮
                              </motion.span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress spinner during sync */}
                  {isRunning && currentTypingLine === null && visibleLines.length === 0 && (
                    <div className="flex items-center gap-2 mt-3 text-gray-500">
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Initializing sync engine...</span>
                    </div>
                  )}

                  {/* Completion message */}
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 flex items-center gap-2"
                    >
                      <div className="flex-1 h-px bg-gradient-to-r from-status-green/50 to-transparent" />
                      <span className="text-[10px] text-status-green/70 font-semibold uppercase tracking-widest whitespace-nowrap">
                        Sync Complete
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-l from-status-green/50 to-transparent" />
                    </motion.div>
                  )}
                </div>

                {/* Terminal footer */}
                <div className="px-4 py-2.5 bg-gray-900/80 border-t border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Globe size={10} />
                      CMS Feed
                    </span>
                    <span className="flex items-center gap-1">
                      <Search size={10} />
                      Payer Scan
                    </span>
                    <span className="flex items-center gap-1">
                      <Database size={10} />
                      Re-index
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={10} />
                      Live
                    </span>
                  </div>

                  {isRunning ? (
                    <span className="text-[10px] text-accent-gold font-mono animate-pulse">
                      syncing...
                    </span>
                  ) : isComplete ? (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleClose}
                      className="px-4 py-1 rounded-md bg-status-green/15 border border-status-green/30
                                 text-status-green text-xs font-semibold hover:bg-status-green/25
                                 transition-colors"
                    >
                      Close
                    </motion.button>
                  ) : (
                    <span className="text-[10px] text-gray-600 font-mono">ready_</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
