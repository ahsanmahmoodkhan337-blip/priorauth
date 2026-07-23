'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2, BarChart3, DollarSign } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  bgColor: string;
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
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration, inView]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
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
  const stats: StatItem[] = [
    {
      icon: <DollarSign size={compact ? 12 : 14} />,
      label: 'Revenue-at-Risk Saved Today',
      value: 42500,
      prefix: '$',
      color: '#FAD23B',
      bgColor: '#FAD23B',
    },
    {
      icon: <Clock size={compact ? 12 : 14} />,
      label: 'Staff Hours Saved (Monthly)',
      value: 142,
      suffix: ' hrs/mo',
      color: '#1E5CD4',
      bgColor: '#1E5CD4',
    },
    {
      icon: <CheckCircle2 size={compact ? 12 : 14} />,
      label: 'PA Approval Rate',
      value: 94,
      suffix: '%',
      color: '#00E676',
      bgColor: '#00E676',
    },
    {
      icon: <BarChart3 size={compact ? 12 : 14} />,
      label: 'Cases Processed Today',
      value: 28,
      color: '#0D0F67',
      bgColor: '#0D0F67',
    },
  ];

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
            {/* Mini sparkline placeholder */}
            <div className="flex items-end justify-center gap-0.5 mt-1.5 h-4">
              {[40, 55, 35, 70, 50, 80, 65, 90].map((h, j) => (
                <div
                  key={j}
                  className="w-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    backgroundColor: stat.color,
                    opacity: 0.3 + (j / 8) * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
