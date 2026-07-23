'use client';

import React from 'react';
import { Shield, MessageCircle, Instagram, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-accent-cyan/10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-text-secondary text-xs text-center sm:text-left">
            <p className="font-medium text-sm text-text-primary/80">
              © 2026 Healthcare Hustlers. All rights reserved.
            </p>
            <p className="mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Shield size={12} className="text-status-green" />
              <span className="text-status-green/80">
                HIPAA-Compliant: PHI is anonymized client-side before transmission.
              </span>
            </p>
          </div>

          {/* Center: MedHero brand */}
          <div className="flex items-center gap-2 text-text-secondary/60 text-xs">
            <Heart size={12} className="text-status-red" />
            <span>
              Powered by <span className="text-accent-cyan font-semibold">MedHero</span> PriorAuth AI
            </span>
          </div>

          {/* Right: Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/923350340888"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary hover:text-accent-cyan transition-colors text-xs"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
            <a
              href="https://instagram.com/healthcarehustlersofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary hover:text-accent-cyan transition-colors text-xs"
            >
              <Instagram size={14} />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.healthcarehustlers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-cyan transition-colors text-xs"
            >
              healthcarehustlers.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
