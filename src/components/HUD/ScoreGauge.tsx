'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const GAUGE_SIZE = 200;
const STROKE_WIDTH = 10;
const RADIUS = 80;
const CENTER = GAUGE_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RISK_COLORS: Record<string, { arc: string; text: string; label: string }> = {
  Low: {
    arc: '#00E676',
    text: 'text-status-green',
    label: 'Low Risk',
  },
  Medium: {
    arc: '#FF9100',
    text: 'text-status-orange',
    label: 'Medium Risk',
  },
  High: {
    arc: '#FF1744',
    text: 'text-status-red',
    label: 'High Risk',
  },
};

function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 80) return 'Low';
  if (score >= 50) return 'Medium';
  return 'High';
}

export default function ScoreGauge({ score, riskLevel: riskLevelProp }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const riskLevel = riskLevelProp || getRiskLevel(score);
  const colors = RISK_COLORS[riskLevel];

  // Animate the displayed score counting up
  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });
    return () => controls.stop();
  }, [score]);

  // Animate the arc
  const progressMotion = useMotionValue(0);
  const strokeDashoffset = useTransform(
    progressMotion,
    [0, 100],
    [CIRCUMFERENCE, CIRCUMFERENCE * (1 - score / 100)]
  );

  useEffect(() => {
    const controls = animate(progressMotion, 100, {
      duration: 1.4,
      ease: 'easeInOut',
    });
    return () => controls.stop();
  }, [score, progressMotion]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Gauge */}
      <div className="relative" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
        <svg
          width={GAUGE_SIZE}
          height={GAUGE_SIZE}
          viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Glow shadow */}
          <defs>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Animated arc */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={colors.arc}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset }}
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-text-primary"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-text-secondary mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Risk Level Label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-col items-center gap-1.5"
      >
        <span
          className={`text-sm font-semibold ${colors.text}`}
        >
          {colors.label}
        </span>
        <span className="text-[10px] text-text-secondary">
          Approval Likelihood Score
        </span>
      </motion.div>
    </div>
  );
}
