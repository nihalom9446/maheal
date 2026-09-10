'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import {
  IconCertificates,
  IconCheckCircle,
  IconShield,
  IconArrowRight,
  IconSearch,
  IconDownload,
} from '@/components/ui/icons';

export default function VerifyLookupPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setError('Please enter a valid verification token or certificate code.');
      return;
    }
    setError(null);
    router.push(`/verify/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="bg-canvas-bg min-h-screen">
      <PageHeader
        badge="Trust & Authenticity"
        title="Official Certificate Verification"
        description="Instantly verify Nikah, Mahallu Membership, and No Objection Certificates issued by Noorul Islam Juma Masjid under Kerala Waqf Board authorization."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Verify Certificate', href: '/verify' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Lookup Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="surface-card p-6 sm:p-8 rounded-2xl border border-masjid-green/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-masjid-green/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-masjid-green/10 flex items-center justify-center text-masjid-green">
                  <IconCertificates className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink font-playfair">Certificate Ledger Search</h2>
                  <p className="text-xs text-masjid-muted">Enter verification hash or certificate token</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                    Verification Code / Token / QR URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => {
                        setTokenInput(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. CERT-NIKAH-2024-089 or scan hash"
                      className="w-full px-4 py-3 pl-11 text-sm bg-white border border-gray-200 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-masjid-green/20 focus:border-masjid-green transition font-mono"
                    />
                    <IconSearch className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
                  )}
                  <p className="text-[11px] text-masjid-muted mt-2">
                    Located directly below the QR code on any printed Noorul Islam Juma Masjid certificate.
                  </p>
                </div>

                <Button type="submit" variant="primary" className="w-full py-3 justify-center gap-2 text-sm">
                  <span>Verify Record Authenticity</span>
                  <IconArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3 text-xs text-masjid-muted">
                <IconShield className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>256-bit cryptographically signed registry compliant with Kerala Waqf digital standards.</span>
              </div>
            </div>

            {/* Supported Certificates Card */}
            <div className="surface-card p-6 rounded-xl border border-gray-200/80">
              <h3 className="text-sm font-bold text-ink mb-3 font-playfair">Recognized Document Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="font-bold text-masjid-green block">Nikah Nama</span>
                  <span className="text-masjid-muted text-[11px]">Marriage Certificate</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="font-bold text-masjid-green block">Family Membership</span>
                  <span className="text-masjid-muted text-[11px]">Mahal Register Card</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="font-bold text-masjid-green block">NOC Certificate</span>
                  <span className="text-masjid-muted text-[11px]">Clearance & Transfer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Instructions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="surface-card p-6 sm:p-7 rounded-2xl border border-masjid-gold/30 bg-gradient-to-br from-white to-masjid-sand/20">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-masjid-gold/15 text-masjid-deepGreen mb-3">
                <IconCheckCircle className="w-3.5 h-3.5 text-masjid-gold" />
                <span>Instant QR Validation</span>
              </span>
              <h3 className="text-base font-bold text-ink font-playfair mb-2">
                Scanning with Mobile Camera?
              </h3>
              <p className="text-xs text-masjid-muted leading-relaxed mb-4">
                All official certificates generated by Noorul Islam Juma Masjid feature a dynamic security QR code on the bottom left corner. Scanning it opens the authoritative digital audit record automatically without typing.
              </p>

              <div className="space-y-3 pt-2 text-xs border-t border-gray-200/60">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-masjid-green text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-masjid-ink">Check the physical document for the gold hologram & QR code.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-masjid-green text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-masjid-ink">Open your smartphone camera or scanner app to read the code.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-masjid-green text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <p className="text-masjid-ink">Match the verified seal and registration number against the paper record.</p>
                </div>
              </div>
            </div>

            {/* Need assistance */}
            <div className="p-5 rounded-xl bg-masjid-deepGreen text-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-masjid-gold">Administrative Registry</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                For foreign embassy legalizations or attestation queries, contact the Mahal General Secretary or visit during office hours.
              </p>
              <div className="pt-2 text-xs font-semibold text-white/90">
                Helpline: +91 495 244 0123 / +91 9447 000 000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
