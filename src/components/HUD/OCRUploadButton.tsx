'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

const SAMPLE_CHART_NOTES: Record<string, string> = {
  'lumbar-mri':
    'PATIENT: 57-year-old male\nCHIEF COMPLAINT: Chronic low back pain radiating to right leg, 6+ months\nHISTORY: Failed conservative management including PT x 8 weeks, NSAIDs, epidural steroid injection x2 without lasting relief\nPHYSICAL EXAM: Positive straight leg raise at 40°, diminished right Achilles reflex, 4/5 strength right plantar flexion\nIMAGING: X-ray shows degenerative disc disease L4-L5, L5-S1. No prior MRI.\nASSESSMENT: Suspected L4-L5 or L5-S1 disc herniation with radiculopathy\nPLAN: MRI lumbar spine without contrast (CPT 72148)',
  'knee-arthroplasty':
    'PATIENT: 68-year-old female\nCHIEF COMPLAINT: Severe bilateral knee pain, right > left, 3+ years\nHISTORY: Progressively worsening OA. Failed conservative management: PT, corticosteroid injections, viscosupplementation. BMI 32.\nPHYSICAL EXAM: Varus deformity right knee, crepitus, painful ROM 5-90°, joint line tenderness\nIMAGING: X-ray bilateral knees: Kellgren-Lawrence grade 4 OA right knee, grade 3 left knee\nASSESSMENT: End-stage tricompartmental osteoarthritis right knee\nPLAN: Right total knee arthroplasty (CPT 27447)',
  'cardiac-echo':
    'PATIENT: 72-year-old male\nCHIEF COMPLAINT: Progressive dyspnea on exertion, orthopnea, bilateral ankle edema, 2 months\nHISTORY: Known CAD s/p PCI 2019, hypertension, type 2 DM. New onset DOE with 2-pillow orthopnea.\nPHYSICAL EXAM: BP 148/88, HR 92 regular, JVD elevated, bibasilar crackles, 2+ pitting edema bilateral\nLabs: BNP 1,200 pg/mL (elevated), troponin normal\nECG: Sinus tachycardia, non-specific ST-T changes\nASSESSMENT: New-onset heart failure with preserved EF suspected. Evaluate LV function and valvular pathology\nPLAN: Transthoracic echocardiogram complete (CPT 93306)',
};

interface OCRUploadButtonProps {
  onOCRComplete: (text: string, caseId?: string) => void;
  selectedCaseId?: string | null;
}

export default function OCRUploadButton({ onOCRComplete, selectedCaseId }: OCRUploadButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleClick = useCallback(() => {
    if (isSimulating) return;
    setIsSimulating(true);

    // Simulate OCR processing delay
    setTimeout(() => {
      // If a case is selected, use its sample note; otherwise use a generic one
      const text =
        selectedCaseId && SAMPLE_CHART_NOTES[selectedCaseId]
          ? SAMPLE_CHART_NOTES[selectedCaseId]
          : 'PATIENT: [OCR extracted]\nCHIEF COMPLAINT: Sample OCR result\nHISTORY: This is a simulated OCR extraction from uploaded chart image.\nPHYSICAL EXAM: Vital signs within normal limits.\nASSESSMENT: Simulated clinical note for demonstration purposes.\nPLAN: Pending evaluation.';

      onOCRComplete(text, selectedCaseId ?? undefined);
      setIsSimulating(false);
    }, 1500);
  }, [isSimulating, onOCRComplete, selectedCaseId]);

  return (
    <button
      onClick={handleClick}
      disabled={isSimulating}
      className="w-full glass-card px-4 py-3 flex items-center gap-3
                 border-accent-cyan/20 hover:border-accent-cyan/40
                 transition-all duration-200 group disabled:opacity-70"
    >
      <div className="relative flex-shrink-0">
        <motion.div
          animate={
            isSimulating
              ? {
                  scale: [1, 1.15, 1],
                  opacity: [1, 0.6, 1],
                  rotate: [0, 0, 0],
                }
              : {}
          }
          transition={
            isSimulating
              ? { duration: 0.8, repeat: Infinity }
              : {}
          }
          className="p-1.5 rounded-md bg-accent-cyan/10"
        >
          <Upload size={16} className="text-accent-cyan" />
        </motion.div>
        {isSimulating && (
          <motion.div
            className="absolute inset-0 rounded-md"
            animate={{ boxShadow: ['0 0 0px rgba(0,229,255,0)', '0 0 16px rgba(0,229,255,0.4)', '0 0 0px rgba(0,229,255,0)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
          {isSimulating ? 'Processing OCR...' : 'Upload Chart Image (OCR Simulated)'}
        </p>
        <p className="text-[10px] text-text-secondary mt-0.5">
          {isSimulating
            ? 'Extracting clinical text from image...'
            : selectedCaseId
              ? `Will pre-load sample note for selected case`
              : 'Simulated OCR extraction from uploaded chart'}
        </p>
      </div>

      <FileText size={14} className="text-text-secondary group-hover:text-accent-cyan transition-colors flex-shrink-0" />
    </button>
  );
}
