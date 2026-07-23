'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, Activity, Power } from 'lucide-react';

interface SessionKeepAliveProps {
  compact?: boolean;
}

type ConnectionState = 'active' | 'pinging' | 'disconnected';

export default function SessionKeepAlive({ compact = false }: SessionKeepAliveProps) {
  const [enabled, setEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('active');
  const [pingCount, setPingCount] = useState(0);
  const [lastPingSeconds, setLastPingSeconds] = useState(0);
  const lastPingTime = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ping every 10 minutes (600,000ms) — using 10 seconds for demo visibility
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes in production

  const doPing = useCallback(() => {
    setConnectionState('pinging');
    setPingCount((prev) => prev + 1);
    lastPingTime.current = Date.now();

    // Simulate a ping with a brief delay
    setTimeout(() => {
      setConnectionState('active');
    }, 1500);
  }, []);

  useEffect(() => {
    if (enabled) {
      // Do initial ping
      doPing();

      intervalRef.current = setInterval(() => {
        doPing();
      }, PING_INTERVAL_MS);

      // Also update "last ping" display every second
      const ticker = setInterval(() => {
        setLastPingSeconds(
          Math.floor((Date.now() - lastPingTime.current) / 1000)
        );
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearInterval(ticker);
      };
    } else {
      setConnectionState('disconnected');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Still update the display
      const ticker = setInterval(() => {
        setLastPingSeconds(
          Math.floor((Date.now() - lastPingTime.current) / 1000)
        );
      }, 1000);
      return () => clearInterval(ticker);
    }
  }, [enabled, doPing]);

  const formatLastPing = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m ago`;
  };

  const stateIcon = {
    active: '🟢',
    pinging: '🟡',
    disconnected: '🔴',
  };

  const stateLabel = {
    active: 'Portal Session Active — Auto-refresh enabled',
    pinging: 'Pinging...',
    disconnected: 'Disconnected — Auto-refresh paused',
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Status Bar */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            connectionState === 'active'
              ? 'bg-status-green/10 border-status-green/30 text-status-green'
              : connectionState === 'pinging'
                ? 'bg-status-orange/10 border-status-orange/30 text-status-orange'
                : 'bg-status-red/10 border-status-red/30 text-status-red'
          }`}
        >
          <span>{stateIcon[connectionState]}</span>
          <span className="font-medium">{stateLabel[connectionState]}</span>
        </div>

        {/* Ping Info */}
        <div className="flex items-center justify-between text-[10px] text-text-secondary/60 px-1">
          <span>Last keep-alive: {formatLastPing(lastPingSeconds)}</span>
          <span>Pings: {pingCount}</span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setEnabled((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
            enabled
              ? 'bg-status-green/10 text-status-green border border-status-green/30'
              : 'bg-gray-100 text-text-secondary border border-border-light'
          }`}
        >
          <Power size={10} />
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-status-green/10">
            <Activity size={14} className="text-status-green" />
          </div>
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Portal Anti-Timeout Keep-Alive
          </h3>
        </div>
        {/* Toggle Switch */}
        <button
          onClick={() => setEnabled((prev) => !prev)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
            enabled ? 'bg-status-green' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
              enabled ? 'translate-x-4.5' : 'translate-x-1'
            }`}
            style={{
              transform: enabled ? 'translateX(16px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {/* Status Indicator */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
          connectionState === 'active'
            ? 'bg-status-green/5 border-status-green/20'
            : connectionState === 'pinging'
              ? 'bg-status-orange/5 border-status-orange/20'
              : 'bg-status-red/5 border-status-red/20'
        }`}
      >
        {/* Animated Heartbeat Line */}
        <div className="flex items-center gap-0.5 h-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                connectionState === 'active'
                  ? 'bg-status-green animate-pulse'
                  : connectionState === 'pinging'
                    ? 'bg-status-orange animate-pulse'
                    : 'bg-status-red'
              }`}
              style={{
                height: `${8 + Math.sin(i * 1.2) * 6}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span>{stateIcon[connectionState]}</span>
            <span
              className={`text-xs font-medium ${
                connectionState === 'active'
                  ? 'text-status-green'
                  : connectionState === 'pinging'
                    ? 'text-status-orange'
                    : 'text-status-red'
              }`}
            >
              {stateLabel[connectionState]}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-[10px] text-text-secondary/60 px-1">
        <div className="flex items-center gap-1">
          <Wifi size={10} className={connectionState === 'active' ? 'text-status-green' : 'text-status-red'} />
          <span>Last keep-alive: {formatLastPing(lastPingSeconds)}</span>
        </div>
        <span>Keep-alive pings sent: <strong className="text-text-primary">{pingCount}</strong></span>
      </div>

      {/* Interval Info */}
      <p className="text-[10px] text-text-secondary/40">
        Lightweight background ping every 10 minutes to prevent payer portal session timeouts.
      </p>
    </div>
  );
}
