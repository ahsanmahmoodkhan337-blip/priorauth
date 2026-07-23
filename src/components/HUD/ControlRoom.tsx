'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Building2, TrendingUp, Users, Clock,
  DollarSign, BarChart3, ChevronDown, Calendar,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Practice {
  id: string;
  name: string;
  activePAs: number;
  revenueAtRisk: number;
  staffHoursSaved: number;
  approvalRate: number;
  casesToday: number;
  topPayer: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ControlRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PRACTICES: Practice[] = [
  {
    id: 'p1',
    name: 'Metropolitan Orthopedics',
    activePAs: 42,
    revenueAtRisk: 385000,
    staffHoursSaved: 68,
    approvalRate: 93,
    casesToday: 12,
    topPayer: 'Aetna',
  },
  {
    id: 'p2',
    name: 'Valley Spine & Pain Center',
    activePAs: 28,
    revenueAtRisk: 215000,
    staffHoursSaved: 41,
    approvalRate: 88,
    casesToday: 8,
    topPayer: 'BCBS',
  },
  {
    id: 'p3',
    name: 'Harbor Cardiac Associates',
    activePAs: 35,
    revenueAtRisk: 520000,
    staffHoursSaved: 33,
    approvalRate: 96,
    casesToday: 15,
    topPayer: 'UHC',
  },
  {
    id: 'p4',
    name: 'Summit Neurology Group',
    activePAs: 19,
    revenueAtRisk: 142000,
    staffHoursSaved: 22,
    approvalRate: 91,
    casesToday: 5,
    topPayer: 'Cigna',
  },
];

export default function ControlRoom({ isOpen, onClose }: ControlRoomProps) {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const totals = {
    activePAs: PRACTICES.reduce((s, p) => s + p.activePAs, 0),
    revenueAtRisk: PRACTICES.reduce((s, p) => s + p.revenueAtRisk, 0),
    staffHoursSaved: PRACTICES.reduce((s, p) => s + p.staffHoursSaved, 0),
    approvalRate: Math.round(PRACTICES.reduce((s, p) => s + p.approvalRate, 0) / PRACTICES.length),
    casesToday: PRACTICES.reduce((s, p) => s + p.casesToday, 0),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0B1F3A]/5 to-[#1E5CD4]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0B1F3A]/10">
              <Building2 size={18} className="text-[#0B1F3A]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">🏢 Multi-Practice Control Room</h2>
              <p className="text-xs text-[#69727D]">Aggregated prior auth oversight across all practice locations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Date Range */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none px-3 py-1.5 pr-8 rounded-lg border border-[#E5E7EB] text-[10px] font-medium text-[#111827] bg-[#F7F8FA] outline-none cursor-pointer"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Year to Date</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#69727D] pointer-events-none" />
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
              <X size={18} className="text-[#69727D]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Aggregate Stats Bar */}
          <div className="grid grid-cols-5 gap-3">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-center">
              <FileIcon />
              <p className="text-[9px] text-[#69727D] mt-1">Active PAs</p>
              <p className="text-lg font-bold text-[#0D0F67]">{totals.activePAs}</p>
            </div>
            <div className="rounded-xl border border-[#FAD23B]/30 bg-[#FAD23B]/5 p-3 text-center">
              <DollarSign size={16} className="mx-auto text-[#FAD23B]" />
              <p className="text-[9px] text-[#69727D] mt-1">Revenue at Risk</p>
              <p className="text-sm font-bold text-[#FAD23B]">
                ${(totals.revenueAtRisk / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-center">
              <Clock size={16} className="mx-auto text-[#1E5CD4]" />
              <p className="text-[9px] text-[#69727D] mt-1">Hours Saved</p>
              <p className="text-lg font-bold text-[#0D0F67]">{totals.staffHoursSaved}</p>
            </div>
            <div className="rounded-xl border border-[#00E676]/30 bg-[#00E676]/5 p-3 text-center">
              <TrendingUp size={16} className="mx-auto text-[#00E676]" />
              <p className="text-[9px] text-[#69727D] mt-1">Approval Rate</p>
              <p className="text-lg font-bold text-[#00E676]">{totals.approvalRate}%</p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-center">
              <BarChart3 size={16} className="mx-auto text-[#1E5CD4]" />
              <p className="text-[9px] text-[#69727D] mt-1">Cases Today</p>
              <p className="text-lg font-bold text-[#0D0F67]">{totals.casesToday}</p>
            </div>
          </div>

          {/* Per-Practice Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-[#0D0F67] mb-3">Practice Breakdown</h3>
            <div className="space-y-3">
              {PRACTICES.map((practice, i) => (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#0B1F3A]/10">
                        <Building2 size={14} className="text-[#0B1F3A]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0D0F67]">{practice.name}</p>
                        <p className="text-[9px] text-[#69727D]">Top Payer: {practice.topPayer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[8px] text-[#69727D]">Active PAs</p>
                        <p className="text-xs font-bold text-[#111827]">{practice.activePAs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-[#69727D]">Revenue at Risk</p>
                        <p className="text-xs font-bold text-[#FAD23B]">
                          ${(practice.revenueAtRisk / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-[#69727D]">Hours Saved</p>
                        <p className="text-xs font-bold text-[#1E5CD4]">{practice.staffHoursSaved}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-[#69727D]">Approval</p>
                        <p className="text-xs font-bold text-[#00E676]">{practice.approvalRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-[#69727D]">Today</p>
                        <p className="text-xs font-bold text-[#111827]">{practice.casesToday}</p>
                      </div>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1 bg-[#F7F8FA]">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E5CD4] to-[#FAD23B] rounded-r-full"
                      style={{ width: `${practice.approvalRate}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Small helper component for aggregate stat icons
function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="#1E5CD4" strokeWidth="1.2" fill="none" />
      <line x1="5" y1="5" x2="11" y2="5" stroke="#1E5CD4" strokeWidth="0.8" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="#1E5CD4" strokeWidth="0.8" />
      <line x1="5" y1="11" x2="9" y2="11" stroke="#1E5CD4" strokeWidth="0.8" />
    </svg>
  );
}
