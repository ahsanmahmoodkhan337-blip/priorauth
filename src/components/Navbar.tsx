'use client';

import React, { useState, useCallback } from 'react';
import ModeToggle from '@/components/HUD/ModeToggle';
import GuidelineUpdater from '@/components/HUD/GuidelineUpdater';

export default function Navbar() {
  const [mode, setMode] = useState<'student' | 'b2b'>('student');

  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'student' ? 'b2b' : 'student'));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border-light">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Branding */}
          <div className="flex items-center gap-3">
            {/* Real Healthcare Hustlers Logo */}
            <div className="flex-shrink-0">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzlhAsLzZUsSahPRzogHCLfE3-396Yw1yQUSkSRpEwg&s=10"
                alt="Healthcare Hustlers"
                width={40}
                height={40}
                className="rounded-md"
              />
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

          {/* Right: Guideline Updater + Mode Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <GuidelineUpdater />
            <ModeToggle mode={mode} onToggle={handleToggleMode} />
          </div>
        </div>
      </div>
    </nav>
  );
}
