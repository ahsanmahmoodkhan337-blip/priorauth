'use client';

import React from 'react';
import { FileWarning } from 'lucide-react';

/** Shared "no active case" empty state for modals and panels. */
export default function NoActiveCaseMessage({ variant = 'modal' }: { variant?: 'modal' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="mb-3 p-3 rounded-full bg-gray-50 border border-gray-200">
          <FileWarning size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-[#111827] mb-1">No active case selected</p>
        <p className="text-xs text-[#69727D] max-w-xs">
          Please select or create a case first to use this tool.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-8">
      <div className="mb-4 p-4 rounded-full bg-gray-50 border border-gray-200">
        <FileWarning size={36} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-[#111827] mb-2">No active case selected</h3>
      <p className="text-sm text-[#69727D] max-w-sm">
        Please select or create a case first to use this tool. You can choose a sample case or create a custom case from the sidebar.
      </p>
    </div>
  );
}
