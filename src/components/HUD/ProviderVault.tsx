'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Shield, Lock, User, Building2, Hash, FileText,
  Save, Zap, Eye, EyeOff, Copy, CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProviderCredential {
  id: string;
  providerName: string;
  renderingNpi: string;
  groupNpi: string;
  taxonomyCode: string;
  taxId: string;
  facilityPtan: string;
  stateLicense: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProviderVaultProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProviderVault({ isOpen, onClose }: ProviderVaultProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'payers'>('providers');
  const [showForm, setShowForm] = useState(false);
  const [maskedFields, setMaskedFields] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<ProviderCredential>({
    id: '',
    providerName: '',
    renderingNpi: '',
    groupNpi: '',
    taxonomyCode: '',
    taxId: '',
    facilityPtan: '',
    stateLicense: '',
  });

  const [providers, setProviders] = useState<ProviderCredential[]>([
    {
      id: 'prov-1',
      providerName: 'Dr. Sarah Chen, MD',
      renderingNpi: '1234567890',
      groupNpi: '0987654321',
      taxonomyCode: '207T00000X',
      taxId: '12-3456789',
      facilityPtan: 'PTAN-88421',
      stateLicense: 'CA-A123456',
    },
    {
      id: 'prov-2',
      providerName: 'Dr. James Wilson, DO',
      renderingNpi: '2345678901',
      groupNpi: '9876543210',
      taxonomyCode: '207X00000X',
      taxId: '98-7654321',
      facilityPtan: 'PTAN-77310',
      stateLicense: 'NY-B789012',
    },
  ]);

  const toggleMask = (field: string) => {
    setMaskedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    if (!form.providerName || !form.renderingNpi) return;
    setProviders((prev) => [...prev, { ...form, id: `prov-${Date.now()}` }]);
    setForm({
      id: '',
      providerName: '',
      renderingNpi: '',
      groupNpi: '',
      taxonomyCode: '',
      taxId: '',
      facilityPtan: '',
      stateLicense: '',
    });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAutoFill = () => {
    setForm({
      ...form,
      providerName: 'Dr. Sarah Chen, MD',
      renderingNpi: '1234567890',
      groupNpi: '0987654321',
      taxonomyCode: '207T00000X',
      taxId: '12-3456789',
      facilityPtan: 'PTAN-88421',
      stateLicense: 'CA-A123456',
    });
  };

  const maskValue = (value: string, key: string) => {
    if (maskedFields[key]) return value;
    if (value.length <= 4) return '••••';
    return '••••' + value.slice(-4);
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
              <Shield size={18} className="text-[#0B1F3A]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0D0F67]">🔑 Provider &amp; Facility Credentials Vault</h2>
              <p className="text-xs text-[#69727D]">AES-256 encrypted — Rendering NPI, Group NPI, PTAN, State Licenses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[#69727D]" />
          </button>
        </div>

        {/* Encryption Badge */}
        <div className="px-6 py-2.5 bg-[#0B1F3A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#00E676]" />
            <span className="text-[10px] text-white font-medium uppercase tracking-wider">
              Credentials encrypted with AES-256
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={11} className="text-[#FAD23B]" />
            <span className="text-[10px] text-[#FAD23B] font-medium">SOC 2 Type II Compliant</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'providers'
                ? 'text-[#1E5CD4] border-b-2 border-[#1E5CD4] bg-[#1E5CD4]/3'
                : 'text-[#69727D] hover:text-[#111827]'
            }`}
          >
            👨‍⚕️ Providers
          </button>
          <button
            onClick={() => setActiveTab('payers')}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'payers'
                ? 'text-[#1E5CD4] border-b-2 border-[#1E5CD4] bg-[#1E5CD4]/3'
                : 'text-[#69727D] hover:text-[#111827]'
            }`}
          >
            🏛️ Payers
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'providers' && (
            <>
              {/* Saved Providers */}
              {providers.map((prov) => (
                <div
                  key={prov.id}
                  className="rounded-xl border border-[#E5E7EB] overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-[#0B1F3A]/5 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#0D0F67]" />
                      <span className="text-xs font-semibold text-[#0D0F67]">{prov.providerName}</span>
                    </div>
                    <span className="text-[9px] text-[#1E5CD4] bg-[#1E5CD4]/10 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-[9px] text-[#69727D]">Rendering NPI</p>
                      <p className="text-[11px] font-mono font-semibold text-[#111827]">
                        {maskValue(prov.renderingNpi, prov.id + '-rnpi')}
                        <button onClick={() => toggleMask(prov.id + '-rnpi')} className="ml-1 text-[#69727D] hover:text-[#111827]">
                          {maskedFields[prov.id + '-rnpi'] ? <Eye size={10} className="inline" /> : <EyeOff size={10} className="inline" />}
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#69727D]">Group NPI</p>
                      <p className="text-[11px] font-mono font-semibold text-[#111827]">
                        {maskValue(prov.groupNpi, prov.id + '-gnpi')}
                        <button onClick={() => toggleMask(prov.id + '-gnpi')} className="ml-1 text-[#69727D] hover:text-[#111827]">
                          {maskedFields[prov.id + '-gnpi'] ? <Eye size={10} className="inline" /> : <EyeOff size={10} className="inline" />}
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#69727D]">Taxonomy Code</p>
                      <p className="text-[11px] font-mono text-[#111827]">{prov.taxonomyCode}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#69727D]">Tax ID</p>
                      <p className="text-[11px] font-mono text-[#111827]">{prov.taxId}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#69727D]">Facility PTAN</p>
                      <p className="text-[11px] font-mono font-semibold text-[#111827]">
                        {maskValue(prov.facilityPtan, prov.id + '-ptan')}
                        <button onClick={() => toggleMask(prov.id + '-ptan')} className="ml-1 text-[#69727D] hover:text-[#111827]">
                          {maskedFields[prov.id + '-ptan'] ? <Eye size={10} className="inline" /> : <EyeOff size={10} className="inline" />}
                        </button>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#69727D]">State License</p>
                      <p className="text-[11px] font-mono text-[#111827]">{prov.stateLicense}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Provider Form */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl border-2 border-[#1E5CD4]/30 bg-[#1E5CD4]/3 p-4 space-y-3"
                >
                  <h3 className="text-xs font-semibold text-[#0D0F67]">Add New Provider</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Provider Name *</label>
                      <input
                        value={form.providerName}
                        onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                        placeholder="Dr. Sarah Chen, MD"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Rendering NPI *</label>
                      <input
                        value={form.renderingNpi}
                        onChange={(e) => setForm({ ...form, renderingNpi: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Group NPI</label>
                      <input
                        value={form.groupNpi}
                        onChange={(e) => setForm({ ...form, groupNpi: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Taxonomy Code</label>
                      <input
                        value={form.taxonomyCode}
                        onChange={(e) => setForm({ ...form, taxonomyCode: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Tax ID</label>
                      <input
                        value={form.taxId}
                        onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">Facility PTAN</label>
                      <input
                        value={form.facilityPtan}
                        onChange={(e) => setForm({ ...form, facilityPtan: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#69727D] block mb-0.5">State License</label>
                      <input
                        value={form.stateLicense}
                        onChange={(e) => setForm({ ...form, stateLicense: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-[11px] rounded-md border border-[#E5E7EB] outline-none focus:border-[#1E5CD4]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E5CD4] text-white text-xs font-semibold hover:brightness-110 transition-all"
                    >
                      <Save size={12} />
                      Save Credentials
                    </button>
                    <button
                      onClick={handleAutoFill}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#69727D] text-xs font-medium hover:bg-[#F7F8FA] transition-all"
                    >
                      <Zap size={12} />
                      Auto-Fill
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg text-xs text-[#69727D] hover:text-[#111827]"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Add Button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                             border-2 border-dashed border-[#E5E7EB] text-[#69727D]
                             text-xs font-medium hover:border-[#1E5CD4] hover:text-[#1E5CD4] transition-all"
                >
                  <User size={14} />
                  + Add New Provider
                </button>
              )}

              {/* Save Confirmation Toast */}
              {saved && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] text-xs font-medium">
                  <CheckCircle2 size={12} />
                  Provider credentials saved &amp; encrypted
                </div>
              )}
            </>
          )}

          {activeTab === 'payers' && (
            <div className="text-center py-8">
              <Building2 size={32} className="mx-auto mb-2 text-[#69727D]/40" />
              <p className="text-sm text-[#69727D]">
                Payer portal credentials are managed in the{' '}
                <span className="text-[#1E5CD4] font-medium">Portal SSO Vault</span>
              </p>
              <p className="text-[10px] text-[#69727D]/60 mt-1">
                Open the Portal SSO Vault from the Prior Auth Command Center
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
