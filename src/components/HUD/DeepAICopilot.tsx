'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  AlertTriangle,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface SuggestionChip {
  id: string;
  icon: React.ReactNode;
  label: string;
  query: string;
}

// ---------------------------------------------------------------------------
// Static suggestion chips (shown when no case-specific context)
// ---------------------------------------------------------------------------

const staticSuggestionChips: SuggestionChip[] = [
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

// ---------------------------------------------------------------------------
// Simulated response engine
// ---------------------------------------------------------------------------

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

function getBasicSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('bcbs') || q.includes('conservative therapy')) return simulatedResponses.bcbs;
  if (q.includes('humira') || q.includes('fda')) return simulatedResponses.humira;
  if (q.includes('pubmed') || (q.includes('72148') && q.includes('evidence'))) return simulatedResponses.pubmed;
  if (q.includes('texas') || q.includes('prompt-pay') || q.includes('statute')) return simulatedResponses.texas;
  if (q.includes('insert') || q.includes('section 2')) return simulatedResponses.insert;
  if (q.includes('p2p') || (q.includes('talking points') && !q.includes('case'))) return simulatedResponses.p2p;
  return simulatedResponses.default;
}

// ---------------------------------------------------------------------------
// Case-specific response generator
// ---------------------------------------------------------------------------

