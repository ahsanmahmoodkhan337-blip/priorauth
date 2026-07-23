'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { getAccessRequests } from '@/lib/accessRequests';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true); setError(null);

    const requests = getAccessRequests();
    const user = requests.find(r => r.phone === phone.trim());

    if (!user) {
      setError('No access request found for this phone number.');
      setLoading(false); return;
    }
    if (user.status === 'pending') {
      setError('Your request is still pending approval.');
      setLoading(false); return;
    }
    if (user.status === 'rejected') {
      setError('Your request was rejected.');
      setLoading(false); return;
    }
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      setError('Your access has expired.');
      setLoading(false); return;
    }

    localStorage.setItem('student_auth', JSON.stringify({
      phone: user.phone,
      fullName: user.fullName,
      expiresAt: user.expiresAt || null,
    }));
    
    router.push('/workspace');
  }, [phone, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-accent-blue mb-6"><ArrowLeft size={12} /> Home</Link>
        
        <div className="bg-white rounded-2xl border border-border-light shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzlhAsLzZUsSahPRzogHCLfE3-396Yw1yQUSkSRpEwg&s=10" alt="Logo" width={48} height={48} className="rounded-lg mb-3" />
            <h1 className="text-xl font-bold text-heading-navy">Student Login</h1>
            <p className="text-xs text-text-secondary mt-1">Enter your phone number to access the EHR Simulator</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input type={showPhone ? 'text' : 'password'} value={phone} onChange={(e) => { setPhone(e.target.value); setError(null); }} placeholder="03001234567" className="w-full px-4 py-3 pr-11 rounded-xl border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30" />
              <button type="button" onClick={() => setShowPhone(!showPhone)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">{showPhone ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {error && <p className="text-status-red text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? 'Checking...' : <><LogIn size={16} /> Login</>}
            </button>
          </form>

          <p className="text-[10px] text-text-secondary/60 text-center mt-6">
            Your phone number is your login credential. Access must be approved by an admin before you can log in.
          </p>
        </div>
      </div>
    </div>
  );
}
