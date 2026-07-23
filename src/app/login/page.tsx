'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to workspace
  useEffect(() => {
    const stored = localStorage.getItem('student_auth');
    if (stored) {
      router.replace('/workspace');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        // Store auth data and redirect
        localStorage.setItem(
          'student_auth',
          JSON.stringify({
            phone: data.phone,
            fullName: data.fullName,
            expiresAt: data.expiresAt,
          })
        );
        router.push('/workspace');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-xs font-medium text-text-secondary hover:text-accent-blue transition-colors flex items-center gap-1"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl border border-border-light shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzlhAsLzZUsSahPRzogHCLfE3-396Yw1yQUSkSRpEwg&s=10"
              alt="Healthcare Hustlers"
              width={64}
              height={64}
              className="rounded-xl shadow-md"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-heading-navy text-center mb-1">
            Student Login
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Enter your phone number to access the EHR Simulator
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-heading-navy mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="03001234567"
                autoComplete="tel"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border text-sm text-text-primary
                            bg-white placeholder:text-text-secondary/40
                            focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                            transition-all duration-200
                            ${error ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 rounded-lg bg-status-red/5 border border-status-red/20 flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-status-red flex-shrink-0" />
                <p className="text-sm text-status-red font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm
                         hover:bg-accent-blue/90 transition-all duration-200
                         shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30
                         active:scale-[0.98] flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
