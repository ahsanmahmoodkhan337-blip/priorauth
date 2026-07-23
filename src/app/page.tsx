'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  FileText,
  Clock,
  Rocket,
  Banknote,
  Smartphone,
  Globe,
  MessageCircle,
  Send,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
// Note: saveAccessRequest import removed — now posting to /api/enroll

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PaymentMethod = 'bank-islami' | 'easypaisa' | 'paypal';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod | '';
  transactionId: string;
  receiptSent: boolean | null;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptSent?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'bank-islami', label: 'Bank Islami', icon: <Banknote size={20} /> },
  { id: 'easypaisa', label: 'EasyPaisa', icon: <Smartphone size={20} /> },
  { id: 'paypal', label: 'PayPal', icon: <Globe size={20} /> },
];

const ENROLLMENT_STEPS = [
  {
    num: 1,
    title: 'Choose Payment Method',
    desc: 'Select Bank Islami, EasyPaisa, or PayPal — whichever is most convenient for you.',
    icon: <CreditCard size={22} />,
  },
  {
    num: 2,
    title: 'Make Payment',
    desc: 'Send the enrollment fee using the account details provided for your chosen method.',
    icon: <Banknote size={22} />,
  },
  {
    num: 3,
    title: 'Note Transaction ID',
    desc: 'Save the transaction / reference ID from your payment — you\'ll need it for the form.',
    icon: <ReceiptText size={22} />,
  },
  {
    num: 4,
    title: 'Submit Request Form',
    desc: 'Fill in your details below along with the transaction ID and submit your access request.',
    icon: <FileText size={22} />,
  },
  {
    num: 5,
    title: 'Wait for Approval',
    desc: 'Our admin will verify your payment and approve access within 24 hours.',
    icon: <Clock size={22} />,
  },
  {
    num: 6,
    title: 'Start Learning!',
    desc: 'Use your phone number to log in and access the full EHR simulator & PriorAuth AI.',
    icon: <Rocket size={22} />,
  },
];

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=923350340888&text&type=phone_number&app_absent=0';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LandingPage() {
  // -- Payment method selection
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('easypaisa');

  // -- Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    paymentMethod: '',
    transactionId: '',
    receiptSent: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // -- Handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | boolean | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error on change
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof FormErrors];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required (this will be your login ID).';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
    }
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required.';
    }
    if (formData.receiptSent === null) {
      newErrors.receiptSent = 'Please confirm whether you\'ve sent the receipt.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched({
        fullName: true,
        phone: true,
        paymentMethod: true,
        transactionId: true,
        receiptSent: true,
      });

      if (!validate()) return;

      setSubmitting(true);
      setSubmitError(null);

      try {
        const res = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || '',
            paymentMethod: formData.paymentMethod || 'easypaisa',
            transactionId: formData.transactionId.trim(),
            receiptSent: formData.receiptSent === true,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setSubmitted(true);
          setSubmitError(null);

          // Reset form after 5 seconds
          setTimeout(() => {
            setSubmitted(false);
            setFormData({
              fullName: '',
              phone: '',
              email: '',
              paymentMethod: '',
              transactionId: '',
              receiptSent: null,
            });
            setTouched({});
            setErrors({});
          }, 5000);
        } else {
          setSubmitError(data.message || 'Submission failed. Please try again.');
        }
      } catch {
        setSubmitError('Network error. Please check your connection and try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validate]
  );

  // -- Helpers
  const fieldError = (field: keyof FormErrors) =>
    touched[field] || submitted ? errors[field] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />

      {/* ================================================================== */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================== */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzlhAsLzZUsSahPRzogHCLfE3-396Yw1yQUSkSRpEwg&s=10"
              alt="Healthcare Hustlers"
              width={80}
              height={80}
              className="mx-auto rounded-xl shadow-lg"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm font-bold tracking-[0.25em] uppercase text-accent-gold mb-4"
          >
            BE A MED HERO!
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading-navy tracking-tight mb-4"
          >
            MedHero PriorAuth AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-8"
          >
            Enterprise AI-Driven Prior Authorization &amp; Medical Necessity Engine
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <a
              href="#enroll"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                         bg-accent-blue text-white font-semibold text-sm
                         hover:bg-accent-blue/90 transition-all duration-200
                         shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30
                         active:scale-[0.98]"
            >
              Enroll Now
              <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ENROLLMENT STEPS SECTION                                           */}
      {/* ================================================================== */}
      <section id="enroll" className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">
              Enrollment Steps
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Follow these six simple steps to get access to the MedHero PriorAuth AI platform.
            </p>
          </motion.div>

          {/* Steps grid — 3x2 on desktop, 2x3 on tablet, 1x6 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENROLLMENT_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="relative bg-white rounded-xl border border-border-light p-6
                           hover:border-accent-gold/40 hover:shadow-md transition-all duration-200"
              >
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-heading-navy text-accent-gold
                                flex items-center justify-center text-sm font-bold shadow-md">
                  {step.num}
                </div>

                <div className="flex items-center gap-3 mb-3 mt-1">
                  <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-heading-navy mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PAYMENT METHODS SECTION                                            */}
      {/* ================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">
              Select Payment Method
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Choose your preferred payment method and send the enrollment fee.
              Only one method can be selected.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ---- Bank Islami ---- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.4 }}
              onClick={() => {
                setSelectedPayment('bank-islami');
                handleInputChange('paymentMethod', 'bank-islami');
              }}
              className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer
                          transition-all duration-200 hover:shadow-lg
                          ${selectedPayment === 'bank-islami'
                            ? 'border-accent-gold shadow-md shadow-accent-gold/10'
                            : 'border-border-light hover:border-accent-blue/30'
                          }`}
            >
              {selectedPayment === 'bank-islami' && (
                <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full
                                 bg-accent-gold text-heading-navy text-[10px] font-bold uppercase tracking-wider">
                  Selected
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-lg ${selectedPayment === 'bank-islami' ? 'bg-accent-gold/15 text-accent-gold' : 'bg-accent-blue/10 text-accent-blue'}`}>
                  <Banknote size={22} />
                </div>
                <h3 className="font-semibold text-heading-navy">Bank Islami</h3>
              </div>

              <div className="space-y-2 text-xs text-text-secondary mb-4">
                <p><span className="font-medium text-text-primary">Bank:</span> Bank Islami Pakistan LTD.</p>
                <p><span className="font-medium text-text-primary">Account Title:</span> Ahsan Mahmood Khan</p>
                <p className="break-all"><span className="font-medium text-text-primary">Account Number:</span> PK98BKIP0303800235070201</p>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200
                            ${selectedPayment === 'bank-islami'
                              ? 'bg-accent-gold text-heading-navy'
                              : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                            }`}
              >
                {selectedPayment === 'bank-islami' ? 'Selected' : 'Select'}
              </button>
            </motion.div>

            {/* ---- EasyPaisa ---- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              onClick={() => {
                setSelectedPayment('easypaisa');
                handleInputChange('paymentMethod', 'easypaisa');
              }}
              className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer
                          transition-all duration-200 hover:shadow-lg
                          ${selectedPayment === 'easypaisa'
                            ? 'border-accent-gold shadow-md shadow-accent-gold/10'
                            : 'border-border-light hover:border-accent-blue/30'
                          }`}
            >
              <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full
                               bg-accent-gold text-heading-navy text-[10px] font-bold uppercase tracking-wider">
                Selected
              </span>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-accent-gold/15 text-accent-gold">
                  <Smartphone size={22} />
                </div>
                <h3 className="font-semibold text-heading-navy">EasyPaisa</h3>
              </div>

              <div className="space-y-2 text-xs text-text-secondary mb-4">
                <p><span className="font-medium text-text-primary">Account Name:</span> Ahsan Mahmood Khan</p>
                <p><span className="font-medium text-text-primary">Account Number:</span> 03105265337</p>
              </div>

              <button
                type="button"
                className="w-full py-2 rounded-lg text-xs font-semibold
                           bg-accent-gold text-heading-navy"
              >
                Selected
              </button>
            </motion.div>

            {/* ---- PayPal ---- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onClick={() => {
                setSelectedPayment('paypal');
                handleInputChange('paymentMethod', 'paypal');
              }}
              className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer
                          transition-all duration-200 hover:shadow-lg
                          ${selectedPayment === 'paypal'
                            ? 'border-accent-gold shadow-md shadow-accent-gold/10'
                            : 'border-border-light hover:border-accent-blue/30'
                          }`}
            >
              {selectedPayment === 'paypal' && (
                <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full
                                 bg-accent-gold text-heading-navy text-[10px] font-bold uppercase tracking-wider">
                  Selected
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-lg ${selectedPayment === 'paypal' ? 'bg-accent-gold/15 text-accent-gold' : 'bg-accent-blue/10 text-accent-blue'}`}>
                  <Globe size={22} />
                </div>
                <h3 className="font-semibold text-heading-navy">PayPal</h3>
              </div>

              <div className="space-y-2 text-xs text-text-secondary mb-4">
                <p><span className="font-medium text-text-primary">Account Title:</span> Ahsan Mahmood Khan</p>
                <p><span className="font-medium text-text-primary">Account Number:</span> 333591114926</p>
                <p><span className="font-medium text-text-primary">Routing Number:</span> 031101279</p>
              </div>

              <button
                type="button"
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200
                            ${selectedPayment === 'paypal'
                              ? 'bg-accent-gold text-heading-navy'
                              : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                            }`}
              >
                {selectedPayment === 'paypal' ? 'Selected' : 'Select'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ACCESS REQUEST FORM                                                */}
      {/* ================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">
              Access Request Form
            </h2>
            <p className="text-text-secondary">
              Fill in your details to request access to the MedHero PriorAuth AI platform.
            </p>
          </motion.div>

          {/* Success message */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-status-green/10 border border-status-green/30
                         flex items-center gap-3"
            >
              <CheckCircle2 size={20} className="text-status-green flex-shrink-0" />
              <p className="text-sm font-medium text-text-primary">
                Your access request has been submitted! You&apos;ll be notified once approved.
              </p>
            </motion.div>
          )}

          {/* Error message */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-status-red/10 border border-status-red/30
                         flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-status-red flex-shrink-0" />
              <p className="text-sm font-medium text-text-primary">
                {submitError}
              </p>
            </motion.div>
          )}

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-xl border border-border-light p-6 sm:p-8 shadow-sm"
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-heading-navy mb-1.5">
                  Student Full Name <span className="text-status-red">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-primary
                              bg-white placeholder:text-text-secondary/50
                              focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                              transition-all duration-200
                              ${fieldError('fullName') ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
                />
                {fieldError('fullName') && (
                  <p className="mt-1 text-xs text-status-red">{fieldError('fullName')}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-heading-navy mb-1.5">
                  Phone Number (Login ID) <span className="text-status-red">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="e.g. 03101234567"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-primary
                              bg-white placeholder:text-text-secondary/50
                              focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                              transition-all duration-200
                              ${fieldError('phone') ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
                />
                {fieldError('phone') && (
                  <p className="mt-1 text-xs text-status-red">{fieldError('phone')}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-heading-navy mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-border-light text-sm text-text-primary
                             bg-white placeholder:text-text-secondary/50
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                             transition-all duration-200"
                />
              </div>

              {/* Payment Method Dropdown */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-heading-navy mb-1.5">
                  Select Payment Method <span className="text-status-red">*</span>
                </label>
                <div className="relative">
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    onBlur={() => handleBlur('paymentMethod')}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-primary
                                bg-white appearance-none cursor-pointer
                                focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                                transition-all duration-200
                                ${fieldError('paymentMethod') ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
                  >
                    <option value="">-- Choose a payment method --</option>
                    <option value="bank-islami">Bank Islami Pakistan LTD.</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="paypal">PayPal</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
                {fieldError('paymentMethod') && (
                  <p className="mt-1 text-xs text-status-red">{fieldError('paymentMethod')}</p>
                )}
              </div>

              {/* Transaction ID */}
              <div>
                <label htmlFor="transactionId" className="block text-sm font-medium text-heading-navy mb-1.5">
                  Unique Transaction ID <span className="text-status-red">*</span>
                </label>
                <input
                  id="transactionId"
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  onBlur={() => handleBlur('transactionId')}
                  placeholder="Enter the transaction/reference ID from your payment"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-primary
                              bg-white placeholder:text-text-secondary/50
                              focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
                              transition-all duration-200
                              ${fieldError('transactionId') ? 'border-status-red ring-1 ring-status-red/20' : 'border-border-light'}`}
                />
                {fieldError('transactionId') && (
                  <p className="mt-1 text-xs text-status-red">{fieldError('transactionId')}</p>
                )}
              </div>

              {/* WhatsApp Verification */}
              <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/15">
                <div className="flex items-start gap-3 mb-3">
                  <MessageCircle size={20} className="text-status-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-heading-navy">
                      Send your payment receipt to our WhatsApp for verification:
                    </p>
                  </div>
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                             bg-status-green text-white text-sm font-semibold
                             hover:bg-status-green/90 transition-all duration-200
                             shadow-md shadow-status-green/20"
                >
                  <Send size={16} />
                  Send Receipt on WhatsApp
                </a>
              </div>

              {/* Receipt Sent Confirmation */}
              <div>
                <p className="text-sm font-medium text-heading-navy mb-2">
                  Have you sent the payment receipt to our WhatsApp number?
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiptSent"
                      checked={formData.receiptSent === true}
                      onChange={() => handleInputChange('receiptSent', true)}
                      className="w-4 h-4 text-accent-blue focus:ring-accent-blue/30"
                    />
                    <span className="text-sm text-text-primary">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiptSent"
                      checked={formData.receiptSent === false}
                      onChange={() => handleInputChange('receiptSent', false)}
                      className="w-4 h-4 text-accent-blue focus:ring-accent-blue/30"
                    />
                    <span className="text-sm text-text-primary">No</span>
                  </label>
                </div>
                {fieldError('receiptSent') && (
                  <p className="mt-1 text-xs text-status-red">{fieldError('receiptSent')}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm
                           hover:bg-accent-blue/90 transition-all duration-200
                           shadow-lg shadow-accent-blue/20 hover:shadow-xl hover:shadow-accent-blue/30
                           active:scale-[0.98] flex items-center justify-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Access Request
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SUPPORT SECTION                                                    */}
      {/* ================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-blue/10 mb-5">
              <HelpCircle size={28} className="text-accent-blue" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-heading-navy mb-3">
              Need Help? Contact Support
            </h2>
            <p className="text-text-secondary mb-6">
              Have questions about payment or enrollment? Chat with us on WhatsApp.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-status-green text-white font-semibold text-sm
                         hover:bg-status-green/90 transition-all duration-200
                         shadow-lg shadow-status-green/20"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}
      <Footer />
    </div>
  );
}
