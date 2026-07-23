'use client';

import React, { useState, useCallback } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, Clipboard, AlertCircle, Stethoscope } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';
import NoActiveCaseMessage from './NoActiveCaseMessage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CodeSuggestion {
  currentCode: string;
  currentDescription: string;
  suggestedCode: string;
  suggestedDescription: string;
  specificityGain: string;
  rationale: string;
}

interface ModifierSuggestion {
  modifier: string;
  name: string;
  rationale: string;
  required: boolean;
}

interface AnalysisResult {
  suggestions: CodeSuggestion[];
  modifiers: ModifierSuggestion[];
  procedureContext: string;
  scannedAt: string;
}

// ---------------------------------------------------------------------------
// Simulated suggestions by CPT code
// ---------------------------------------------------------------------------

const CODE_SUGGESTIONS: Record<string, { suggestions: CodeSuggestion[]; modifiers: ModifierSuggestion[]; procedureContext: string }> = {
  '72148': {
    procedureContext: 'Lumbar Spine MRI without Contrast',
    suggestions: [
      {
        currentCode: 'M54.50',
        currentDescription: 'Low back pain, unspecified',
        suggestedCode: 'M54.51',
        suggestedDescription: 'Vertebrogenic low back pain with right-sided sciatica',
        specificityGain: '+3 specificity levels',
        rationale:
          'Chart note documents right-sided radicular symptoms with positive straight-leg raise test. M54.51 captures laterality and sciatica, improving medical necessity justification under LCD criteria for nerve root involvement.',
      },
      {
        currentCode: 'M54.2',
        currentDescription: 'Cervicalgia',
        suggestedCode: 'M54.2',
        suggestedDescription: 'Cervicalgia (already appropriately specific)',
        specificityGain: 'Adequate',
        rationale:
          'This code is already at an acceptable specificity level for the documented condition. No upgrade needed.',
      },
    ],
    modifiers: [
      {
        modifier: '25',
        name: 'Significant, Separately Identifiable E/M Service',
        rationale: 'Required when billing an E/M visit on the same day as the imaging procedure to indicate the E/M was distinct.',
        required: true,
      },
      {
        modifier: '59',
        name: 'Distinct Procedural Service',
        rationale: 'Not applicable for standalone imaging; only needed if multiple distinct procedures are performed.',
        required: false,
      },
      {
        modifier: 'KX',
        name: 'Requirements Specified in Medical Policy Have Been Met',
        rationale: 'Append when all LCD coverage criteria are documented. Strengthens claim against auto-denial.',
        required: true,
      },
    ],
  },
  '72149': {
    procedureContext: 'Lumbar Spine MRI with and without Contrast',
    suggestions: [
      {
        currentCode: 'M54.50',
        currentDescription: 'Low back pain, unspecified',
        suggestedCode: 'M54.41',
        suggestedDescription: 'Lumbago with sciatica, right side',
        specificityGain: '+2 specificity levels',
        rationale:
          'Chart documents right leg radiculopathy with positive SLR at 30 degrees. M54.41 captures both lumbago and sciatica with laterality, matching payer criteria for advanced imaging necessity.',
      },
    ],
    modifiers: [
      {
        modifier: '25',
        name: 'Significant, Separately Identifiable E/M Service',
        rationale: 'Required when billing E/M and imaging on same date of service.',
        required: true,
      },
      {
        modifier: 'KX',
        name: 'Requirements Specified in Medical Policy Have Been Met',
        rationale: 'Critical for MRI authorization — signals that all conservative care prerequisites are documented.',
        required: true,
      },
    ],
  },
  '99213': {
    procedureContext: 'Established Patient Office Visit, Level 3',
    suggestions: [
      {
        currentCode: 'E11.9',
        currentDescription: 'Type 2 diabetes mellitus without complications',
        suggestedCode: 'E11.40',
        suggestedDescription: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified',
        specificityGain: '+2 specificity levels',
        rationale:
          'Chart mentions "diabetic neuropathy" in assessment. E11.40 captures this complication, supporting higher-level E/M coding.',
      },
    ],
    modifiers: [
      {
        modifier: '25',
        name: 'Significant, Separately Identifiable E/M Service',
        rationale: 'Required if procedure was performed on the same day.',
        required: true,
      },
    ],
  },
};

const DEFAULT_SUGGESTIONS: AnalysisResult['suggestions'] = [
  {
    currentCode: 'M54.50',
    currentDescription: 'Low back pain, unspecified',
    suggestedCode: 'M54.51',
    suggestedDescription: 'Vertebrogenic low back pain with right-sided sciatica',
    specificityGain: '+3 specificity levels',
    rationale:
      'Chart note documents right-sided radicular symptoms. M54.51 captures laterality and sciatica, significantly improving medical necessity justification.',
  },
];

