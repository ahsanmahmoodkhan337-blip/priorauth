'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, CheckCircle2, CreditCard, ReceiptText, FileText, Clock,
  Rocket, Banknote, Smartphone, Globe, MessageCircle, Send, ArrowRight,
  ShieldCheck, HelpCircle, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import { saveAccessRequest } from '@/lib/accessRequests';

type PaymentMethod = 'bank-islami' | 'easypaisa' | 'paypal';

interface FormData {
  fullName: string; phone: string; email: string;
  paymentMethod: PaymentMethod | ''; transactionId: string; receiptSent: boolean | null;
}
interface FormErrors {
  fullName?: string; phone?: string; paymentMethod?: string;
  transactionId?: string; receiptSent?: string;
}

const PAYMENT_METHODS = [
  { id: 'bank-islami' as PaymentMethod, label: 'Bank Islami', icon: <Banknote size={20} /> },
  { id: 'easypaisa' as PaymentMethod, label: 'EasyPaisa', icon: <Smartphone size={20} /> },
  { id: 'paypal' as PaymentMethod, label: 'PayPal', icon: <Globe size={20} /> },
];

const ENROLLMENT_STEPS = [
  { num: 1, title: 'Choose Payment Method', desc: 'Select Bank Islami, EasyPaisa, or PayPal.', icon: <CreditCard size={22} /> },
  { num: 2, title: 'Make Payment', desc: 'Send the enrollment fee using the account details.', icon: <Banknote size={22} /> },
  { num: 3, title: 'Note Transaction ID', desc: 'Save the transaction/reference ID from your payment.', icon: <ReceiptText size={22} /> },
  { num: 4, title: 'Submit Request Form', desc: 'Fill in your details along with the transaction ID.', icon: <FileText size={22} /> },
  { num: 5, title: 'Wait for Approval', desc: 'Admin will verify and approve within 24 hours.', icon: <Clock size={22} /> },
  { num: 6, title: 'Start Learning!', desc: 'Use your phone number to log in.', icon: <Rocket size={22} /> },
];

const WHATSAPP_URL = 'https://api.whatsapp.com/send/?phone=923350340888&text&type=phone_number&app_absent=0';

