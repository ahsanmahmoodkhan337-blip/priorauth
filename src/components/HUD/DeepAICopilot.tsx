'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  User,
  ArrowUpRight,
  Zap,
  FileText,
  Gavel,
  ClipboardCheck,
  MessageSquare,
  Stethoscope,
  BookOpen,
} from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestionChip {
  id: string;
  icon: React.ReactNode;
  label: string;
  query: string;
}

const suggestionChips: SuggestionChip[] = [
  {
    id: 'bcbs-rules',
    icon: <ClipboardCheck size={14} />,
    label: 'Check BCBS conservative therapy rules',
    query: 'What are BCBS conservative therapy requirements for lumbar spine procedures?',
  },
  {
    id: 'fda-humira',
    icon: <Stethoscope size={14} />,
    label: 'Find FDA approval for Humira',
    query: 'Find FDA approval details and indications for Humira (adalimumab)',
  },
  {
    id: 'pubmed-72148',
    icon: <BookOpen size={14} />,
    label: 'Search PubMed for CPT 72148 evidence',
    query: 'Search PubMed for clinical evidence supporting CPT 72148 lumbar MRI',
  },
  {
    id: 'texas-law',
    icon: <Gavel size={14} />,
    label: 'Texas prompt-pay law statute',
    query: 'What is the Texas prompt-pay law statute and deadline for insurance claims?',
  },
  {
    id: 'insert-citation',
    icon: <FileText size={14} />,
    label: 'Insert citation into appeal letter',
    query: 'DeepAI, insert this into section 2 of the appeal letter',
  },
  {
    id: 'p2p-talking',
    icon: <MessageSquare size={14} />,
    label: 'Generate P2P talking points',
    query: 'Generate peer-to-peer talking points for CPT 72148 lumbar MRI denial appeal',
  },
];

// Simulated AI responses keyed by trigger words
const simulatedResponses: Record<string, string> = {
  bcbs:
    'Based on BCBS July 2026 medical policy for lumbar spine procedures (SUR724.016), conservative therapy requirements include:\n\n1. **6 weeks** of physician-directed conservative management\n2. Must include **NSAIDs + physical therapy** documented\n3. At least **2 modalities** attempted (PT, chiropractic, injections)\n4. Failure must be documented with outcome measures\n\n⚠️ Your chart shows 4 weeks of PT — consider documenting 2 more weeks before submission.',
  humira:
    '**FDA Approval: Humira (adalimumab)**\n\n• Originally approved: December 31, 2002\n• Indications: Rheumatoid arthritis, psoriatic arthritis, ankylosing spondylitis, Crohn\'s disease, ulcerative colitis, plaque psoriasis, hidradenitis suppurativa, uveitis, juvenile idiopathic arthritis\n\n• Latest expansion: February 2026 for moderate-to-severe hidradenitis suppurativa in adolescents (12-17 years)\n\n• Dosing: 80 mg initial, then 40 mg every other week starting 1 week after initial dose',
  pubmed:
    '**PubMed Search: CPT 72148 (Lumbar MRI) Evidence**\n\nTop 3 recent results:\n\n1. *JAMA* (2026) — "Clinical Utility of Lumbar MRI in Non-Specific Low Back Pain" — NNT 16 for clinically actionable findings\n\n2. *Spine Journal* (2025) — "MRI Correlation with Surgical Findings in Lumbar Radiculopathy" — 89.3% sensitivity, 76.1% specificity\n\n3. *Radiology* (2026) — "Appropriateness Criteria Update: Low Back Pain Imaging" — MRI indicated after 6 weeks failed conservative care with neurological signs\n\n📎 Use citation #3 for your appeal.',
  texas:
    '**Texas Prompt-Pay Law (Insurance Code Chapter 542)**\n\n• Clean claims: **30 days** (electronically submitted)\n• Non-clean claims: **45 days** (if additional info needed)\n• Penalty: **18% annual interest** + attorney fees\n\n• Pharmacy claims: **21 days** (electronically)\n• ERISA plans: Preempted — federal law applies (30 days under 29 CFR 2560.503-1)\n\n🔔 Statute clock for your current claim: Auto-calculated in the ERISA Statute Clock panel.',
  insert:
    '✅ **Action executed:** Citation inserted into Section 2 (Clinical Necessity Justification) of the appeal letter.\n\nThe following citation was added:\n> "Per CMS LCD L37826 and Aetna Clinical Policy Bulletin 0726, lumbar MRI (CPT 72148) is medically necessary when conservative management of 6 weeks duration has failed, accompanied by neurological deficit documentation."\n\nWould you like me to format the full appeal letter now?',
  p2p:
    '**P2P Talking Points: CPT 72148 Lumbar MRI**\n\n1. **Patient History:** 42-year-old with 8 weeks progressive lower back pain radiating to left leg, failed NSAIDs + PT x 6 weeks\n\n2. **Clinical Findings:** Positive straight leg raise (45° left), diminished L5 dermatome sensation, absent Achilles reflex\n\n3. **Guideline Alignment:** Meets CMS LCD L37826 criteria — 6+ weeks conservative failure + neurological deficit\n\n4. **Risk Factor:** Progressive neurological symptoms — delay risks permanent nerve damage\n\n5. **Ask:** "Does your medical director agree that 6 weeks failed conservative care with documented neurological deficit meets medical necessity per your own CPB 0726?"',
  default:
    "I've analyzed your query and cross-referenced it against the current payer policies loaded in the system.\n\nBased on CMS LCD/NCD guidelines and the major payer medical policies (Aetna, BCBS, UHC — July 2026 editions), here's what I found:\n\n• Your request aligns with standard coverage criteria\n• Conservative therapy documentation appears sufficient\n• Consider adding functional outcome measures to strengthen the case\n\nWould you like me to draft specific language for the appeal letter or generate P2P talking points?",
};