const DEFAULT_MODIFIERS: ModifierSuggestion[] = [
  {
    modifier: '25',
    name: 'Significant, Separately Identifiable E/M Service',
    rationale: 'Required when billing an E/M visit on the same day as the procedure.',
    required: true,
  },
  {
    modifier: 'KX',
    name: 'Requirements Specified in Medical Policy Have Been Met',
    rationale: 'Append when all LCD coverage criteria are documented.',
    required: true,
  },
  {
    modifier: '59',
    name: 'Distinct Procedural Service',
    rationale: 'Only needed if multiple distinct procedures are performed on the same day.',
    required: false,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ICD10BoosterProps {
  isOpen: boolean;
  onClose: () => void;
  cptCode?: string | null;
  payerName?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ICD10Booster({ isOpen, onClose, cptCode, payerName }: ICD10BoosterProps) {
  const { activeCase } = useCaseState();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [appliedCodes, setAppliedCodes] = useState<Set<string>>(new Set());
  const [appliedMods, setAppliedMods] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  // Use active case data, falling back to props
  const effectiveCptCode = activeCase?.cptCode || cptCode || null;
  const effectivePayer = activeCase?.payerName || payerName || null;
  const chartNote = activeCase?.chartNote ?? null;

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setResult(null);
    setAppliedCodes(new Set());
    setAppliedMods(new Set());

    // Scan chartNote for additional context if available
    const hasRadiculopathy = chartNote ? /radiculopathy|sciatica|nerve root|radicular/i.test(chartNote) : false;

    setTimeout(() => {
      const data = CODE_SUGGESTIONS[effectiveCptCode || ''] || {
        suggestions: DEFAULT_SUGGESTIONS,
        modifiers: DEFAULT_MODIFIERS,
        procedureContext: effectiveCptCode ? `CPT ${effectiveCptCode}` : 'General Procedure',
      };

      // If chart note shows radiculopathy, add that context
      const context = hasRadiculopathy
        ? `${data.procedureContext} — Radiculopathy detected in chart note`
        : data.procedureContext;

      setResult({
        suggestions: data.suggestions,
        modifiers: data.modifiers,
        procedureContext: context,
        scannedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      setIsAnalyzing(false);
    }, 1200);
  }, [effectiveCptCode, chartNote]);

  const handleApplyCode = useCallback(
    (code: string) => {
      setAppliedCodes((prev) => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        return next;
      });
    },
    []
  );

  const handleApplyMod = useCallback(
    (mod: string) => {
      setAppliedMods((prev) => {
        const next = new Set(prev);
        if (next.has(mod)) next.delete(mod);
        else next.add(mod);
        return next;
      });
    },
    []
  );

  const handleApplyAll = useCallback(() => {
    if (!result) return;
    const allCodes = new Set(result.suggestions.filter((s) => s.currentCode !== s.suggestedCode).map((s) => s.suggestedCode));
    const allMods = new Set(result.modifiers.map((m) => m.modifier));
    setAppliedCodes(allCodes);
    setAppliedMods(allMods);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [result]);

  if (!isOpen) return null;

  // No active case and no props
  if (!activeCase && !cptCode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-status-green/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-blue/10">
                <Stethoscope size={20} className="text-accent-blue" />
              </div>
              <h2 className="text-lg font-semibold text-heading-navy">ICD-10 Specificity Booster</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
          <NoActiveCaseMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-blue/5 to-status-green/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/10">
              <Sparkles size={20} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">🎯 ICD-10 Specificity Booster</h2>
              <p className="text-xs text-text-secondary">Auto-enhance diagnosis codes &amp; CPT modifiers</p>
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

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                       bg-gradient-to-r from-accent-blue to-accent-blue/80
                       text-white text-sm font-bold
                       hover:brightness-110 transition-all duration-200 shadow-md
                       disabled:opacity-50 disabled:cursor-wait"
          >
            {isAnalyzing ? (
              <>
                <Sparkles size={14} className="animate-pulse" />
                Scanning chart for code optimization...
              </>
            ) : (
              <>
                <Stethoscope size={14} />
                🎯 Auto-Enhance Diagnosis &amp; Modifiers
              </>
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Procedure Context */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border-light">
                <AlertCircle size={14} className="text-accent-blue" />
                <span className="text-xs font-medium text-text-primary">
                  Procedure Context: <strong className="text-accent-blue">{result.procedureContext}</strong>
                </span>
                <span className="text-[10px] text-text-secondary/60 ml-auto">{result.scannedAt}</span>
              </div>

              {/* ICD-10 Code Suggestions */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-bg-navy text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-accent-gold" />
                  <h4 className="text-xs font-semibold">ICD-10 Diagnosis Code Suggestions</h4>
                </div>
                <div className="divide-y divide-border-light">
                  {result.suggestions.map((suggestion, idx) => {
                    const isUpgrade = suggestion.currentCode !== suggestion.suggestedCode;
                    const isApplied = appliedCodes.has(suggestion.suggestedCode);
                    return (
                      <div key={idx} className="px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Current */}
                          <div className="flex-1 min-w-0 p-2.5 rounded-lg bg-bg-secondary border border-border-light">
                            <span className="text-[9px] text-text-secondary block uppercase font-semibold mb-0.5">Current</span>
                            <span className="text-xs font-bold text-text-primary">{suggestion.currentCode}</span>
                            <span className="text-[10px] text-text-secondary block mt-0.5">{suggestion.currentDescription}</span>
                          </div>
                          {/* Arrow */}
                          <ArrowRight size={16} className="text-accent-blue flex-shrink-0" />
                          {/* Suggested */}
                          <div className="flex-1 min-w-0 p-2.5 rounded-lg bg-status-green/5 border border-status-green/30">
                            <span className="text-[9px] text-status-green block uppercase font-semibold mb-0.5">
                              Suggested {isUpgrade ? `(${suggestion.specificityGain})` : '(Adequate)'}
                            </span>
                            <span className="text-xs font-bold text-status-green">{suggestion.suggestedCode}</span>
                            <span className="text-[10px] text-text-secondary block mt-0.5">{suggestion.suggestedDescription}</span>
                          </div>
                        </div>
                        {/* Rationale */}
                        <p className="text-[10px] text-text-secondary leading-relaxed">{suggestion.rationale}</p>
                        {/* Apply button */}
                        {isUpgrade && (
                          <button
                            onClick={() => handleApplyCode(suggestion.suggestedCode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                              isApplied
                                ? 'bg-status-green/10 text-status-green border border-status-green/30'
                                : 'bg-accent-blue/10 text-accent-blue border border-accent-blue/25 hover:bg-accent-blue/20'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 size={12} />
                                Applied
                              </>
                            ) : (
                              <>
                                <Clipboard size={12} />
                                Apply {suggestion.suggestedCode}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CPT Modifier Suggestions */}
              <div className="rounded-xl border border-border-light overflow-hidden">
                <div className="px-4 py-3 bg-heading-navy text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-accent-gold" />
                  <h4 className="text-xs font-semibold">Required CPT Modifiers</h4>
                </div>
                <div className="divide-y divide-border-light">
                  {result.modifiers.map((mod, idx) => {
                    const isApplied = appliedMods.has(mod.modifier);
                    return (
                      <div key={idx} className="px-4 py-3 flex items-start gap-3">
                        {/* Modifier badge */}
                        <div
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold flex-shrink-0 ${
                            mod.required
                              ? 'bg-status-red/10 text-status-red border border-status-red/20'
                              : 'bg-accent-gold/10 text-heading-navy border border-accent-gold/20'
                          }`}
                        >
                          {mod.modifier}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-text-primary">{mod.name}</span>
                            {mod.required && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-status-red/10 text-status-red">
                                REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-secondary mt-1">{mod.rationale}</p>
                        </div>
                        <button
                          onClick={() => handleApplyMod(mod.modifier)}
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                            isApplied
                              ? 'bg-status-green/10 text-status-green border border-status-green/30'
                              : 'bg-accent-blue/10 text-accent-blue border border-accent-blue/25 hover:bg-accent-blue/20'
                          }`}
                        >
                          {isApplied ? <CheckCircle2 size={12} /> : 'Apply'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apply All Button */}
              <button
                onClick={handleApplyAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                           bg-gradient-to-r from-status-green to-status-green/80
                           text-white text-sm font-bold
                           hover:brightness-110 transition-all duration-200 shadow-md"
              >
                <CheckCircle2 size={16} />
                ✅ Apply All Suggested Codes &amp; Modifiers
              </button>
            </div>
          )}

          {/* Empty state */}
          {!result && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 p-4 rounded-full bg-bg-secondary border border-border-light">
                <Stethoscope size={36} className="text-text-secondary/30" />
              </div>
              <p className="text-sm text-text-secondary/60 max-w-xs">
                Click <strong>Auto-Enhance Diagnosis &amp; Modifiers</strong> to scan the chart for ICD-10 specificity upgrades and required CPT modifiers.
              </p>
            </div>
          )}

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-status-green text-white shadow-lg animate-in slide-in-from-right duration-300">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">All codes &amp; modifiers applied successfully!</span>
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
          {result && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-accent-blue hover:brightness-110 transition-all shadow-sm"
            >
              Re-Scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
