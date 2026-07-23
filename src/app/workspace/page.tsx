'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Clock, ArrowLeft } from 'lucide-react';
import { CaseProvider } from '@/lib/useCaseState';
import Navbar from '@/components/Navbar';
import GuidelineSyncBar from '@/components/GuidelineSyncBar';
import SplitScreenContainer from '@/components/HUD/SplitScreenContainer';
import DeepAICopilotWrapper from '@/components/HUD/DeepAICopilotWrapper';
import Footer from '@/components/Footer';

interface StudentAuth {
  phone: string;
  fullName: string;
  expiresAt: string | null;
}

export default function WorkspacePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<StudentAuth | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('student_auth');
    if (!stored) {
      router.replace('/login');
      return;
    }

    try {
      const parsed: StudentAuth = JSON.parse(stored);
      if (!parsed.phone || !parsed.fullName) {
        localStorage.removeItem('student_auth');
        router.replace('/login');
        return;
      }

      // Check expiration
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('student_auth');
        router.replace('/login');
        return;
      }

      setAuth(parsed);
    } catch {
      localStorage.removeItem('student_auth');
      router.replace('/login');
    } finally {
      setChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('student_auth');
    router.push('/login');
  };

  // Show nothing while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-accent-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-text-secondary">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (should have been redirected, but just in case)
  if (!auth) {
    return null;
  }

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return 'No expiration';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Auth header bar */}
      <div className="bg-heading-navy text-white px-4 py-2 flex items-center justify-between text-sm z-50 relative">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            Home
          </Link>
          <span className="font-medium">
            Welcome, <span className="text-accent-gold">{auth.fullName}</span>
          </span>
          <span className="text-white/60 flex items-center gap-1 text-xs">
            <Clock size={12} />
            Access expires: {formatExpiry(auth.expiresAt)}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                     bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>

      <Navbar />
      <GuidelineSyncBar />

      {/* Main Content: offset for fixed navbar (64px) + sync bar (40px) + auth header (~36px) */}
      <main className="flex-1 pt-[140px] pb-4 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full">
        <CaseProvider>
          <SplitScreenContainer />
        </CaseProvider>
      </main>

      <Footer />
      <DeepAICopilotWrapper />
    </div>
  );
}
