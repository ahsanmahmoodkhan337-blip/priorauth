'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck,
  Shield,
  EyeOff,
  Eye,
  ArrowLeft,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  AlertCircle,
  Inbox,
  CalendarClock,
  X,
  ChevronDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (mirror server-side AccessRequest)
// ---------------------------------------------------------------------------

interface AccessRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: 'bank-islami' | 'easypaisa' | 'paypal';
  transactionId: string;
  receiptSent: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  accessDurationDays?: number;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

// ---------------------------------------------------------------------------
// Admin Panel Component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  // -- Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [shake, setShake] = useState(false);

  // -- Data state
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  // -- Action state
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [customDays, setCustomDays] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // -- Check localStorage on mount for existing auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin_authenticated');
      if (stored === 'true') {
        setAuthenticated(true);
      }
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // Silently fail — keep old data if available
    }
  }, []);

  // -- Load requests when authenticated
  useEffect(() => {
    if (authenticated) {
      loadRequests();
    }
  }, [authenticated, loadRequests]);

  // -- Auto-refresh every 5 seconds
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [authenticated, loadRequests]);

  // -- Handle login
  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (accessKey === 'Khankhail@1122') {
        localStorage.setItem('admin_authenticated', 'true');
        setAuthenticated(true);
        setAuthError(false);
      } else {
        setAuthError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    },
    [accessKey]
  );

  // -- Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
    setAccessKey('');
    setAuthError(false);
    setApprovingId(null);
    setRejectingId(null);
  }, []);

  // -- Handle approve
  const handleApprove = useCallback(
    async (req: AccessRequest) => {
      const days =
        durationDays === -1
          ? parseInt(customDays, 10) || 7
          : durationDays;

      if (durationDays === -1 && (!customDays || parseInt(customDays, 10) < 1)) {
        return;
      }

      try {
        const res = await fetch('/api/admin/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: req.id,
            status: 'approved',
            accessDurationDays: days,
          }),
        });

        if (res.ok) {
          const data = await res.json();

          loadRequests();
          setApprovingId(null);
          setDurationDays(7);
          setCustomDays('');

          const expiryDate = new Date(data.request.expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          setSuccessMessage(
            `Access approved for ${req.fullName} (${req.phone}). Expires: ${expiryDate}`
          );
          setTimeout(() => setSuccessMessage(null), 6000);
        }
      } catch {
        // Error handled silently
      }
    },
    [durationDays, customDays, loadRequests]
  );

  // -- Handle reject
  const handleReject = useCallback(
    async (id: string) => {
      try {
        const res = await fetch('/api/admin/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'rejected' }),
        });

        if (res.ok) {
          loadRequests();
          setRejectingId(null);
        }
      } catch {
        // Error handled silently
      }
    },
    [loadRequests]
  );

  // -- Filter logic
  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const filterCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  // ===========================================================================
  // RENDER: Login Screen
  // ===========================================================================
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-border-light shadow-xl p-8">
            {/* Shield Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
                <ShieldCheck size={36} className="text-accent-gold" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-heading-navy text-center mb-1">
              Admin Panel
            </h1>
            <p className="text-sm text-text-secondary text-center mb-8">
              Healthcare Hustlers — PriorAuth AI Management
            </p>

            {/* Login Form */}
            <form onSubmit={handleLogin} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="accessKey"
                  className="block text-sm font-medium text-heading-navy mb-1.5"
                >
                  Admin Access Key
                </label>
                <div className="relative">
                  <input
                    id="accessKey"
                    type={showKey ? 'text' : 'password'}
                    value={accessKey}
                    onChange={(e) => {
                      setAccessKey(e.target.value);
                      if (authError) setAuthError(false);
                    }}
                    placeholder="Enter admin access key"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-text-primary
                                bg-white placeholder:text-text-secondary/40
                                focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                                transition-all duration-200
                                ${authError ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message with Shake */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: shake ? [0, -10, 10, -10, 10, -5, 5, 0] : 0 }}
                    transition={{ x: { duration: 0.4 } }}
                    className="mb-4 p-3 rounded-lg bg-status-red/5 border border-status-red/20 flex items-center gap-2"
                  >
                    <AlertCircle size={16} className="text-status-red flex-shrink-0" />
                    <p className="text-sm text-status-red font-medium">Invalid access key</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm
                           hover:bg-accent-blue/90 transition-all duration-200
                           shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30
                           active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Shield size={18} />
                Login
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===========================================================================
  // RENDER: Admin Dashboard
  // ===========================================================================
  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* ---- Success Toast ---- */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl bg-status-green/10 border border-status-green/30 flex items-center gap-3 shadow-lg"
          >
            <CheckCircle2 size={20} className="text-status-green flex-shrink-0" />
            <p className="text-sm font-medium text-text-primary pr-6">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="absolute top-2 right-2 text-text-secondary hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Header Bar ---- */}
      <header className="bg-white border-b border-border-light sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                <ShieldCheck size={22} className="text-accent-gold" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-heading-navy">Admin Dashboard</h1>
                <p className="text-[11px] text-text-secondary">
                  Manage student access requests
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-xs font-medium text-text-secondary hover:text-accent-blue transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                           text-xs font-medium text-status-red bg-status-red/5
                           hover:bg-status-red/10 transition-all duration-200"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Main Content ---- */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ---- Status Filter Tabs ---- */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter size={16} className="text-text-secondary mr-1" />
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              statusFilter === filter
                                ? filter === 'all'
                                  ? 'bg-heading-navy text-white shadow-md'
                                  : filter === 'pending'
                                  ? 'bg-accent-gold text-heading-navy shadow-md'
                                  : filter === 'approved'
                                  ? 'bg-status-green text-white shadow-md'
                                  : 'bg-status-red text-white shadow-md'
                                : 'bg-white text-text-secondary border border-border-light hover:border-accent-blue/30'
                            }`}
              >
                <span className="capitalize">{filter}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                              ${
                                statusFilter === filter
                                  ? 'bg-white/20'
                                  : 'bg-bg-secondary'
                              }`}
                >
                  {filterCounts[filter]}
                </span>
              </button>
            )
          )}
        </div>

        {/* ---- Empty State ---- */}
        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border-light p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-secondary flex items-center justify-center">
              <Inbox size={30} className="text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-heading-navy mb-2">
              No access requests yet
            </h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'Student submissions from the landing page will appear here for review.'
                : statusFilter === 'approved'
                ? 'No access requests have been approved yet.'
                : statusFilter === 'rejected'
                ? 'No access requests have been rejected.'
                : 'Student submissions from the landing page will appear here.'
              }
            </p>
          </motion.div>
        )}

        {/* ---- Requests List ---- */}
        {filteredRequests.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3.5 bg-bg-secondary border-b border-border-light">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Student
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Phone (Login ID)
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Email
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Payment
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Transaction ID
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Status
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Actions
                </span>
              </div>

              {/* Table Body */}
              {filteredRequests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                  className={`md:grid md:grid-cols-7 gap-4 px-6 py-4 border-b border-border-light last:border-b-0
                              hover:bg-bg-secondary/50 transition-colors`}
                >
                  {/* Student Name */}
                  <div className="flex flex-col md:block mb-2 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Student
                    </span>
                    <span className="text-sm font-semibold text-heading-navy">
                      {req.fullName}
                    </span>
                    <span className="text-[11px] text-text-secondary md:hidden">
                      {new Date(req.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col md:block mb-2 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Phone (Login ID)
                    </span>
                    <span className="text-sm text-text-primary font-mono">
                      {req.phone}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col md:block mb-2 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Email
                    </span>
                    <span className="text-sm text-text-primary truncate block">
                      {req.email || '—'}
                    </span>
                  </div>

                  {/* Payment */}
                  <div className="flex flex-col md:block mb-2 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Payment
                    </span>
                    <span className="text-sm text-text-primary capitalize">
                      {req.paymentMethod === 'bank-islami'
                        ? 'Bank Islami'
                        : req.paymentMethod === 'easypaisa'
                        ? 'EasyPaisa'
                        : 'PayPal'}
                    </span>
                    <span className="text-[11px] text-text-secondary block">
                      Receipt: {req.receiptSent ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {/* Transaction ID */}
                  <div className="flex flex-col md:block mb-2 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Transaction ID
                    </span>
                    <span className="text-xs text-text-primary font-mono break-all">
                      {req.transactionId}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col md:block mb-3 md:mb-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:hidden mb-0.5">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
                                  ${
                                    req.status === 'approved'
                                      ? 'bg-status-green/10 text-status-green'
                                      : req.status === 'rejected'
                                      ? 'bg-status-red/10 text-status-red'
                                      : 'bg-accent-gold/10 text-accent-gold'
                                  }`}
                    >
                      {req.status === 'approved' ? (
                        <CheckCircle2 size={12} />
                      ) : req.status === 'rejected' ? (
                        <XCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      <span className="capitalize">{req.status}</span>
                    </span>
                    {req.status === 'approved' && req.expiresAt && (
                      <span className="text-[10px] text-text-secondary block mt-1">
                        Expires:{' '}
                        {new Date(req.expiresAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setApprovingId(approvingId === req.id ? null : req.id);
                            setRejectingId(null);
                            setDurationDays(7);
                            setCustomDays('');
                          }}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                     bg-status-green/10 text-status-green
                                     hover:bg-status-green hover:text-white
                                     transition-all duration-200 flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectingId(rejectingId === req.id ? null : req.id)
                          }
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                     bg-status-red/10 text-status-red
                                     hover:bg-status-red hover:text-white
                                     transition-all duration-200 flex items-center gap-1"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}
                    {req.status !== 'pending' && (
                      <span className="text-[11px] text-text-secondary italic">
                        {req.status === 'approved' ? 'Access granted' : 'Request denied'}
                      </span>
                    )}
                  </div>

                  {/* ---- Inline Approve Form ---- */}
                  <AnimatePresence>
                    {approvingId === req.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:col-span-7 overflow-hidden"
                      >
                        <div className="mt-3 p-4 rounded-xl bg-status-green/3 border border-status-green/20">
                          <p className="text-sm font-semibold text-heading-navy mb-3">
                            Set Access Duration
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {[1, 3, 7, 14, 30].map((days) => (
                              <button
                                key={days}
                                onClick={() => {
                                  setDurationDays(days);
                                  setCustomDays('');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                                            ${
                                              durationDays === days && customDays === ''
                                                ? 'bg-accent-blue text-white shadow-md'
                                                : 'bg-white text-text-primary border border-border-light hover:border-accent-blue/30'
                                            }`}
                              >
                                {days} {days === 1 ? 'Day' : 'Days'}
                              </button>
                            ))}
                            <button
                              onClick={() => setDurationDays(-1)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                                          ${
                                            durationDays === -1
                                              ? 'bg-accent-blue text-white shadow-md'
                                              : 'bg-white text-text-primary border border-border-light hover:border-accent-blue/30'
                                          }`}
                            >
                              Custom
                            </button>
                          </div>
                          {durationDays === -1 && (
                            <div className="mb-3">
                              <input
                                type="number"
                                min={1}
                                value={customDays}
                                onChange={(e) => setCustomDays(e.target.value)}
                                placeholder="Enter number of days"
                                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border-light text-sm
                                           focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              className="px-5 py-2 rounded-lg bg-status-green text-white text-xs font-semibold
                                         hover:bg-status-green/90 transition-all duration-200
                                         shadow-md shadow-status-green/20"
                            >
                              Confirm Approval
                            </button>
                            <button
                              onClick={() => setApprovingId(null)}
                              className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary
                                         hover:text-text-primary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ---- Inline Reject Confirmation ---- */}
                  <AnimatePresence>
                    {rejectingId === req.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:col-span-7 overflow-hidden"
                      >
                        <div className="mt-3 p-4 rounded-xl bg-status-red/3 border border-status-red/20">
                          <p className="text-sm font-medium text-text-primary mb-3">
                            Reject this request? The student will not be granted access.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-5 py-2 rounded-lg bg-status-red text-white text-xs font-semibold
                                         hover:bg-status-red/90 transition-all duration-200
                                         shadow-md shadow-status-red/20"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              onClick={() => setRejectingId(null)}
                              className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary
                                         hover:text-text-primary transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* ---- Summary Footer ---- */}
            <div className="flex items-center justify-between text-xs text-text-secondary px-2">
              <span>
                Showing {filteredRequests.length} of {requests.length} request
                {requests.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && (
                  <span>
                    {' '}
                    — filtered by <span className="font-semibold capitalize">{statusFilter}</span>
                  </span>
                )}
              </span>
              {requests.length > 0 && (
                <button
                  onClick={loadRequests}
                  className="flex items-center gap-1 text-accent-blue hover:underline"
                >
                  <CalendarClock size={13} />
                  Refresh
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
