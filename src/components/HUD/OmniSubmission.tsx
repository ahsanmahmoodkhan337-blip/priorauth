'use client';

import React, { useState, useCallback } from 'react';
import { X, Send, CheckCircle2, Zap, Phone, Printer, Loader2, Shield, AlertTriangle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubmissionChannel = 'fhir' | 'fax' | 'voice';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'failed';

interface ChannelInfo {
  id: SubmissionChannel;
  label: string;
  description: string;
  icon: React.ReactNode;
  speed: string;
  reliability: string;
  isPrimary: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OmniSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  payerName?: string | null;
  cptCode?: string | null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChannelCard({
  info,
  isSelected,
  status,
  onSelect,
}: {
  info: ChannelInfo;
  isSelected: boolean;
  status: SubmissionStatus;
  onSelect: () => void;
}) {
  const statusIndicator = () => {
    switch (status) {
      case 'submitting':
        return <Loader2 size={14} className="animate-spin text-accent-blue" />;
      case 'success':
        return <CheckCircle2 size={14} className="text-status-green" />;
      case 'failed':
        return <AlertTriangle size={14} className="text-status-red" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onSelect}
      disabled={status === 'submitting' || status === 'success'}
      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'border-accent-blue bg-accent-blue/5 shadow-md'
          : status === 'success'
            ? 'border-status-green/30 bg-status-green/3'
            : 'border-border-light bg-white hover:border-accent-blue/20 hover:bg-accent-blue/[0.02]'
      }`}
    >
      {/* Channel icon */}
      <div
        className={`p-2.5 rounded-lg flex-shrink-0 ${
          isSelected ? 'bg-accent-blue/10' : 'bg-bg-secondary'
        }`}
      >
        <div className={isSelected ? 'text-accent-blue' : 'text-text-secondary'}>{info.icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-text-primary">{info.label}</span>
          {info.isPrimary && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-status-green/10 text-status-green">
              FASTEST ROUTE
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-secondary mt-1">{info.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[9px] text-text-secondary/60">
            Speed: <strong className="text-text-primary">{info.speed}</strong>
          </span>
          <span className="text-[9px] text-text-secondary/60">
            Uptime: <strong className="text-text-primary">{info.reliability}</strong>
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0 mt-1">{statusIndicator()}</div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OmniSubmission({ isOpen, onClose, payerName, cptCode }: OmniSubmissionProps) {
  const [selectedChannel, setSelectedChannel] = useState<SubmissionChannel>('fhir');
  const [channelStatuses, setChannelStatuses] = useState<Record<SubmissionChannel, SubmissionStatus>>({
    fhir: 'idle',
    fax: 'idle',
    voice: 'idle',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);
  const [showCoverageBadge, setShowCoverageBadge] = useState(false);

  const channels: ChannelInfo[] = [
    {
      id: 'fhir',
      label: 'FHIR ePA Direct API',
      description: 'HL7 FHIR Da Vinci CRD/DTR/PAS — real-time electronic prior authorization via direct payer API.',
      icon: <Zap size={18} />,
      speed: '< 60 seconds',
      reliability: '99.9%',
      isPrimary: true,
    },
    {
      id: 'fax',
      label: 'AI Smart-Fax with Barcode',
      description: 'HIPAA-compliant AI-optimized fax with intelligent barcode cover sheet for automated intake.',
      icon: <Printer size={18} />,
      speed: '5-15 minutes',
      reliability: '98.5%',
      isPrimary: false,
    },
    {
      id: 'voice',
      label: 'Voice AI Phone Agent',
      description: 'AI-powered voice agent calls payer IVR, navigates phone tree, and verbally submits PA data.',
      icon: <Phone size={18} />,
      speed: '8-20 minutes',
      reliability: '95%',
      isPrimary: false,
    },
  ];

  const handleSelectChannel = useCallback((channel: SubmissionChannel) => {
    setSelectedChannel(channel);
    setSubmissionResult(null);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    // Set selected channel to submitting
    setChannelStatuses((prev) => ({ ...prev, [selectedChannel]: 'submitting' }));

    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate

      setChannelStatuses((prev) => ({
        ...prev,
        [selectedChannel]: success ? 'success' : 'failed',
      }));

      if (success) {
        setSubmissionResult(
          `✅ Prior authorization submitted successfully via ${channels.find((c) => c.id === selectedChannel)!.label}. Confirmation #PA-${Date.now().toString(36).toUpperCase()}`
        );
        setShowCoverageBadge(true);
        setTimeout(() => setShowCoverageBadge(false), 5000);
      } else {
        setSubmissionResult(
          `⚠️ ${channels.find((c) => c.id === selectedChannel)!.label} unavailable. Auto-fallback to next fastest channel initiated.`
        );
        // Auto-fallback
        const fallbackChannel = selectedChannel === 'fhir' ? 'fax' : 'fhir';
        setTimeout(() => {
          setSelectedChannel(fallbackChannel);
          setChannelStatuses((prev) => ({ ...prev, [fallbackChannel]: 'success' }));
          setSubmissionResult(
            `✅ Fallback succeeded! Submitted via ${channels.find((c) => c.id === fallbackChannel)!.label}. Confirmation #PA-${Date.now().toString(36).toUpperCase()}`
          );
          setShowCoverageBadge(true);
        }, 1500);
      }

      setIsSubmitting(false);
    }, 2200);
  }, [selectedChannel, channels]);

  const handleReset = useCallback(() => {
    setChannelStatuses({ fhir: 'idle', fax: 'idle', voice: 'idle' });
    setSubmissionResult(null);
    setShowCoverageBadge(false);
  }, []);

  if (!isOpen) return null;

  const hasSuccess = Object.values(channelStatuses).some((s) => s === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-status-green/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10">
              <Send size={20} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">📡 Omni-Submission Engine</h2>
              <p className="text-xs text-text-secondary">Multi-channel PA submission with auto-fallback</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Context */}
          {(payerName || cptCode) && (
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              {payerName && (
                <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue font-semibold">{payerName}</span>
              )}
              {cptCode && (
                <span className="px-3 py-1 rounded-full bg-accent-gold/10 text-heading-navy font-semibold">CPT {cptCode}</span>
              )}
            </div>
          )}

          {/* Coverage Badge */}
          {showCoverageBadge && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-status-green/10 border border-status-green/30 animate-in fade-in duration-300">
              <Shield size={16} className="text-status-green" />
              <span className="text-sm font-bold text-status-green">99.9% Payer Coverage — All Major Payers Supported</span>
            </div>
          )}

          {/* Channel Cards */}
          <div>
            <label className="block text-[11px] font-semibold text-text-primary mb-3 uppercase tracking-wide">
              Select Submission Channel
            </label>
            <div className="space-y-3">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  info={channel}
                  isSelected={selectedChannel === channel.id}
                  status={channelStatuses[channel.id]}
                  onSelect={() => handleSelectChannel(channel.id)}
                />
              ))}
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || hasSuccess}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-status-green to-status-green/80
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting via {channels.find((c) => c.id === selectedChannel)!.label}...
              </>
            ) : hasSuccess ? (
              <>
                <CheckCircle2 size={14} />
                ✅ Submission Complete
              </>
            ) : (
              <>
                <Send size={14} />
                Submit via {channels.find((c) => c.id === selectedChannel)!.label}
              </>
            )}
          </button>

          {/* Fallback Button */}
          {!hasSuccess && !isSubmitting && (
            <button
              onClick={() => {
                const fallback = selectedChannel === 'fhir' ? 'fax' : selectedChannel === 'fax' ? 'voice' : 'fhir';
                setSelectedChannel(fallback as SubmissionChannel);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                         bg-white border border-accent-blue/30 text-accent-blue text-xs font-semibold
                         hover:bg-accent-blue/5 transition-all duration-200"
            >
              <Printer size={14} />
              Manual Fallback to Next Fastest Channel
            </button>
          )}

          {/* Result */}
          {submissionResult && (
            <div
              className={`rounded-xl border-2 p-4 animate-in fade-in duration-300 ${
                submissionResult.startsWith('✅')
                  ? 'border-status-green/30 bg-status-green/5'
                  : 'border-status-red/30 bg-status-red/5'
              }`}
            >
              <div className="flex items-start gap-3">
                {submissionResult.startsWith('✅') ? (
                  <CheckCircle2 size={18} className="text-status-green flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-status-red flex-shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-text-primary leading-relaxed">{submissionResult}</p>
              </div>
            </div>
          )}

          {/* Submission History */}
          {hasSuccess && (
            <div className="rounded-xl border border-border-light overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-navy text-white">
                <span className="text-[11px] font-semibold">Submission Log</span>
              </div>
              <div className="divide-y divide-border-light">
                {Object.entries(channelStatuses).map(([key, status]) => {
                  if (status !== 'success') return null;
                  const ch = channels.find((c) => c.id === key)!;
                  return (
                    <div key={key} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-status-green" />
                        <span className="text-[10px] font-medium text-text-primary">{ch.label}</span>
                      </div>
                      <span className="text-[9px] text-text-secondary">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light bg-bg-secondary flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary border border-border-light hover:bg-white transition-colors"
          >
            Close
          </button>
          {hasSuccess && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-accent-blue hover:brightness-110 transition-all shadow-sm"
            >
              New Submission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
