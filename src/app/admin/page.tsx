'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, EyeOff, Eye, ArrowLeft, LogOut,
  CheckCircle2, Inbox,
} from 'lucide-react';
import { getAccessRequests, updateAccessRequest } from '@/lib/accessRequests';

interface AccessRequest {
  id: string; fullName: string; phone: string; email: string;
  paymentMethod: string; transactionId: string; receiptSent: boolean;
  status: string; submittedAt: string; approvedAt?: string; expiresAt?: string; accessDurationDays?: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [shake, setShake] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_authenticated') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const loadRequests = useCallback(() => {
    setRequests(getAccessRequests());
  }, []);

  useEffect(() => { if (authenticated) loadRequests(); }, [authenticated]);

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
  }, []);

  const handleApprove = useCallback((req: AccessRequest) => {
    const days = 7;
    const exp = new Date(); exp.setDate(exp.getDate() + days);
    updateAccessRequest(req.id, { status: 'approved', approvedAt: new Date().toISOString(), expiresAt: exp.toISOString(), accessDurationDays: days });
    loadRequests();
    setSuccessMessage(`Approved: ${req.fullName}. Expires: ${exp.toLocaleDateString()}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  }, []);

  const handleReject = useCallback((id: string) => {
    updateAccessRequest(id, { status: 'rejected' });
    loadRequests();
  }, []);

  const pending = requests.filter(r => r.status === 'pending');
  const approved = requests.filter(r => r.status === 'approved');
  const rejected = requests.filter(r => r.status === 'rejected');

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <motion.div animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}} className="w-full max-w-md mx-4">
          <div className="glass-card p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 rounded-full bg-accent-blue/10 mb-4"><ShieldCheck size={28} className="text-accent-blue" /></div>
              <h1 className="text-xl font-bold text-heading-navy">Admin Panel</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input type={showKey ? 'text' : 'password'} value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Access key" className="w-full px-4 py-2.5 rounded-lg border border-border-light bg-bg-secondary text-sm" />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-2.5">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {authError && <p className="text-status-red text-xs">Invalid key</p>}
              <button type="submit" className="w-full py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium">Login</button>
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
          <span>Admin Dashboard</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20"><LogOut size={12} /> Logout</button>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 text-sm">
          <div className="px-4 py-2 rounded-lg bg-white border">Pending: {pending.length}</div>
          <div className="px-4 py-2 rounded-lg bg-white border">Approved: {approved.length}</div>
          <div className="px-4 py-2 rounded-lg bg-white border">Rejected: {rejected.length}</div>
          <button onClick={loadRequests} className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm">Refresh</button>
        </div>

        {requests.length === 0 ? (
          <div className="glass-card p-12 text-center"><Inbox size={40} className="mx-auto text-text-secondary/40 mb-3" /><h3 className="text-lg font-semibold">No access requests yet</h3></div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="font-medium text-sm">{req.fullName}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${req.status === 'approved' ? 'bg-status-green/10 text-status-green' : req.status === 'rejected' ? 'bg-status-red/10 text-status-red' : 'bg-accent-gold/10 text-accent-gold'}`}>{req.status}</span>
                  <div className="text-xs text-text-secondary mt-1">{req.phone} | {req.paymentMethod} | TXN: {req.transactionId}</div>
                  <div className="text-[10px] text-text-secondary/60">{new Date(req.submittedAt).toLocaleDateString()}{req.expiresAt ? ` | Expires: ${new Date(req.expiresAt).toLocaleDateString()}` : ''}</div>
                </div>
                <div className="flex gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(req)} className="px-3 py-1 rounded bg-status-green/10 text-status-green text-xs font-medium">Approve 7 days</button>
                      <button onClick={() => handleReject(req.id)} className="px-3 py-1 rounded bg-status-red/10 text-status-red text-xs font-medium">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {successMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-status-green text-white text-xs font-medium shadow-lg flex items-center gap-2 z-50">
            <CheckCircle2 size={14} /> {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
