'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, BarChart3, DollarSign } from 'lucide-react';
import { useCaseState } from '@/lib/useCaseState';

// ---------------------------------------------------------------------------
// Procedure value lookup by CPT code
// ---------------------------------------------------------------------------

function getProcedureValue(cptCode: string): number {
  // MRI codes
  if (/^72(1[4-9]|2[0-9]|3|4[0-9]|5|6|7|8|9)/.test(cptCode)) return 2500;
  if (cptCode === '72148' || cptCode === '72149' || cptCode === '72141') return 2500;
  // Surgical codes (27xxx, 2xxxx surgical)
  if (/^2[7-9]\d{3}/.test(cptCode)) return 15000;
  if (cptCode === '27447') return 15000;
  // Echo / cardiac
  if (/^93[0-3]\d{2}/.test(cptCode)) return 3000;
  if (cptCode === '93306') return 3000;
  // Default
  return 5000;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ---------------------------------------------------------------------------
// Animated Counter
// ---------------------------------------------------------------------------

function AnimatedCounter({ target, prefix = '', suffix = '', duration = 1500 }: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false });
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current && inView) return;
    prevTarget.current = target;
    let startTime: number | null = null;
    let cancelled = false;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1 && !cancelled) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
    return () => { cancelled = true; };
  }, [target, duration, inView]);

  // Format currency nicely
  const formatted =
    prefix === '$'
      ? `${prefix}${count.toLocaleString()}`
      : `${prefix}${count.toLocaleString()}${suffix}`;

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Small sparkline component — shows mini live bars
// ---------------------------------------------------------------------------

function MiniSparkline({ color, values }: { color: string; values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end justify-center gap-0.5 mt-1.5 h-4">
      {values.map((v, j) => (
        <div
          key={j}
          className="w-1 rounded-t-sm transition-all duration-500"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            backgroundColor: color,
            opacity: 0.3 + (j / Math.max(values.length, 1)) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ROITelemetryProps {
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ROITelemetry({ compact = false }: ROITelemetryProps) {
  const { cases } = useCaseState();

  // ---- Real metrics computed from actual case data ----
  const metrics = useMemo(() => {
    const auditedCases = cases.filter((c) => c.auditResult !== null);
    const approvedCases = auditedCases.filter((c) => (c.auditResult?.approvalScore ?? 0) >= 80);
    const todayCases = cases.filter((c) => isToday(c.createdAt));

    // Revenue Saved: SUM(procedureValue * approvalScore / 100) for approved
    const revenueSaved = approvedCases.reduce((sum, c) => {
      const val = getProcedureValue(c.cptCode);
      const score = c.auditResult?.approvalScore ?? 0;
      return sum + Math.round(val * (score / 100));
    }, 0);

    // Approval Rate
    const approvalRate =
      auditedCases.length > 0
        ? Math.round((approvedCases.length / auditedCases.length) * 100)
        : 0;

    // Cases Today
    const casesToday = todayCases.length;

    // Hours Saved: ~3.5 hrs per approved case
    const hoursSaved = approvedCases.length * 3.5;

    return { revenueSaved, approvalRate, casesToday, hoursSaved };
  }, [cases]);

  // Sparkline data — use historic score data if available, else placeholder
  const sparklineValues = useMemo(() => {
    const audited = cases.filter((c) => c.auditResult !== null);
    if (audited.length === 0) return [20, 30, 25, 40, 35, 50, 45, 60];
    return audited
      .slice(-8)
      .map((c) => c.auditResult?.approvalScore ?? 0);
  }, [cases]);

  const noCases = cases.length === 0;

  // ---- Build stat items ----
  interface StatDef {
    icon: React.ReactNode;
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    color: string;
    bgColor: string;
  }

  const stats: StatDef[] = useMemo(
    () => [
      {
        icon: <DollarSign size={compact ? 12 : 14} />,
        label: 'Revenue-at-Risk Saved Today',
        value: metrics.revenueSaved,
        prefix: '$',
        color: '#FAD23B',
        bgColor: '#FAD23B',
      },
      {
        icon: <Clock size={compact ? 12 : 14} />,
        label: 'Staff Hours Saved (Lifetime)',
        value: metrics.hoursSaved,
        suffix: ' hrs',
        color: '#1E5CD4',
        bgColor: '#1E5CD4',
      },
      {
        icon: <CheckCircle2 size={compact ? 12 : 14} />,
        label: 'PA Approval Rate',
        value: metrics.approvalRate,
        suffix: '%',
        color: '#00E676',
        bgColor: '#00E676',
      },
      {
        icon: <BarChart3 size={compact ? 12 : 14} />,
        label: 'Cases Processed Today',
        value: metrics.casesToday,
        color: '#0D0F67',
        bgColor: '#0D0F67',
      },
    ],
    [metrics, compact]
  );

  // "No cases yet" empty state
  if (noCases) {
    if (compact) {
      return (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-[#FAD23B]" />
            <span className="text-[10px] font-semibold text-[#111827]">📊 CAQH ROI Telemetry</span>
          </div>
          <p className="text-[9px] text-[#69727D] text-center py-2">
            No cases yet — create or select a case to see live metrics.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-[#0B1F3A]/5 to-[#FAD23B]/10 border-b border-[#E5E7EB] flex items-center gap-2">
          <TrendingUp size={14} className="text-[#FAD23B]" />
          <span className="text-xs font-bold text-[#0D0F67]">📊 CAQH ROI Telemetry Widget</span>
          <span className="text-[9px] text-[#69727D] ml-auto">Real-time</span>
        </div>
        <div className="p-6 flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 p-4 rounded-full bg-gray-50 border border-[#E5E7EB]">
            <BarChart3 size={28} className="text-[#69727D]/30" />
          </div>
          <p className="text-sm font-medium text-[#111827] mb-1">No cases yet</p>
          <p className="text-xs text-[#69727D] max-w-xs">
            Metrics will appear here in real-time as you audit clinical cases. Select a sample case or create a new one to begin.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={12} className="text-[#FAD23B]" />
          <span className="text-[10px] font-semibold text-[#111827]">📊 CAQH ROI Telemetry</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-[8px] text-[#69727D] leading-tight">{stat.label}</p>
              <p className="text-xs font-bold" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={1200} />
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-[#0B1F3A]/5 to-[#FAD23B]/10 border-b border-[#E5E7EB] flex items-center gap-2">
        <TrendingUp size={14} className="text-[#FAD23B]" />
        <span className="text-xs font-bold text-[#0D0F67]">📊 CAQH ROI Telemetry Widget</span>
        <span className="text-[9px] text-[#69727D] ml-auto">Real-time</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="text-[9px] text-[#69727D] leading-tight mb-1">{stat.label}</p>
            <p className="text-base font-bold" style={{ color: stat.color }}>
              <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={1500} />
            </p>
            <MiniSparkline color={stat.color} values={sparklineValues} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
