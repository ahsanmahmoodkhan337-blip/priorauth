'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Pause, Play, PhoneOff, Zap, AlertTriangle, CheckCircle2, Volume2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WhisperCard {
  id: number;
  type: 'rebuttal' | 'evidence' | 'alert';
  content: string;
  timestamp: string;
}

interface ConversationLine {
  speaker: 'director' | 'provider';
  text: string;
  delay: number;
}

// ---------------------------------------------------------------------------
// Simulated conversation + AI whispers
// ---------------------------------------------------------------------------

const CONVERSATION: ConversationLine[] = [
  {
    speaker: 'director',
    text: "Hello Doctor. I'm Dr. Matthews, Medical Director at Aetna. I've reviewed the prior authorization request for the lumbar MRI. Our policy requires 6 weeks of documented conservative management, and I'm only seeing about 3 weeks of physical therapy in the submitted records.",
    delay: 0,
  },
  {
    speaker: 'provider',
    text: "Dr. Matthews, thank you for reviewing this case. I understand the 6-week requirement. However, I want to direct your attention to the physical therapy records — specifically the notes from weeks 3 through 8 that are documented on Chart Page 3, Section B. The patient actually completed 8 weeks of formal PT with a licensed physical therapist, twice weekly.",
    delay: 3000,
  },
  {
    speaker: 'director',
    text: "I see the PT documentation, but I'm concerned about the lack of measurable functional outcomes. Our LCD requires objective improvement metrics — ROM measurements, strength grades, functional assessment scores. These aren't clearly documented.",
    delay: 6000,
  },
  {
    speaker: 'provider',
    text: "That's a fair point. If you'll look at the updated PT progress note addendum I just pushed to your portal — it includes the Oswestry Disability Index scores showing improvement from 62% to 38%, and hip flexion ROM improved from 45° to 75°. These are objective measures. Additionally, per Aetna LCD L36789 Section 4A Exception Clause, the presence of progressive neurological symptoms — in this case, worsening right leg weakness documented on exam — qualifies for an expedited imaging exception even before the full 6-week mark.",
    delay: 9000,
  },
  {
    speaker: 'director',
    text: "I've reviewed the PT addendum and the neurological exam findings. Given the documented progressive weakness and the updated functional outcome measures, I'll approve this authorization. You should receive the approval number within the hour.",
    delay: 13000,
  },
];

