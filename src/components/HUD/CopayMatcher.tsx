'use client';

import React, { useState } from 'react';
import { X, Search, ExternalLink, DollarSign, CheckCircle2, AlertCircle, Download, Users } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AssistanceProgram {
  id: string;
  name: string;
  type: 'manufacturer' | 'foundation' | 'state';
  drugCoverage: string[];
  eligibility: string;
  incomeThreshold: string;
  enrollmentLink: string;
  contactPhone: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Simulated Program Database
// ---------------------------------------------------------------------------

const ASSISTANCE_PROGRAMS: AssistanceProgram[] = [
  {
    id: 'abbvie',
    name: 'AbbVie Assist',
    type: 'manufacturer',
    drugCoverage: ['Humira', 'Skyrizi', 'Rinvoq', 'Imbruvica'],
    eligibility: 'Uninsured or underinsured patients; Medicare Part D patients in the donut hole may qualify',
    incomeThreshold: 'Up to 500% Federal Poverty Level ($75,300 individual / $156,000 family of 4)',
    enrollmentLink: 'https://www.abbvie.com/patients/patient-assistance.html',
    contactPhone: '1-800-222-6885',
    description: 'Manufacturer assistance program providing free medications to eligible patients. Covers Humira, Skyrizi, Rinvoq, and other AbbVie products.',
  },
  {
    id: 'pfizer',
    name: 'Pfizer Pathways',
    type: 'manufacturer',
    drugCoverage: ['Xeljanz', 'Xalkori', 'Inlyta', 'Ibrance', 'Eliquis'],
    eligibility: 'Uninsured patients; Medicare patients with financial hardship; commercially insured patients with high copays',
    incomeThreshold: 'Up to 400% FPL ($60,240 individual / $124,800 family of 4)',
    enrollmentLink: 'https://www.pfizer.com/health/patient-assistance',
    contactPhone: '1-844-989-7284',
    description: 'Pfizer\'s comprehensive patient assistance program offering free or reduced-cost medications across multiple therapeutic areas.',
  },
  {
    id: 'healthwell',
    name: 'HealthWell Foundation',
    type: 'foundation',
    drugCoverage: ['Keytruda', 'Opdivo', 'Imbruvica', 'Revlimid', 'Jakafi', 'Xtandi'],
    eligibility: 'Insured patients (including Medicare) with chronic or life-altering conditions; must meet income criteria; insurance must cover the medication',
    incomeThreshold: 'Up to 500% FPL ($75,300 individual / $156,000 family of 4)',
    enrollmentLink: 'https://www.healthwellfoundation.org',
    contactPhone: '1-800-675-8416',
    description: 'Nonprofit foundation providing copay assistance for insured patients facing high out-of-pocket costs for specialty medications.',
  },
  {
    id: 'pan',
    name: 'PAN Foundation',
    type: 'foundation',
    drugCoverage: ['Stelara', 'Entyvio', 'Cosentyx', 'Otezla', 'Taltz', 'Tremfya'],
    eligibility: 'Insured patients (including Medicare) with specific diagnoses; income at or below 400-500% FPL',
    incomeThreshold: 'Up to 500% FPL (varies by disease fund — typically $72,900 individual)',
    enrollmentLink: 'https://www.panfoundation.org',
    contactPhone: '1-866-316-7263',
    description: 'Independent charitable foundation providing copay assistance for underinsured patients with life-threatening, chronic, and rare diseases.',
  },
  {
    id: 'jj',
    name: 'Johnson & Johnson Patient Assistance',
    type: 'manufacturer',
    drugCoverage: ['Stelara', 'Tremfya', 'Remicade', 'Simponi', 'Xarelto', 'Erleada', 'Darzalex'],
    eligibility: 'Uninsured patients; Medicare patients in the coverage gap; commercially insured patients facing affordability challenges',
    incomeThreshold: 'Up to 400% FPL ($60,240 individual / $124,800 family of 4)',
    enrollmentLink: 'https://www.janssencarepath.com',
    contactPhone: '1-877-227-3728',
    description: 'J&J\'s patient assistance foundation providing free medications and copay support for eligible patients across immunology, oncology, and cardiovascular.',
  },
  {
    id: 'gooddays',
    name: 'Good Days',
    type: 'foundation',
    drugCoverage: ['Botox', 'Aimovig', 'Emgality', 'Nurtec', 'Ubrelvy', 'Qulipta'],
    eligibility: 'Insured patients with chronic disease; must have insurance that covers the medication; income verification required',
    incomeThreshold: 'Up to 500% FPL (varies by disease fund)',
    enrollmentLink: 'https://www.mygooddays.org',
    contactPhone: '1-877-968-7233',
    description: 'National nonprofit providing copay assistance for patients with chronic conditions including chronic migraine.',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CopayMatcherProps {
  isOpen: boolean;
  onClose: () => void;
  cptCode?: string | null;
  procedureName?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CopayMatcher({ isOpen, onClose, cptCode, procedureName }: CopayMatcherProps) {
  const [searchDrug, setSearchDrug] = useState(cptCode ?? 'Humira');
  const [hasSearched, setHasSearched] = useState(false);
  const [eligiblePrograms, setEligiblePrograms] = useState<AssistanceProgram[]>([]);
  const [checkingEligibility, setCheckingEligibility] = useState<string | null>(null);

  const handleSearch = () => {
    const results = ASSISTANCE_PROGRAMS.filter((p) =>
      p.drugCoverage.some((d) => d.toLowerCase().includes(searchDrug.toLowerCase()))
    );
    setEligiblePrograms(results);
    setHasSearched(true);
  };

  const handleCheckEligibility = (programId: string) => {
    setCheckingEligibility(programId);
    setTimeout(() => {
      setCheckingEligibility(null);
      alert('✅ Eligibility check complete!\n\nBased on simulated criteria, the program may cover this medication. Submit the enrollment form for formal determination.');
    }, 1500);
  };

  const handleDownloadForm = (program: AssistanceProgram) => {
    const formContent = `ENROLLMENT FORM — ${program.name}
=============================================

Program: ${program.name}
Type: ${program.type.toUpperCase()}
Phone: ${program.contactPhone}
Website: ${program.enrollmentLink}

Eligibility Criteria:
  ${program.eligibility}

Income Threshold:
  ${program.incomeThreshold}

Covered Medications:
  ${program.drugCoverage.join(', ')}

Patient Information:
  Name: _____________________________
  DOB: _____________________________
  Address: _____________________________
  Phone: _____________________________
  Insurance Provider: _____________________________
  Policy/Member ID: _____________________________

Prescribing Provider:
  Name: _____________________________
  NPI: _____________________________
  Phone: _____________________________
  Fax: _____________________________
  Signature: _____________________________

Please submit completed form to:
${program.enrollmentLink}`;

    navigator.clipboard.writeText(formContent).then(() => {
      alert(`📋 ${program.name} enrollment form copied to clipboard!`);
    });
  };

  const getTypeBadge = (type: AssistanceProgram['type']) => {
    switch (type) {
      case 'manufacturer':
        return { label: 'Manufacturer', className: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' };
      case 'foundation':
        return { label: 'Foundation', className: 'bg-status-green/10 text-status-green border-status-green/20' };
      case 'state':
        return { label: 'State Program', className: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-gradient-to-r from-accent-gold/5 to-bg-navy/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-gold/10">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading-navy">Copay Assistance & Manufacturer Programs</h2>
              <p className="text-xs text-text-secondary">
                Find manufacturer copay cards and foundation assistance programs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={searchDrug}
                onChange={(e) => { setSearchDrug(e.target.value); setHasSearched(false); }}
                placeholder="Enter drug name or CPT code (e.g., Humira, Keytruda, Botox)"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light bg-white text-sm text-text-primary
                           focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 rounded-lg bg-accent-gold text-heading-navy text-sm font-bold
                         hover:brightness-110 transition-all duration-200 shadow-md flex items-center gap-2"
            >
              <Search size={14} />
              Search
            </button>
          </div>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  {eligiblePrograms.length} program{eligiblePrograms.length !== 1 ? 's' : ''} found for "{searchDrug}"
                </h3>
                {procedureName && (
                  <span className="text-[10px] text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-full">
                    Current: {procedureName}
                  </span>
                )}
              </div>

              {eligiblePrograms.length === 0 && (
                <div className="rounded-xl border border-status-orange/20 bg-status-orange/5 p-6 text-center">
                  <AlertCircle size={24} className="text-status-orange mx-auto mb-2" />
                  <p className="text-sm text-text-primary font-medium">No programs found</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Try a different drug name or check the PAN Foundation for broader coverage.
                  </p>
                </div>
              )}

              {eligiblePrograms.map((program) => {
                const badge = getTypeBadge(program.type);

                return (
                  <div
                    key={program.id}
                    className="rounded-xl border-2 border-accent-gold/20 bg-accent-gold/3 overflow-hidden hover:border-accent-gold/40 transition-all duration-200"
                  >
                    {/* Program Header */}
                    <div className="px-5 py-3.5 border-b border-accent-gold/10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-heading-navy">{program.name}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">{program.description}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-[10px] text-text-secondary">Contact</p>
                        <p className="text-xs font-semibold text-accent-blue">{program.contactPhone}</p>
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="px-5 py-3.5 space-y-3">
                      {/* Eligibility */}
                      <div className="flex items-start gap-2">
                        <Users size={14} className="text-accent-gold mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Eligibility</p>
                          <p className="text-[11px] text-text-secondary">{program.eligibility}</p>
                        </div>
                      </div>

                      {/* Income Threshold */}
                      <div className="flex items-start gap-2">
                        <DollarSign size={14} className="text-status-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Income Threshold</p>
                          <p className="text-[11px] text-text-secondary">{program.incomeThreshold}</p>
                        </div>
                      </div>

                      {/* Covered Drugs */}
                      <div>
                        <p className="text-xs font-semibold text-text-primary mb-1.5">Covered Medications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {program.drugCoverage.map((drug) => (
                            <span
                              key={drug}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                drug.toLowerCase().includes(searchDrug.toLowerCase())
                                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                                  : 'bg-bg-secondary text-text-secondary'
                              }`}
                            >
                              {drug}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleCheckEligibility(program.id)}
                          disabled={checkingEligibility === program.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                                     bg-status-green/10 text-status-green text-xs font-semibold
                                     border border-status-green/20
                                     hover:bg-status-green/20 transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-wait"
                        >
                          {checkingEligibility === program.id ? (
                            <>⏳ Checking...</>
                          ) : (
                            <>
                              <CheckCircle2 size={12} />
                              Check Eligibility
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadForm(program)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                                     bg-accent-blue text-white text-xs font-semibold
                                     hover:brightness-110 transition-all duration-200"
                        >
                          <Download size={12} />
                          Download Enrollment Form
                        </button>
                        <a
                          href={program.enrollmentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg
                                     border border-border-light text-text-secondary text-xs font-medium
                                     hover:border-accent-blue/30 hover:text-accent-blue transition-all duration-200"
                        >
                          <ExternalLink size={12} />
                          Website
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-5 rounded-full bg-accent-gold/5 border border-accent-gold/10 mb-4">
                <DollarSign size={36} className="text-accent-gold/30" />
              </div>
              <p className="text-sm text-text-secondary max-w-xs">
                Enter a drug name or CPT code above and click <strong>Search</strong> to find copay assistance programs.
              </p>
              <p className="text-xs text-text-secondary/60 mt-2">
                Includes manufacturer programs, charitable foundations, and state assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