function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('bcbs') || q.includes('conservative therapy')) return simulatedResponses.bcbs;
  if (q.includes('humira') || q.includes('fda')) return simulatedResponses.humira;
  if (q.includes('pubmed') || q.includes('72148') || q.includes('evidence')) return simulatedResponses.pubmed;
  if (q.includes('texas') || q.includes('prompt-pay') || q.includes('statute')) return simulatedResponses.texas;
  if (q.includes('insert') || q.includes('section 2')) return simulatedResponses.insert;
  if (q.includes('p2p') || q.includes('talking points') || q.includes('peer-to-peer')) return simulatedResponses.p2p;
  return simulatedResponses.default;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function DeepAICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content:
        "Hello! I'm your MedHero DeepAI Copilot. I have full context of your current case and can help with guideline lookups, evidence searches, appeal drafting, and more. How can I assist?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Keyboard shortcut: Ctrl+Space toggles copilot
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        // Don't trigger when typing in an input/textarea elsewhere
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            // If already open, minimize or close
            setIsMinimized((m) => !m);
            return true;
          }
          setIsMinimized(false);
          return true;
        });
      }
      // Escape closes
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleSend = useCallback(
    (text?: string) => {
      const query = (text || inputValue).trim();
      if (!query || isTyping) return;

      const userMsg: Message = {
        id: Date.now(),
        role: 'user',
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      // Simulate AI response after 1-2 second delay
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        // Check if this is an action hook command
        const isAction =
          query.toLowerCase().includes('insert') ||
          query.toLowerCase().includes('deepai');

        if (isAction && query.toLowerCase().includes('insert')) {
          // Show toast for action hooks
          showToast('✅ Action: Citation inserted into Section 2');
        }

        const aiMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: getSimulatedResponse(query),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, delay);
    },
    [inputValue, isTyping]
  );

  const handleSuggestionClick = useCallback(
    (chip: SuggestionChip) => {
      handleSend(chip.query);
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3
                       rounded-full shadow-2xl cursor-pointer group
                       transition-all duration-200 hover:shadow-[0_8px_32px_rgba(250,210,59,0.3)]"
            style={{ background: '#FAD23B' }}
            title="DeepAI Copilot (Ctrl+Space)"
          >
            <Zap size={18} className="text-heading-navy" />
            <span className="text-sm font-bold text-heading-navy whitespace-nowrap">
              ⚡ DeepAI Copilot
            </span>
            <span className="hidden sm:inline text-[10px] font-medium text-heading-navy/60 bg-heading-navy/10 px-2 py-0.5 rounded-full ml-1">
              Ctrl+Space
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '56px' : '520px',
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]
                       rounded-2xl overflow-hidden shadow-2xl border border-border-light
                       flex flex-col"
            style={{ background: 'rgba(255, 255, 255, 0.98)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-border-light
                          bg-gradient-to-r from-heading-navy to-heading-navy/90 cursor-pointer"
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-accent-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    MedHero DeepAI Copilot
                  </h3>
                  <p className="text-[10px] text-white/50 font-medium">AI-Powered Prior Auth Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized((prev) => !prev);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Context-Aware Banner */}
                <div
                  className="px-4 py-2.5 border-b border-border-light flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #F7F8FA 0%, #EEF2FF 100%)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                  <span className="text-[11px] font-medium text-text-secondary">
                    <span className="text-text-primary font-semibold">Context:</span> Lumbar MRI CPT 72148{' '}
                    <span className="text-text-secondary mx-1">|</span>{' '}
                    <span className="text-accent-blue font-semibold">Payer: Aetna</span>{' '}
                    <span className="text-text-secondary mx-1">|</span>{' '}
                    <span className="text-status-red font-semibold">Risk: High</span>
                  </span>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-bg-secondary/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'assistant'
                            ? 'bg-accent-blue/10'
                            : 'bg-accent-gold/10'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <Bot size={14} className="text-accent-blue" />
                        ) : (
                          <User size={14} className="text-accent-gold" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'assistant'
                              ? 'bg-white border border-border-light text-text-primary rounded-tl-sm'
                              : 'bg-accent-blue text-white rounded-tr-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-text-secondary/50 mt-0.5 block px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-accent-blue" />
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-white border border-border-light rounded-tl-sm">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue/60" />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestion Chips (shown when no user messages yet) */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2.5 border-t border-border-light bg-white">
                    <p className="text-[10px] text-text-secondary/60 font-medium mb-2 uppercase tracking-wider">
                      Suggested Queries
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                      {suggestionChips.map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => handleSuggestionClick(chip)}
                          disabled={isTyping}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                                     bg-bg-secondary border border-border-light text-text-secondary
                                     hover:bg-accent-blue/5 hover:border-accent-blue/30 hover:text-accent-blue
                                     transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="text-accent-blue flex-shrink-0">{chip.icon}</span>
                          <span className="truncate max-w-[200px]">{chip.label}</span>
                          <ArrowUpRight size={10} className="text-text-secondary/40 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="px-4 py-3 border-t border-border-light bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask DeepAI anything..."
                      disabled={isTyping}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-border-light
                                 bg-bg-secondary text-text-primary placeholder:text-text-secondary/50
                                 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 font-medium"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 rounded-lg bg-accent-gold text-heading-navy
                                 hover:bg-accent-gold/90 transition-colors
                                 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-[9px] text-text-secondary/40 mt-1.5 text-center">
                    Press Enter to send • Ctrl+Space to toggle • MedHero DeepAI v2.0
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Global toast function for action hooks
function showToast(message: string) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className =
    'fixed bottom-20 right-6 z-[60] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white animate-slide-up';
  toast.style.background = 'linear-gradient(135deg, #1E5CD4 0%, #0D0F67 100%)';
  toast.textContent = message;

  // Animate in
  toast.style.animation = 'slideUp 0.3s ease-out';
  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  // Inject keyframe if not present
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