const WHISPER_CARDS: WhisperCard[] = [
  {
    id: 1,
    type: 'evidence',
    content: '💡 WHISPER REBUTTAL: Chart Page 3, Section B documents 8 weeks of PT (not 3). Direct them to the full PT progress notes — you completed twice-weekly supervised sessions from Jan 15 to Mar 10.',
    timestamp: '0:00',
  },
  {
    id: 2,
    type: 'alert',
    content: "⚠️ WATCH OUT: They'll challenge the lack of objective outcome measures. Have the Oswestry Disability Index and ROM measurements ready. The PT addendum you just pushed should cover this.",
    timestamp: '0:05',
  },
  {
    id: 3,
    type: 'rebuttal',
    content: "💡 WHISPER REBUTTAL: Cite Aetna LCD L36789 Section 4A Exception Clause — progressive neurological symptoms (right leg weakness) qualify for expedited imaging regardless of conservative care duration. This is your strongest argument.",
    timestamp: '0:12',
  },
  {
    id: 4,
    type: 'evidence',
    content: '💡 CLOSING: If they approve, ask for the authorization number and expected turnaround time for the written approval letter. Document the call reference number.',
    timestamp: '0:20',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface P2PWhisperProps {
  isOpen: boolean;
  onClose: () => void;
  payerName?: string | null;
  cptCode?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function P2PWhisper({ isOpen, onClose, payerName, cptCode }: P2PWhisperProps) {
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'paused' | 'ended'>('idle');
  const [currentLine, setCurrentLine] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [activeWhisperCard, setActiveWhisperCard] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Simulated call flow
  useEffect(() => {
    if (callState !== 'active') return;

    const timers: NodeJS.Timeout[] = [];

    CONVERSATION.forEach((line, idx) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, idx]);
        setCurrentLine(idx);
      }, line.delay + 500);
      timers.push(timer);
    });

    // Whisper cards
    WHISPER_CARDS.forEach((card, idx) => {
      const timer = setTimeout(() => {
        setActiveWhisperCard(idx + 1);
      }, (idx + 1) * 4000 + 1000);
      timers.push(timer);
    });

    // Auto-end after last line
    const endTimer = setTimeout(() => {
      setCallState('ended');
    }, CONVERSATION[CONVERSATION.length - 1].delay + 3000);
    timers.push(endTimer);

    return () => timers.forEach(clearTimeout);
  }, [callState]);

  // Simulated volume animation
  useEffect(() => {
    if (callState !== 'active') return;
    const interval = setInterval(() => {
      setVolumeLevel(Math.floor(Math.random() * 40) + 20);
    }, 300);
    return () => clearInterval(interval);
  }, [callState]);

  // Scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  const handleStartCall = useCallback(() => {
    setCallState('connecting');
    setVisibleLines([]);
    setCurrentLine(0);
    setActiveWhisperCard(0);
    setTimeout(() => setCallState('active'), 1500);
  }, []);

  const handleTogglePause = useCallback(() => {
    setCallState((prev) => (prev === 'active' ? 'paused' : prev === 'paused' ? 'active' : prev));
  }, []);

  const handleEndCall = useCallback(() => {
    setCallState('ended');
  }, []);

  const handleReset = useCallback(() => {
    setCallState('idle');
    setVisibleLines([]);
    setCurrentLine(0);
    setActiveWhisperCard(0);
  }, []);

  if (!isOpen) return null;

  const currentWhisperCard = WHISPER_CARDS.find((c) => c.id === activeWhisperCard);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header — Call Status Bar */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-b transition-colors duration-300 ${
            callState === 'active'
              ? 'bg-status-green/10 border-status-green/20'
              : callState === 'ended'
                ? 'bg-bg-secondary border-border-light'
                : 'bg-accent-blue/5 border-accent-blue/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                callState === 'active'
                  ? 'bg-status-green/20 animate-pulse'
                  : callState === 'connecting'
                    ? 'bg-accent-gold/20 animate-pulse'
                    : 'bg-bg-secondary'
              }`}
            >
              <Mic size={18} className={callState === 'active' ? 'text-status-green' : 'text-text-secondary'} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-heading-navy">
                {callState === 'idle' && '🎙️ P2P Whisper Co-Pilot — Ready'}
                {callState === 'connecting' && '📞 Connecting to Insurance Medical Director...'}
                {callState === 'active' && '🔴 Live P2P Call — AI Whisper Active'}
                {callState === 'paused' && '⏸️ Call Paused — Whisper on Hold'}
                {callState === 'ended' && '✅ P2P Call Complete'}
              </h2>
              <p className="text-[10px] text-text-secondary">
                {callState === 'active'
                  ? `Insurance Medical Director (${payerName || 'Aetna'}) speaking...`
                  : callState === 'ended'
                    ? 'Authorization approved — confirmation pending'
                    : `P2P call for CPT ${cptCode || 'N/A'} — AI whisper ready`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left — Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-r border-border-light bg-bg-secondary/50">
            {callState === 'idle' && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="p-5 rounded-full bg-accent-blue/5 border border-accent-blue/10">
                  <Mic size={40} className="text-accent-blue/30" />
                </div>
                <div>
                  <p className="text-sm text-text-primary font-semibold">Ready for Peer-to-Peer Call</p>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs">
                    AI will provide real-time whisper rebuttals during your call with the insurance medical director.
                  </p>
                  <div className="flex items-center gap-2 mt-3 justify-center">
                    <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-semibold">
                      {payerName || 'Aetna'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-accent-gold/10 text-heading-navy text-[10px] font-semibold">
                      CPT {cptCode || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleStartCall}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-status-green to-status-green/80 text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all"
                >
                  <Mic size={16} />
                  🎙️ Launch Live P2P Call Whisper HUD
                </button>
              </div>
            )}

            {callState === 'connecting' && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="p-5 rounded-full bg-accent-gold/10 animate-pulse">
                  <PhoneOff size={40} className="text-accent-gold" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">Connecting to Medical Director...</p>
                  <p className="text-xs text-text-secondary mt-1">Dialing payer P2P line • Estimated wait: 30 seconds</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent-blue animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {(callState === 'active' || callState === 'paused' || callState === 'ended') && (
              <div className="space-y-3">
                {visibleLines.map((lineIdx) => {
                  const line = CONVERSATION[lineIdx];
                  const isDirector = line.speaker === 'director';
                  return (
                    <div
                      key={lineIdx}
                      className={`flex ${isDirector ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-${isDirector ? 'left' : 'right'}-2 duration-300`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                          isDirector
                            ? 'bg-white border border-border-light rounded-bl-md shadow-sm'
                            : 'bg-accent-blue text-white rounded-br-md shadow-md'
                        }`}
                      >
                        <p className="text-[10px] font-semibold mb-1 opacity-70">
                          {isDirector ? `🎓 Insurance Medical Director` : `🩺 You (Provider)`}
                        </p>
                        <p className="text-xs leading-relaxed">{line.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={conversationEndRef} />

                {callState === 'ended' && (
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-status-green/10 border border-status-green/20 animate-in fade-in duration-500">
                    <CheckCircle2 size={18} className="text-status-green" />
                    <span className="text-sm font-bold text-status-green">
                      ✅ AUTHORIZATION APPROVED — P2P Call Successful
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Whisper Panel */}
          <div className="w-full lg:w-72 flex flex-col bg-white overflow-y-auto">
            <div className="px-4 py-3 border-b border-border-light bg-accent-gold/5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-accent-gold" />
                <span className="text-[11px] font-bold text-heading-navy">AI WHISPER HUD</span>
                <span
                  className={`ml-auto w-2 h-2 rounded-full ${
                    callState === 'active' ? 'bg-status-green animate-pulse' : 'bg-text-secondary/30'
                  }`}
                />
              </div>
            </div>

            <div className="flex-1 p-3 space-y-3">
              {callState === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                  <Zap size={28} className="text-accent-gold/20" />
                  <p className="text-[10px] text-text-secondary/50">Whisper cards will appear here during live call</p>
                </div>
              )}

              {(callState === 'active' || callState === 'paused' || callState === 'ended') && (
                <>
                  {/* Current whisper card */}
                  {currentWhisperCard && callState !== 'ended' && (
                    <div
                      className={`rounded-xl border-2 p-3 animate-in fade-in slide-in-from-right-4 duration-300 ${
                        currentWhisperCard.type === 'rebuttal'
                          ? 'border-accent-blue/40 bg-accent-blue/5'
                          : currentWhisperCard.type === 'alert'
                            ? 'border-status-red/40 bg-status-red/5'
                            : 'border-status-green/40 bg-status-green/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        {currentWhisperCard.type === 'rebuttal' && (
                          <Zap size={12} className="text-accent-blue" />
                        )}
                        {currentWhisperCard.type === 'alert' && (
                          <AlertTriangle size={12} className="text-status-red" />
                        )}
                        {currentWhisperCard.type === 'evidence' && (
                          <CheckCircle2 size={12} className="text-status-green" />
                        )}
                        <span className="text-[9px] font-bold text-text-secondary uppercase">
                          {currentWhisperCard.type}
                        </span>
                        <span className="text-[9px] text-text-secondary/40 ml-auto">{currentWhisperCard.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-text-primary leading-relaxed">{currentWhisperCard.content}</p>
                    </div>
                  )}

                  {/* Past whisper cards */}
                  {WHISPER_CARDS.filter((c) => c.id < activeWhisperCard).map((card) => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-border-light bg-bg-secondary/50 p-2.5 opacity-60"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={10} className="text-text-secondary" />
                        <span className="text-[9px] font-semibold text-text-secondary uppercase">{card.type}</span>
                        <span className="text-[9px] text-text-secondary/40 ml-auto">{card.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">{card.content}</p>
                    </div>
                  ))}

                  {/* Call ended summary */}
                  {callState === 'ended' && (
                    <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/5 p-3 animate-in fade-in duration-500">
                      <h4 className="text-[11px] font-bold text-heading-navy mb-2">📋 Call Summary</h4>
                      <div className="space-y-1.5 text-[10px] text-text-secondary">
                        <p>• Duration: 4m 32s</p>
                        <p>• Outcome: APPROVED</p>
                        <p>• Auth #: PA-{Date.now().toString(36).toUpperCase()}</p>
                        <p>• Whispers used: {WHISPER_CARDS.length}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Volume meter */}
              {callState === 'active' && (
                <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-bg-secondary">
                  <Volume2 size={12} className="text-text-secondary" />
                  <div className="flex-1 h-1.5 rounded-full bg-border-light overflow-hidden">
                    <div
                      className="h-full rounded-full bg-status-green transition-all duration-200"
                      style={{ width: `${volumeLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Whisper toggle indicator */}
            {(callState === 'active' || callState === 'paused') && (
              <div className="px-3 pb-3">
                <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-bg-secondary text-[10px] text-text-secondary">
                  <div className={`w-1.5 h-1.5 rounded-full ${callState === 'active' ? 'bg-status-green animate-pulse' : 'bg-accent-gold'}`} />
                  Whisper AI {callState === 'active' ? 'Listening & Analyzing' : 'Paused'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Call Controls */}
        <div className="px-6 py-3 border-t border-border-light bg-bg-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mic toggle */}
            <button
              onClick={() => setIsMicOn((prev) => !prev)}
              disabled={callState === 'idle' || callState === 'ended'}
              className={`p-2.5 rounded-full transition-all ${
                isMicOn
                  ? 'bg-status-green/10 text-status-green hover:bg-status-green/20'
                  : 'bg-status-red/10 text-status-red hover:bg-status-red/20'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>

            {/* Pause/Resume */}
            <button
              onClick={handleTogglePause}
              disabled={callState !== 'active' && callState !== 'paused'}
              className="p-2.5 rounded-full bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {callState === 'paused' ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {callState === 'idle' ? (
              <button
                onClick={handleStartCall}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-status-green to-status-green/80 text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              >
                <Mic size={14} />
                Start P2P Call
              </button>
            ) : callState === 'ended' ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-blue text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              >
                New Call
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-status-red text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              >
                <PhoneOff size={14} />
                End Call
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
