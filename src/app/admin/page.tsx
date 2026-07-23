'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, Shield, EyeOff, Eye, ArrowLeft, LogOut,
  CheckCircle2, XCircle, Clock, Filter, AlertCircle, Inbox, CalendarClock, X, ChevronDown,
} from 'lucide-react';

interface AccessRequest {
  id: string; fullName: string; phone: string; email: string;
  paymentMethod: 'bank-islami' | 'easypaisa' | 'paypal';
  transactionId: string; receiptSent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; approvedAt?: string; expiresAt?: string; accessDurationDays?: number;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [shake, setShake] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [customDays, setCustomDays] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_authenticated') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
        setDebug(`Loaded ${Array.isArray(data) ? data.length : 0} requests`);
      } else {
        setDebug('API error: ' + res.status);
      }
    } catch (e: any) {
      setDebug('Fetch error: ' + e.message);
    }
  }, []);

  useEffect(() => { if (authenticated) { loadRequests(); } }, [authenticated]);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'Khankhail@1122') {
      localStorage.setItem('admin_authenticated', 'true');
      setAuthenticated(true); setAuthError(false);
    } else { setAuthError(true); setShake(true); setTimeout(() => setShake(false), 500); }
  }, [accessKey]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_authenticated');
    setAuthenticated(false); setAccessKey(''); setAuthError(false);
    setApprovingId(null); setRejectingId(null);
  }, []);

  const handleApprove = useCallback(async (req: AccessRequest) => {
    const days = durationDays === -1 ? parseInt(customDays, 10) || 7 : durationDays;
    if (durationDays === -1 && (!customDays || parseInt(customDays, 10) < 1)) return;
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: req.id, status: 'approved', accessDurationDays: days }),
      });
      if (res.ok) {
        const data = await res.json();
        loadRequests(); setApprovingId(null); setDurationDays(7); setCustomDays('');
        const d = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        setSuccessMessage(`Approved: ${req.fullName} (${req.phone}). Expires: ${d}`);
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    } catch {}
  }, [durationDays, customDays]);

  const handleReject = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      if (res.ok) { loadRequests(); setRejectingId(null); }
    } catch {}
  }, []);

  const filtered = requests.filter((r) => statusFilter === 'all' || r.status === statusFilter);
  const counts = {
    all: requests.length, pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length, rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <motion.div animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className="w-full max-w-md mx-4">
          <div className="glass-card p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 rounded-full bg-accent-blue/10 mb-4"><ShieldCheck size={28} className="text-accent-blue" /></div>
              <h1 className="text-xl font-bold text-heading-navy">Admin Panel</h1>
              <p className="text-xs text-text-secondary mt-1">Healthcare Hustlers — PriorAuth AI Management</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Admin Access Key</label>
                <div className="relative">
                  <input type={showKey ? 'text' : 'password'} value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Enter access key" className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-bg-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {authError && <p className="text-status-red text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> Invalid access key</p>}
              </div>
              <button type="submit" className="w-full py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/90 transition-colors">Login</button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-heading-navy text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-white/60 hover:text-white flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
          <span className="font-medium">Admin Dashboard</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20"><LogOut size={12} /> Logout</button>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {debug && <div className="mb-4 p-3 rounded-lg bg-heading-navy/5 border border-heading-navy/10 text-xs">{debug}</div>}
        <h2 className="text-lg font-bold text-heading-navy mb-4">Student Access Requests</h2>
        
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? 'bg-accent-blue text-white' : 'bg-bg-secondary text-text-secondary hover:bg-border-light'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        {counts.all === 0 ? (
          <div className="glass-card p-12 text-center">
            <Inbox size={40} className="mx-auto text-text-secondary/40 mb-3" />
            <h3 className="text-lg font-semibold text-text-primary/60 mb-2">No access requests yet</h3>
            <p className="text-sm text-text-secondary/60">Student submissions from the landing page will appear here for review.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-text-secondary">No {statusFilter} requests.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((req) => (
              <div key={req.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-text-primary">{req.fullName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.status === 'approved' ? 'bg-status-green/10 text-status-green' : req.status === 'rejected' ? 'bg-status-red/10 text-status-red' : 'bg-accent-gold/10 text-accent-gold'}`}>{req.status}</span>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">{req.phone} | {req.email || 'No email'} | {req.paymentMethod} | TXN: {req.transactionId}</div>
                  <div className="text-[10px] text-text-secondary/60 mt-0.5">Submitted: {formatDate(req.submittedAt)}{req.approvedAt ? ` | Approved: ${formatDate(req.approvedAt)}` : ''}{req.expiresAt ? ` | Expires: ${formatDate(req.expiresAt)}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      {approvingId === req.id ? (
                        <div className="flex items-center gap-1">
                          <select value={durationDays} onChange={(e) => setDurationDays(parseInt(e.target.value))} className="text-xs px-2 py-1 rounded border border-border-light bg-bg-secondary">
                            <option value={1}>1 day</option><option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={-1}>Custom</option>
                          </select>
                          {durationDays === -1 && <input type="number" value={customDays} onChange={(e) => setCustomDays(e.target.value)} placeholder="Days" className="text-xs w-16 px-2 py-1 rounded border border-border-light bg-bg-secondary" />}
                          <button onClick={() => handleApprove(req)} className="px-3 py-1 rounded bg-status-green text-white text-xs font-medium">Confirm</button>
                          <button onClick={() => setApprovingId(null)} className="px-2 py-1 rounded text-text-secondary text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setApprovingId(req.id)} className="px-3 py-1 rounded bg-status-green/10 text-status-green text-xs font-medium hover:bg-status-green/20">Approve</button>
                      )}
                      {rejectingId === req.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-status-red">Reject?</span>
                          <button onClick={() => handleReject(req.id)} className="px-3 py-1 rounded bg-status-red text-white text-xs font-medium">Yes</button>
                          <button onClick={() => setRejectingId(null)} className="px-2 py-1 rounded text-text-secondary text-xs">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setRejectingId(req.id)} className="px-3 py-1 rounded bg-status-red/10 text-status-red text-xs font-medium hover:bg-status-red/20">Reject</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {successMessage && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-status-green text-white text-xs font-medium shadow-lg flex items-center gap-2 z-50">
              <CheckCircle2 size={14} /> {successMessage}
            </motion.div>
          </AnimatePresence>
        )}
        
        <div className="mt-4 text-center">
          <button onClick={loadRequests} className="text-xs text-accent-blue hover:underline">🔄 Refresh</button>
        </div>
      </div>
    </div>
  );
}