function generateCaseSpecificResponse(
  query: string,
  payerName: string,
  cptCode: string,
  procedureName: string,
  approvalScore: number | null,
  riskLevel: string,
  satisfiedCriteria: { description: string }[],
  missingCriteria: { description: string; recommendedAction: string }[],
  hasResult: boolean
): string | null {
  const q = query.toLowerCase();

  // "What criteria does this case meet?"
  if (
    (q.includes('criteria') && (q.includes('meet') || q.includes('satisfied') || q.includes('pass'))) ||
    q.includes('what criteria')
  ) {
    if (!hasResult) {
      return `I don't have audit results for this case yet. Please run the audit first by clicking **Run Audit** in the Clinical Chart Editor panel. Once the audit completes, I'll be able to tell you exactly which criteria are met and which are missing for ${payerName} CPT ${cptCode}.`;
    }
    const metList = satisfiedCriteria.length > 0
      ? satisfiedCriteria.map((c) => `  ✅ ${c.description}`).join('\n')
      : '  (No criteria were satisfied)';
    const missingList = missingCriteria.length > 0
      ? missingCriteria.map((c) => `  ❌ ${c.description}`).join('\n')
      : '  (All criteria are satisfied!)';
    return `**Criteria Analysis for ${payerName} — CPT ${cptCode}**\n\n**SATISFIED CRITERIA:**\n${metList}\n\n**MISSING CRITERIA:**\n${missingList}\n\n📊 Overall approval score: **${approvalScore}%** (${riskLevel} risk)`;
  }

  // "What's missing for approval?"
  if (q.includes('missing') || q.includes('what do i need') || q.includes('how to fix') || q.includes('denial risk')) {
    if (!hasResult) {
      return `I don't have audit results yet. Run the audit first, and I'll show you exactly what's missing and how to fix it for ${payerName} CPT ${cptCode}.`;
    }
    if (missingCriteria.length === 0) {
      return `✅ **Great news!** All criteria for ${payerName} CPT ${cptCode} are satisfied. Your approval score is **${approvalScore}%** (${riskLevel} risk). This case looks ready for submission!\n\nWould you like me to generate the justification letter?`;
    }
    const missingList = missingCriteria.map((c) =>
      `  ❌ **${c.description}**\n     💡 *Fix:* ${c.recommendedAction}`
    ).join('\n\n');
    return `**What's Missing for ${payerName} — CPT ${cptCode}**\n\n${missingList}\n\n📊 Current approval score: **${approvalScore}%** (${riskLevel} risk)\n\nAddress these items to strengthen your case. Want me to draft an addendum for any of these?`;
  }

  // "What does [Payer] require for [CPT]?"
  if (q.includes('require') || q.includes('policy') || q.includes('coverage') || q.includes('what does') || q.includes('criteria for')) {
    if (!hasResult) {
      return `I have ${payerName}'s policy loaded for CPT ${cptCode} (${procedureName || 'this procedure'}). To check which specific criteria this case meets, I'd recommend running the audit first. Would you like me to explain the general coverage requirements?`;
    }
    return `**${payerName} Coverage Policy for CPT ${cptCode} (${procedureName || 'this procedure'})**\n\nThis case has an approval score of **${approvalScore}%** (${riskLevel} risk).\n\n📋 **Criteria Checklist:**\n${satisfiedCriteria.map((c) => `  ✅ ${c.description}`).join('\n')}\n${missingCriteria.map((c) => `  ❌ ${c.description}`).join('\n')}\n\nWould you like me to explain any specific criterion in detail?`;
  }

  // "Generate appeal letter"
  if (q.includes('appeal letter') || q.includes('justification letter') || q.includes('generate letter')) {
    if (!hasResult) {
      return `To generate a case-specific appeal letter for ${payerName} CPT ${cptCode}, I need the audit results first. Please click **Run Audit** and then I'll generate a pre-formatted justification letter you can use in the **Generate Appeal Packet** modal.`;
    }
    return `✅ Your justification letter for ${payerName} CPT ${cptCode} is ready!\n\nClick **Generate Appeal Packet** in the Audit Scorecard panel to view the full letter. It includes:\n\n• Patient clinical summary\n• Satisfied criteria with citations\n• Missing criteria with recommendations\n• Formatted for payer submission\n\nApproval score: **${approvalScore}%** (${riskLevel} risk)`;
  }

  // "What's my approval score?"
  if (q.includes('approval score') || q.includes('what is my score') || q.includes('how likely')) {
    if (!hasResult) {
      return `I don't have an approval score for this case yet. Run the audit using the **Run Audit** button and I'll calculate the likelihood of approval for ${payerName} CPT ${cptCode}.`;
    }
    const emoji = approvalScore !== null && approvalScore >= 80 ? '🟢' : approvalScore !== null && approvalScore >= 50 ? '🟡' : '🔴';
    return `${emoji} **Approval Score: ${approvalScore}%** — ${riskLevel} risk of denial\n\nPayer: ${payerName}\nProcedure: ${procedureName || 'N/A'} (CPT ${cptCode})\n\n${satisfiedCriteria.length} criteria satisfied, ${missingCriteria.length} missing.\n\n${missingCriteria.length > 0 ? '⚠️ Address the missing criteria to improve your score.' : '✅ All criteria are satisfied!'}`;
  }

  // "Write a P2P script for this case"
  if (q.includes('p2p') || q.includes('peer-to-peer') || q.includes('talking points')) {
    if (!hasResult) {
      return `I can generate a P2P call script for your ${payerName} case (CPT ${cptCode}). For the most accurate talking points, run the audit first so I can reference the specific satisfied and missing criteria.`;
    }
    const missingPoints = missingCriteria.length > 0
      ? `\n\n**Anticipated Pushback & Rebuttals:**\n${missingCriteria.map((c) => `• If they question **${c.description}** → Respond with: "${c.recommendedAction}"`).join('\n')}`
      : '';
    const metPoints = satisfiedCriteria.slice(0, 4).map((c) => `• ${c.description}`).join('\n');
    return `**🎙️ P2P Call Script: ${payerName} — CPT ${cptCode}**\n\n**Opening:**\n"Hi, this is Dr. [Name] calling regarding prior auth case # [ID] for ${procedureName || 'this procedure'}."\n\n**Key Talking Points:**\n${metPoints}\n\n**The Ask:**\n"Based on ${payerName}'s own medical policy, this patient meets ${satisfiedCriteria.length} of the required criteria. I'm requesting approval for medically necessary ${procedureName || 'treatment'}."${missingPoints}\n\n📊 Case approval score: **${approvalScore}%**`;
  }

  // No specific match for case-aware queries — fall through
  return null;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeepAICopilot() {
  // Try to get case state; if not wrapped (e.g., on landing page), gracefully degrade
  let caseState = null;
  try {
    caseState = useCaseState();
  } catch {
    // Not inside CaseProvider — copilot works without case context
  }

  const activeCase = caseState?.activeCase ?? null;
  const auditResult = activeCase?.auditResult ?? null;
  const payerName = activeCase?.payerName ?? 'Unknown';
  const cptCode = activeCase?.cptCode ?? 'Unknown';
  const procedureName = auditResult?.procedureName ?? 'this procedure';
  const approvalScore = auditResult?.approvalScore ?? null;
  const riskLevel = auditResult?.riskLevel ?? 'High';
  const satisfiedCriteria = auditResult?.satisfiedCriteria ?? [];
  const missingCriteria = auditResult?.missingCriteria ?? [];
  const hasResult = auditResult !== null;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownProactive, setHasShownProactive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCaseIdRef = useRef<string | null>(null);

  // Initialize greeting based on active case
  const buildGreeting = useCallback((): string => {
    if (!activeCase) {
      return "Hello! I'm your MedHero DeepAI Copilot. I have full context of your current case and can help with guideline lookups, evidence searches, appeal drafting, and more. How can I assist?";
    }
    const parts: string[] = [];
    parts.push(`👋 Hello! I'm analyzing your active case:`);
    parts.push(`\n• **Payer:** ${activeCase.payerName || 'Not set'}`);
    parts.push(`• **CPT:** ${activeCase.cptCode || 'Not set'}`);
    parts.push(`• **Case:** "${activeCase.name}"`);

    if (hasResult && approvalScore !== null) {
      const emoji = approvalScore >= 80 ? '🟢' : approvalScore >= 50 ? '🟡' : '🔴';
      parts.push(`\n${emoji} **Approval Score:** ${approvalScore}% (${riskLevel} risk)`);
      if (missingCriteria.length > 0) {
        parts.push(`\n⚠️ **${missingCriteria.length} criteria missing** — I can help you fix them.`);
      } else {
        parts.push(`\n✅ All criteria satisfied — ready for submission!`);
      }
    } else if (activeCase.chartNote.trim()) {
      parts.push(`\n📝 I see you've entered a chart note. Want me to analyze it against ${activeCase.payerName || 'the payer'}'s criteria? Click **Run Audit** or ask me to check specific requirements.`);
    } else {
      parts.push(`\n📋 No chart note yet. Select a sample case or create a custom case to get started.`);
    }

    return parts.join('');
  }, [activeCase, hasResult, approvalScore, riskLevel, missingCriteria.length]);

  // Reset greeting when case changes or audit completes
  useEffect(() => {
    const caseChanged = prevCaseIdRef.current !== activeCase?.id;
    prevCaseIdRef.current = activeCase?.id ?? null;

    if (caseChanged) {
      setHasShownProactive(false);
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: buildGreeting(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeCase?.id, buildGreeting]);

  // Proactive suggestion when audit results change
  useEffect(() => {
    if (hasResult && !hasShownProactive && approvalScore !== null) {
      setHasShownProactive(true);
      const proactiveMsg = buildProactiveMessage(
        approvalScore,
        riskLevel,
        missingCriteria,
        payerName,
        cptCode
      );
      if (proactiveMsg) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              role: 'system',
              content: proactiveMsg,
              timestamp: new Date(),
            },
          ]);
        }, 1500);
      }
    }
  }, [hasResult, hasShownProactive, approvalScore, riskLevel, missingCriteria, payerName, cptCode]);

  // Auto-scroll
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
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            setIsMinimized((m) => !m);
            return true;
          }
          setIsMinimized(false);
          return true;
        });
      }
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

      const delay = 800 + Math.random() * 800;
      setTimeout(() => {
        // First try case-specific response
        let response: string | null = null;
        if (activeCase) {
          response = generateCaseSpecificResponse(
            query,
            payerName,
            cptCode,
            procedureName,
            approvalScore,
            riskLevel,
            satisfiedCriteria,
            missingCriteria,
            hasResult
          );
        }

        // Fall back to basic simulated response
        if (!response) {
          response = getBasicSimulatedResponse(query);
        }

        // Handle action hooks
        const isAction =
          query.toLowerCase().includes('insert') ||
          query.toLowerCase().includes('deepai');
        if (isAction && query.toLowerCase().includes('insert')) {
          showToast('✅ Action: Citation inserted into Section 2');
        }

        const aiMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, delay);
    },
    [inputValue, isTyping, activeCase, payerName, cptCode, procedureName, approvalScore, riskLevel, satisfiedCriteria, missingCriteria, hasResult]
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

  // Build context-aware suggestion chips
  const suggestionChips = useMemo(() => {
    if (!activeCase) return staticSuggestionChips;

    const chips: SuggestionChip[] = [];

    if (!hasResult && activeCase.chartNote.trim()) {
      chips.push({
        id: 'case-analyze',
        icon: <ClipboardCheck size={14} />,
        label: `Analyze this case against ${payerName}`,
        query: `What criteria does this case meet for ${payerName} CPT ${cptCode}?`,
      });
    }

    if (hasResult && missingCriteria.length > 0) {
      chips.push({
        id: 'case-missing',
        icon: <AlertTriangle size={14} />,
        label: 'What\'s missing for approval?',
        query: 'What\'s missing for approval?',
      });
      chips.push({
        id: 'case-fix',
        icon: <ShieldCheck size={14} />,
        label: 'How do I fix the denial risk?',
        query: 'How do I fix the denial risk?',
      });
    }

    chips.push({
      id: 'case-policy',
      icon: <BookOpen size={14} />,
      label: `What does ${payerName} require for CPT ${cptCode}?`,
      query: `What does ${payerName} require for CPT ${cptCode}?`,
    });

    if (hasResult) {
      chips.push({
        id: 'case-score',
        icon: <Zap size={14} />,
        label: 'What\'s my approval score?',
        query: 'What\'s my approval score?',
      });
      chips.push({
        id: 'case-p2p',
        icon: <MessageSquare size={14} />,
        label: 'Write a P2P script for this case',
        query: 'Write a P2P script for this case',
      });
      chips.push({
        id: 'case-letter',
        icon: <FileText size={14} />,
        label: 'Generate appeal letter',
        query: 'Generate appeal letter',
      });
    }

    return chips;
  }, [activeCase, payerName, cptCode, hasResult, missingCriteria.length]);

  // Build context line for the banner
  const contextLine = activeCase
    ? `${activeCase.name} — ${payerName} / CPT ${cptCode}${approvalScore !== null ? ` — ${approvalScore}% (${riskLevel})` : ''}`
    : 'No active case';

  const riskColorClass = riskLevel === 'Low' ? 'text-status-green' : riskLevel === 'Medium' ? 'text-status-orange' : 'text-status-red';

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
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)]
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
                  <div
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      activeCase ? 'bg-status-green' : 'bg-text-secondary/40'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-text-secondary">
                    <span className="text-text-primary font-semibold">Active Case:</span>{' '}
                    {contextLine}
                    {approvalScore !== null && (
                      <>
                        <span className="text-text-secondary mx-1">|</span>
                        <span className={`font-semibold ${riskColorClass}`}>
                          Risk: {riskLevel}
                        </span>
                      </>
                    )}
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
                            : msg.role === 'system'
                            ? 'bg-status-orange/10'
                            : 'bg-accent-gold/10'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <Bot size={14} className="text-accent-blue" />
                        ) : msg.role === 'system' ? (
                          <AlertTriangle size={14} className="text-status-orange" />
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
                              : msg.role === 'system'
                              ? 'bg-status-orange/5 border border-status-orange/20 text-text-primary rounded-tl-sm'
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

                {/* Suggestion Chips */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2.5 border-t border-border-light bg-white">
                    <p className="text-[10px] text-text-secondary/60 font-medium mb-2 uppercase tracking-wider">
                      {activeCase ? '💡 Case-Specific Queries' : 'Suggested Queries'}
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
                      placeholder={
                        activeCase
                          ? `Ask about ${activeCase.name}...`
                          : 'Ask DeepAI anything...'
                      }
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
                    Press Enter to send • Ctrl+Space to toggle • MedHero DeepAI v3.0 (Case-Aware)
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

// ---------------------------------------------------------------------------
// Proactive message builder
// ---------------------------------------------------------------------------

function buildProactiveMessage(
  approvalScore: number,
  riskLevel: string,
  missingCriteria: { description: string; recommendedAction: string }[],
  payerName: string,
  cptCode: string
): string | null {
  if (approvalScore < 50) {
    return `⚠️ **Proactive Alert:** This case has a **${approvalScore}%** approval score (${riskLevel} risk) for ${payerName} CPT ${cptCode}.\n\nHere's what to fix:\n${missingCriteria.slice(0, 3).map((c) => `• ${c.description} → ${c.recommendedAction}`).join('\n')}\n\nAsk me: "How do I fix the denial risk?" for detailed guidance.`;
  }
  if (approvalScore < 80 && missingCriteria.length > 0) {
    return `⚠️ **Heads up:** ${missingCriteria.length} criteria are missing for ${payerName} CPT ${cptCode}. Your score is ${approvalScore}% (${riskLevel} risk).\n\nTop missing:\n${missingCriteria.slice(0, 2).map((c) => `❌ ${c.description}`).join('\n')}\n\nAsk me: "What's missing for approval?" to see the full list.`;
  }
  if (approvalScore >= 80) {
    return `✅ **This case looks good!** ${approvalScore}% approval likelihood (${riskLevel} risk) for ${payerName} CPT ${cptCode}. All key criteria are satisfied.\n\nWould you like me to **generate the justification letter** or **write a P2P script**?`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Toast helper
// ---------------------------------------------------------------------------

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.className =
    'fixed bottom-20 right-6 z-[60] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white animate-slide-up';
  toast.style.background = 'linear-gradient(135deg, #1E5CD4 0%, #0D0F67 100%)';
  toast.textContent = message;
  toast.style.animation = 'slideUp 0.3s ease-out';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);

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
