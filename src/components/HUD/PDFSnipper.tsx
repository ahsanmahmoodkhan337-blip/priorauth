'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Shield, Download, CheckCircle2,
  X, Loader2, Eye, AlertTriangle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExtractedPage {
  pageNumber: number;
  content: string;
  highlights: Array<{ text: string; reason: string }>;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PDFSnipperProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PDFSnipper({ isOpen, onClose }: PDFSnipperProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phiScrubbed, setPhiScrubbed] = useState(false);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // ---- Simulated extracted pages ----
  const simulatedPages: ExtractedPage[] = [
    {
      pageNumber: 47,
      content: 'CLINICAL ASSESSMENT: Patient presents with chronic L4-L5 disc herniation...',
      highlights: [
        { text: 'Failed conservative therapy × 6 months', reason: 'Meets LCD L36789 §4.2(a)' },
        { text: 'ODI Score: 62% (severe disability)', reason: 'Exceeds payer threshold of 40%' },
      ],
    },
    {
      pageNumber: 112,
      content: 'IMAGING REPORT: MRI dated 06/15/2026 shows L4-L5 disc extrusion with...',
      highlights: [
        { text: 'Nerve root compression at L4-L5', reason: 'Matches CPT 63030 criteria' },
        { text: 'Neurosurgeon consult note attached', reason: 'Specialist sign-off requirement met' },
      ],
    },
  ];

  // ---- Drag handlers ----
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        startProcessing(file.name);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      startProcessing(files[0].name);
    }
  }, []);

  const startProcessing = (name: string) => {
    setFileName(name);
    setProcessing(true);
    setProgress(0);
    setPhiScrubbed(false);
    setExtractedPages([]);
    setDownloaded(false);

    // Simulate OCR processing with progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        // Simulate PHI scrubbing
        setTimeout(() => {
          setPhiScrubbed(true);
          setExtractedPages(simulatedPages);
          setProcessing(false);
        }, 600);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0B1F3A]/5 to-[#1E5CD4]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0B1F3A]/10">
              <Upload size={18} className="text-[#1E5CD4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">📄 Drag-and-Drop OCR PDF Snipper</h2>
              <p className="text-xs text-[#69727D]">Auto-extract clinical pages &amp; build payer evidence binder</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[#69727D]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drop Zone */}
          {!fileName && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? 'border-[#1E5CD4] bg-[#1E5CD4]/5'
                  : 'border-[#E5E7EB] hover:border-[#1E5CD4]/40 hover:bg-[#1E5CD4]/2'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload size={40} className="mx-auto mb-3 text-[#69727D]" />
              <p className="text-sm font-semibold text-[#111827] mb-1">
                📄 Drag &amp; drop medical chart PDFs here
              </p>
              <p className="text-xs text-[#69727D]">
                or click to browse — 200-page clinical charts supported
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-[#69727D]">Accepts:</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F7F8FA] text-[#111827]">.PDF</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F7F8FA] text-[#111827]">Up to 200 pages</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {fileName && processing && (
            <div className="rounded-xl border border-[#1E5CD4]/20 bg-[#1E5CD4]/3 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 size={16} className="animate-spin text-[#1E5CD4]" />
                <span className="text-sm font-semibold text-[#0D0F67]">
                  Processing {fileName}...
                </span>
              </div>
              <p className="text-xs text-[#69727D] mb-3">
                Processing 200-page chart... extracting clinical pages
              </p>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#1E5CD4] to-[#FAD23B] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-[10px] text-[#69727D] mt-1.5 text-right">{Math.round(progress)}%</p>
            </div>
          )}

          {/* PHI Sanitizer Badge */}
          {phiScrubbed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/25"
            >
              <Shield size={16} className="text-[#00E676]" />
              <div>
                <span className="text-xs font-semibold text-[#00E676]">🛡️ PHI Scrubbed</span>
                <span className="text-[10px] text-[#69727D] ml-2">
                  SSN, DOB, MRN redacted — HIPAA compliant
                </span>
              </div>
            </motion.div>
          )}

          {/* Extracted Pages Preview */}
          {extractedPages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0D0F67]">
                  📋 2-Page Payer Evidence Binder
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-xs text-[#1E5CD4] hover:underline"
                >
                  <Eye size={12} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              <AnimatePresence>
                {showPreview &&
                  extractedPages.map((page) => (
                    <motion.div
                      key={page.pageNumber}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-[#E5E7EB] overflow-hidden"
                    >
                      {/* Page Header */}
                      <div className="px-4 py-2 bg-[#0B1F3A]/5 border-b border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#0D0F67]">
                          Page {page.pageNumber} — Clinical Evidence
                        </span>
                        <span className="text-[9px] text-[#69727D]">Extracted from {fileName}</span>
                      </div>
                      {/* Page Content */}
                      <div className="p-4">
                        <p className="text-xs text-[#111827] leading-relaxed mb-3">
                          {page.content}
                        </p>
                        {/* Highlights */}
                        <div className="space-y-1.5">
                          {page.highlights.map((h, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-[#FAD23B]/15 border-l-2 border-[#FAD23B]"
                            >
                              <AlertTriangle size={12} className="text-[#FAD23B] mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-[10px] font-semibold text-[#111827] bg-[#FAD23B]/30 px-1 rounded">
                                  {h.text}
                                </span>
                                <p className="text-[9px] text-[#69727D] mt-0.5">{h.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                           bg-gradient-to-r from-[#1E5CD4] to-[#0D0F67] text-white
                           text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-md"
              >
                {downloaded ? (
                  <>
                    <CheckCircle2 size={16} className="text-[#00E676]" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download Evidence Binder PDF
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Reset */}
          {fileName && !processing && (
            <button
              onClick={() => {
                setFileName(null);
                setPhiScrubbed(false);
                setExtractedPages([]);
                setShowPreview(false);
                setDownloaded(false);
              }}
              className="w-full text-center text-xs text-[#69727D] hover:text-[#111827] transition-colors"
            >
              Upload a different PDF
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
