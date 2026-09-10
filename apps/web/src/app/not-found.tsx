import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconBuilding, IconArrowLeft } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full surface-card p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-masjid-green/10 text-masjid-green flex items-center justify-center mx-auto">
          <IconBuilding className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-masjid-gold font-mono">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-ink font-playfair">
            Page Not Found
          </h1>
          <p className="text-xs text-masjid-muted pt-2 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto text-xs justify-center">
              <IconArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Return to Homepage</span>
            </Button>
          </Link>
          <Link href="/portal" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto text-xs justify-center">
              <span>Member Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
