'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Shield, Lock, Circle, CheckCircle2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PortalStatus = 'operational' | 'slow' | 'down';

interface PayerPortal {
  id: string;
  name: string;
  url: string;
  status: PortalStatus;
  description: string;
  lastChecked: string;
}

// ---------------------------------------------------------------------------
// Simulated Portal Data
// ---------------------------------------------------------------------------

const PAYER_PORTALS: PayerPortal[] = [
  {
    id: 'availity',
    name: 'Availity',
    url: 'https://www.availity.com',
    status: 'operational',
    description: 'Multi-payer portal for eligibility, claims, and authorizations',
    lastChecked: '2 min ago',
  },
  {
    id: 'covermymeds',
    name: 'CoverMyMeds',
    url: 'https://www.covermymeds.com',
    status: 'operational',
    description: 'Electronic prior authorization for prescription medications',
    lastChecked: '1 min ago',
  },
  {
    id: 'carelon',
    name: 'Carelon (Legato)',
    url: 'https://www.carelon.com',
    status: 'slow',
    description: 'UM portal for Aetna/CVS — radiology, cardiology, oncology',
    lastChecked: '5 min ago',
  },
  {
    id: 'aim',
    name: 'AIM / Elevance',
    url: 'https://www.aimspecialtyhealth.com',
    status: 'operational',
    description: 'Specialty benefits management — Anthem/BCBS radiology & labs',
    lastChecked: '3 min ago',
  },
  {
    id: 'navinet',
    name: 'NaviNet',
    url: 'https://www.navinet.com',
    status: 'slow',
    description: 'Multi-payer provider portal — UHC, Cigna, Humana',
    lastChecked: '4 min ago',
  },
  {
    id: 'promptpa',
    name: 'PromptPA',
    url: 'https://www.promptpa.com',
    status: 'down',
    description: 'Automated prior auth platform — currently experiencing outage',
    lastChecked: 'Just now',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusDot(status: PortalStatus) {
  switch (status) {
    case 'operational':
      return { icon: Circle, className: 'text-status-green fill-status-green', label: 'Operational', labelClass: 'text-status-green bg-status-green/10' };
    case 'slow':
      return { icon: Circle, className: 'text-status-orange fill-status-orange', label: 'Slow', labelClass: 'text-status-orange bg-status-orange/10' };
    case 'down':
      return { icon: Circle, className: 'text-status-red fill-status-red', label: 'Down', labelClass: 'text-status-red bg-status-red/10' };
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PortalSSOVaultProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PortalSSOVault({ isOpen, onClose }: PortalSSOVaultProps) {
  const [launchedPortal, setLaunchedPortal] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleLaunch = (portal: PayerPortal) => {
    setLaunchedPortal(portal.name);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-bg-navy/5 to-accent-blue/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bg-navy/10">
              <span className="text-xl">🔑</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Portal SSO Credential Vault</h2>
              <p className="text-xs text-text-secondary">AES-256 encrypted multi-payer portal access hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Encryption Badge */}
        <div className="px-6 py-2.5 bg-bg-navy flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-status-green" />
            <span className="text-[10px] text-white font-medium uppercase tracking-wider">
              Credentials encrypted with AES-256
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={11} className="text-accent-gold" />
            <span className="text-[10px] text-accent-gold font-medium">SOC 2 Type II Compliant</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Portal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYER_PORTALS.map((portal) => {
              const status = getStatusDot(portal.status);
              const StatusIcon = status.icon;
              const isLaunched = launchedPortal === portal.name;

              return (
                <div
                  key={portal.id}
                  className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    isLaunched
                      ? 'border-accent-blue bg-accent-blue/5'
                      : 'border-border-light hover:border-bg-navy/30 bg-white hover:shadow-md'
                  }`}
                >
                  {/* Portal Card Top */}
                  <div className={`px-4 py-3 ${isLaunched ? 'bg-accent-blue/5' : 'bg-bg-navy/3'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-heading-navy">{portal.name}</h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.labelClass}`}>
                        <StatusIcon size={8} className={status.className} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed">{portal.description}</p>
                  </div>

                  {/* Portal Card Bottom */}
                  <div className="px-4 py-2.5 flex items-center justify-between border-t border-border-light">
                    <span className="text-[10px] text-text-secondary/60">
                      Last checked: {portal.lastChecked}
                    </span>
                    <button
                      onClick={() => handleLaunch(portal)}
                      disabled={portal.status === 'down'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                        portal.status === 'down'
                          ? 'bg-bg-secondary text-text-secondary/40 cursor-not-allowed'
                          : isLaunched
                            ? 'bg-status-green/10 text-status-green border border-status-green/20'
                            : 'bg-accent-blue text-white hover:brightness-110 shadow-sm'
                      }`}
                    >
                      {isLaunched ? (
                        <>
                          <CheckCircle2 size={11} />
                          Launched
                        </>
                      ) : (
                        <>
                          <ExternalLink size={11} />
                          Launch Portal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 rounded-xl border border-border-light overflow-hidden">
            <div className="px-4 py-3 bg-bg-navy/3 border-b border-border-light">
              <h3 className="text-xs font-semibold text-heading-navy">Portal Health Dashboard</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Circle size={10} className="text-status-green fill-status-green" />
                  <span className="text-2xl font-bold text-heading-navy">
                    {PAYER_PORTALS.filter((p) => p.status === 'operational').length}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary">Operational</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Circle size={10} className="text-status-orange fill-status-orange" />
                  <span className="text-2xl font-bold text-heading-navy">
                    {PAYER_PORTALS.filter((p) => p.status === 'slow').length}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary">Degraded</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Circle size={10} className="text-status-red fill-status-red" />
                  <span className="text-2xl font-bold text-heading-navy">
                    {PAYER_PORTALS.filter((p) => p.status === 'down').length}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary">Down</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-bg-navy text-white shadow-lg">
            <CheckCircle2 size={14} className="text-status-green" />
            <span className="text-xs font-medium">Launching {launchedPortal}...</span>
          </div>
        </div>
      )}
    </div>
  );
}