export default function LandingPage() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('easypaisa');
  const [formData, setFormData] = useState<FormData>({ fullName: '', phone: '', email: '', paymentMethod: '', transactionId: '', receiptSent: null });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) { setErrors((prev) => { const n = { ...prev }; delete n[field as keyof FormErrors]; return n; }); }
  }, [errors]);

  const handleBlur = useCallback((field: string) => { setTouched((prev) => ({ ...prev, [field]: true })); }, []);

  const validate = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required.';
    if (!formData.phone.trim()) e.phone = 'Phone number is required.';
    if (!formData.paymentMethod) e.paymentMethod = 'Please select a payment method.';
    if (!formData.transactionId.trim()) e.transactionId = 'Transaction ID is required.';
    if (formData.receiptSent === null) e.receiptSent = 'Please confirm receipt.';
    setErrors(e); return Object.keys(e).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, phone: true, paymentMethod: true, transactionId: true, receiptSent: true });
    if (!validate()) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const res = await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: formData.fullName.trim(), phone: formData.phone.trim(), email: formData.email.trim() || '', paymentMethod: formData.paymentMethod || 'easypaisa', transactionId: formData.transactionId.trim(), receiptSent: formData.receiptSent === true }) });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true); setSubmitError(null);
        saveAccessRequest({ id: crypto.randomUUID(), fullName: formData.fullName.trim(), phone: formData.phone.trim(), email: formData.email.trim() || '', paymentMethod: formData.paymentMethod || 'easypaisa', transactionId: formData.transactionId.trim(), receiptSent: formData.receiptSent === true, status: 'pending', submittedAt: new Date().toISOString() });
      } else {
        setSubmitError(data.message || 'Submission failed.');
      }
    } catch { setSubmitError('Network error.'); }
    finally { setSubmitting(false); }
  }, [formData, validate]);

  const fieldError = (field: keyof FormErrors) => (touched[field] || submitted) ? errors[field] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzlhAsLzZUsSahPRzogHCLfE3-396Yw1yQUSkSRpEwg&s=10" alt="Healthcare Hustlers" width={80} height={80} className="mx-auto rounded-xl shadow-lg" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-bold tracking-[0.25em] uppercase text-accent-gold mb-4">BE A MED HERO!</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading-navy tracking-tight mb-4">MedHero PriorAuth AI</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-8">Enterprise AI-Driven Prior Authorization & Medical Necessity Engine</motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col items-center gap-4">
            <a href="#enroll" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent-blue text-white font-semibold text-sm hover:bg-accent-blue/90 shadow-lg">Enroll Now <ArrowRight size={18} /></a>
            <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:text-accent-blue/80">Already enrolled? Login <ArrowRight size={14} /></Link>
          </motion.div>
        </div>
      </section>

      <section id="enroll" className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">Enrollment Steps</h2><p className="text-text-secondary">Follow these six steps to get access.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENROLLMENT_STEPS.map((s, i) => (
              <div key={s.num} className="relative bg-white rounded-xl border border-border-light p-6 hover:border-accent-gold/40 hover:shadow-md">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-heading-navy text-accent-gold flex items-center justify-center text-sm font-bold">{s.num}</div>
                <div className="flex items-center gap-3 mb-3 mt-1"><div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">{s.icon}</div></div>
                <h3 className="text-sm font-semibold text-heading-navy mb-1.5">{s.title}</h3><p className="text-xs text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10"><h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">Select Payment Method</h2><p className="text-text-secondary">Choose your preferred payment method.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} onClick={() => { setSelectedPayment(m.id); handleInputChange('paymentMethod', m.id); }}
                className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer hover:shadow-lg ${selectedPayment === m.id ? 'border-accent-gold shadow-md' : 'border-border-light hover:border-accent-blue/30'}`}>
                {selectedPayment === m.id && <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-accent-gold text-heading-navy text-[10px] font-bold">Selected</span>}
                <div className="flex items-center gap-3 mb-4"><div className={`p-2.5 rounded-lg ${selectedPayment === m.id ? 'bg-accent-gold/15 text-accent-gold' : 'bg-accent-blue/10 text-accent-blue'}`}>{m.icon}</div><h3 className="font-semibold text-heading-navy">{m.label}</h3></div>
                <div className="space-y-2 text-xs text-text-secondary mb-4">
                  {m.id === 'bank-islami' && <><p><span className="font-medium text-text-primary">Bank:</span> Bank Islami Pakistan LTD.</p><p><span className="font-medium text-text-primary">Account Title:</span> Ahsan Mahmood Khan</p><p><span className="font-medium text-text-primary">Account:</span> PK98BKIP0303800235070201</p></>}
                  {m.id === 'easypaisa' && <><p><span className="font-medium text-text-primary">Account Name:</span> Ahsan Mahmood Khan</p><p><span className="font-medium text-text-primary">Account:</span> 03105265337</p></>}
                  {m.id === 'paypal' && <><p><span className="font-medium text-text-primary">Account Title:</span> Ahsan Mahmood Khan</p><p><span className="font-medium text-text-primary">Account:</span> 333591114926</p><p><span className="font-medium text-text-primary">Routing:</span> 031101279</p></>}
                </div>
                <button type="button" className={`w-full py-2 rounded-lg text-xs font-semibold ${selectedPayment === m.id ? 'bg-accent-gold text-heading-navy' : 'bg-accent-blue text-white'}`}>{selectedPayment === m.id ? 'Selected' : 'Select'}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10"><h2 className="text-3xl font-bold text-heading-navy mb-3">Access Request Form</h2><p className="text-text-secondary">Fill in your details to request access.</p></div>

          {submitted && (
            <div className="bg-white rounded-xl border border-border-light p-8 sm:p-10 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-green/10 mb-5"><CheckCircle2 size={40} className="text-status-green" /></div>
              <h3 className="text-xl font-bold text-heading-navy mb-3">Thank You! Your request has been submitted.</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">We'll review and grant access within 24 hours. You'll be able to log in using your phone number once approved.</p>
              <button type="button" onClick={() => { setSubmitted(false); setFormData({ fullName: '', phone: '', email: '', paymentMethod: '', transactionId: '', receiptSent: null }); setTouched({}); setErrors({}); setSubmitError(null); }} className="text-sm font-medium text-accent-blue">Submit Another Request</button>
            </div>
          )}

          {!submitted && submitError && (
            <div className="mb-8 p-4 rounded-xl bg-status-red/10 border border-status-red/30 flex items-center gap-3"><AlertCircle size={20} className="text-status-red" /><p className="text-sm font-medium">{submitError}</p></div>
          )}

          {!submitted && (
            <div className="bg-white rounded-xl border border-border-light p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div><label className="block text-sm font-medium text-heading-navy mb-1.5">Student Full Name <span className="text-status-red">*</span></label><input type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} onBlur={() => handleBlur('fullName')} placeholder="Enter your full name" className={`w-full px-4 py-2.5 rounded-lg border text-sm ${fieldError('fullName') ? 'border-status-red' : 'border-border-light'}`} />{fieldError('fullName') && <p className="mt-1 text-xs text-status-red">{fieldError('fullName')}</p>}</div>
                <div><label className="block text-sm font-medium text-heading-navy mb-1.5">Phone Number (Login ID) <span className="text-status-red">*</span></label><input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} onBlur={() => handleBlur('phone')} placeholder="e.g. 03101234567" className={`w-full px-4 py-2.5 rounded-lg border text-sm ${fieldError('phone') ? 'border-status-red' : 'border-border-light'}`} />{fieldError('phone') && <p className="mt-1 text-xs text-status-red">{fieldError('phone')}</p>}</div>
                <div><label className="block text-sm font-medium text-heading-navy mb-1.5">Email</label><input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg border border-border-light text-sm" /></div>
                <div><label className="block text-sm font-medium text-heading-navy mb-1.5">Select Payment Method <span className="text-status-red">*</span></label><div className="relative"><select value={formData.paymentMethod} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className={`w-full px-4 py-2.5 rounded-lg border text-sm appearance-none ${fieldError('paymentMethod') ? 'border-status-red' : 'border-border-light'}`}><option value="">-- Choose --</option><option value="bank-islami">Bank Islami</option><option value="easypaisa">EasyPaisa</option><option value="paypal">PayPal</option></select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" /></div>{fieldError('paymentMethod') && <p className="mt-1 text-xs text-status-red">{fieldError('paymentMethod')}</p>}</div>
                <div><label className="block text-sm font-medium text-heading-navy mb-1.5">Unique Transaction ID <span className="text-status-red">*</span></label><input type="text" value={formData.transactionId} onChange={(e) => handleInputChange('transactionId', e.target.value)} placeholder="Enter transaction ID" className={`w-full px-4 py-2.5 rounded-lg border text-sm ${fieldError('transactionId') ? 'border-status-red' : 'border-border-light'}`} />{fieldError('transactionId') && <p className="mt-1 text-xs text-status-red">{fieldError('transactionId')}</p>}</div>
                <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/15"><div className="flex items-start gap-3 mb-3"><MessageCircle size={20} className="text-status-green mt-0.5" /><p className="text-sm font-medium text-heading-navy">Send payment receipt to WhatsApp:</p></div><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-status-green text-white text-sm font-semibold"><Send size={16} /> Send Receipt on WhatsApp</a></div>
                <div><p className="text-sm font-medium text-heading-navy mb-2">Sent receipt to WhatsApp?</p><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="receiptSent" checked={formData.receiptSent === true} onChange={() => handleInputChange('receiptSent', true)} className="w-4 h-4" />Yes</label><label className="flex items-center gap-2"><input type="radio" name="receiptSent" checked={formData.receiptSent === false} onChange={() => handleInputChange('receiptSent', false)} className="w-4 h-4" />No</label></div>{fieldError('receiptSent') && <p className="mt-1 text-xs text-status-red">{fieldError('receiptSent')}</p>}</div>
                <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Access Request'}</button>
              </form>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-blue/10 mb-5"><HelpCircle size={28} className="text-accent-blue" /></div>
          <h2 className="text-3xl font-bold text-heading-navy mb-3">Need Help?</h2>
          <p className="text-text-secondary mb-6">Have questions? Chat with us on WhatsApp.</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-status-green text-white font-semibold text-sm shadow-lg"><MessageCircle size={18} /> Chat on WhatsApp</a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
