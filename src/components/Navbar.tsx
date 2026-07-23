'use client';

import React, { useState, useCallback } from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import ModeToggle from '@/components/HUD/ModeToggle';

export default function Navbar() {
  const [mode, setMode] = useState<'student' | 'b2b'>('student');

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'student' ? 'b2b' : 'student'));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-secondary border-b border-accent-cyan/20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Branding */}
          <div className="flex items-center gap-3">
            {/* Caduceus Wings SVG Logo */}
            <div className="flex-shrink-0">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              >
                {/* Staff */}
                <rect
                  x="18.5"
                  y="4"
                  width="3"
                  height="32"
                  rx="1.5"
                  fill="#00E5FF"
                />
                {/* Wings */}
                <path
                  d="M6 12C6 12 10 10 13 8C16 6 19 7 20 9C21 7 24 6 27 8C30 10 34 12 34 12"
                  stroke="#FFB800"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M6 8C6 8 10 6 13 4C16 2 19 3 20 5C21 3 24 2 27 4C30 6 34 8 34 8"
                  stroke="#FFB800"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Left Snake */}
                <path
                  d="M18.5 36C14 30 8 24 8 18C8 12 12 10 14 12C16 14 14 18 12 19C10 20 10 18 11 16"
                  stroke="#00E5FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Right Snake */}
                <path
                  d="M21.5 36C26 30 32 24 32 18C32 12 28 10 26 12C24 14 26 18 28 19C30 20 30 18 29 16"
                  stroke="#00E5FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Top wings knob */}
                <circle cx="20" cy="4" r="2" fill="#FFB800" />
              </svg>
            </div>

            {/* Brand name and tagline */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-text-secondary">
                Healthcare Hustlers
              </span>
              <span className="text-sm font-bold text-gradient-gold tracking-wide">
                BE A MED HERO!
              </span>
            </div>
          </div>

          {/* Right: Links and Mode Toggle */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* WhatsApp */}
            <a
              href="https://wa.me/923350340888"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary hover:text-accent-cyan transition-colors text-sm"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">+92 335 0340888</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/healthcarehustlersofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary hover:text-accent-cyan transition-colors text-sm"
            >
              <Instagram size={16} />
              <span className="hidden sm:inline">@healthcarehustlersofficial</span>
            </a>

            {/* Mode Toggle */}
            <ModeToggle mode={mode} onToggle={handleToggleMode} />

            {/* Website link */}
            <a
              href="https://www.healthcarehustlers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block text-xs text-text-secondary hover:text-accent-cyan transition-colors border-l border-text-secondary/20 pl-4"
            >
              healthcarehustlers.org
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
