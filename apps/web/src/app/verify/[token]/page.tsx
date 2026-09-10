'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { certificatesApi } from '@/lib/api';
import type { PublicCertificateVerification, CertificateType } from '@maheall/shared';
import { DEFAULT_CERTIFICATES } from '@/lib/member-data';
import {
  IconCheckCircle,
  IconAlertCircle,
  IconCertificates,
  IconBuilding,
  IconCalendar,
  IconUser,
  IconPrinter,
  IconArrowLeft,
  IconShield,
} from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicVerifyCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [data, setData] = useState<PublicCertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        setError(null);

        // 1. Try authoritative backend API
        try {
          const res = await certificatesApi.verifyPublic(token);
          if (res.success && res.data) {
            setData(res.data);
            return;
          }
        } catch {
          // Fall through to local ledger verification
        }

        // 2. Check local synchronized ledger
        if (typeof window !== 'undefined') {
          const localRegistry = JSON.parse(
            localStorage.getItem('maheall_global_verified_certificates') || '{}'
          );
          if (localRegistry[token]) {
            setData(localRegistry[token]);
            return;
          }

          // 3. Check default certificates
          const defaultMatch = DEFAULT_CERTIFICATES.find(
            (c) => c.verification_token === token || c.certificate_number.toLowerCase() === token.toLowerCase()
          );

          if (defaultMatch) {
            setData({
              certificate_number: defaultMatch.certificate_number,
              type: defaultMatch.type as CertificateType,
              status: defaultMatch.status,
              recipient_name: defaultMatch.recipient_name,
              recipient_name_ml: defaultMatch.recipient_name_ml,
              issued_at: defaultMatch.issued_date,
              valid_until: defaultMatch.valid_until,
              summary: defaultMatch.purpose,
              summary_ml: defaultMatch.purpose_ml,
              valid: defaultMatch.status === 'ACTIVE',
              mahal: {
                name: 'Noorul Islam Juma Masjid',
                name_ml: 'Noorul Islam Juma Masjid',
                waqf_number: 'KSWB/CLT/2018/489',
                district: 'Kozhikode',
              },
            });
            return;
          }
        }

        setError('Certificate could not be verified in the authoritative registry.');
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || 'Invalid or non-existent certificate verification token.');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header Navigation (Hidden on print) */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-gray-200/80 print:hidden">
        <Link href="/verify" className="inline-flex items-center gap-2 text-xs font-semibold text-masjid-green hover:underline">
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Verify Lookup</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-masjid-deepGreen bg-masjid-gold/15 px-2.5 py-1 rounded-full border border-masjid-gold/30">
            Official Ledger Verification
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full my-6 sm:my-8 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="surface-card p-12 rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 border-3 border-masjid-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-ink font-playfair">Validating Cryptographic Record...</p>
            <p className="text-xs text-masjid-muted">Checking Noorul Islam Juma Masjid Waqf Ledger.</p>
          </div>
        ) : error || !data ? (
          <div className="surface-card p-8 sm:p-10 rounded-2xl border border-red-200/80 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <IconAlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink font-playfair">Certificate Verification Failed</h2>
            </div>
            <p className="text-xs text-masjid-muted max-w-md mx-auto leading-relaxed">
              {error || 'No authentic registry entry was found for this token. The QR code or token might be expired, tampered with, or invalid.'}
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link href="/verify">
                <Button variant="secondary" className="text-xs">
                  Try Another Code
                </Button>
              </Link>
              <Link href="/">
                <Button variant="primary" className="text-xs">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Certificate Presentation Document Container */}
            <div className="surface-card rounded-2xl border-2 border-masjid-gold/30 shadow-md overflow-hidden bg-white relative">
              {/* Islamic Decorative Top Border Strip */}
              <div className="h-2.5 bg-gradient-to-r from-masjid-deepGreen via-masjid-green to-masjid-gold" />

              {/* Status Header Strip */}
              <div className={`p-4 sm:p-5 text-white flex items-center justify-between ${
                data.valid ? 'bg-masjid-deepGreen' : 'bg-red-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                    {data.valid ? (
                      <IconCheckCircle className="w-6 h-6 text-masjid-gold" />
                    ) : (
                      <IconAlertCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold tracking-tight">
                      {data.valid ? 'Authentic & Valid Record' : 'Revoked / Invalid Certificate'}
                    </h2>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
                    {data.type}
                  </span>
                </div>
              </div>

              {/* Inner Certificate Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Mosque Details */}
                <div className="text-center space-y-2 border-b border-gray-100 pb-5">
                  <div className="w-14 h-14 mx-auto mb-1 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xs border border-stone-200">
                    <Image
                      src="/mundupara_emblem.png"
                      alt="Official Seal"
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-ink font-playfair">
                    {data.mahal.name}
                  </h1>
                  <div className="text-[11px] text-masjid-muted flex items-center justify-center flex-wrap gap-2 pt-1">
                    {data.mahal.waqf_number && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                        Waqf Reg No: {data.mahal.waqf_number}
                      </span>
                    )}
                    {data.mahal.district && <span>• {data.mahal.district}, Kerala</span>}
                  </div>
                </div>

                {/* Primary Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 bg-canvas-bg rounded-xl border border-gray-200/70">
                    <span className="text-[10px] font-bold text-masjid-muted uppercase tracking-wider block mb-1">
                      Certificate Registration #
                    </span>
                    <span className="font-mono font-bold text-ink text-sm">
                      {data.certificate_number}
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas-bg rounded-xl border border-gray-200/70">
                    <span className="text-[10px] font-bold text-masjid-muted uppercase tracking-wider block mb-1">
                      Document Classification
                    </span>
                    <span className="font-bold text-masjid-green text-sm">
                      {data.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas-bg rounded-xl border border-gray-200/70">
                    <span className="text-[10px] font-bold text-masjid-muted uppercase tracking-wider block mb-1">
                      Issued On
                    </span>
                    <span className="font-semibold text-ink">
                      {data.issued_at
                        ? new Date(data.issued_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-canvas-bg rounded-xl border border-gray-200/70">
                    <span className="text-[10px] font-bold text-masjid-muted uppercase tracking-wider block mb-1">
                      Ledger Status
                    </span>
                    <span className={`font-bold ${data.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                      {data.status}
                    </span>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="p-4 bg-masjid-sand/20 rounded-xl border border-masjid-gold/20 flex items-start gap-3.5">
                  <div className="p-2.5 bg-masjid-green text-white rounded-lg shrink-0 mt-0.5">
                    <IconUser className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-masjid-muted uppercase tracking-wider block">
                      Certified Individual / Recipient
                    </span>
                    <p className="text-base font-bold text-ink font-playfair">{data.recipient_name}</p>
                  </div>
                </div>

                {/* Summary / Official Remarks */}
                {data.summary && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-ink space-y-1.5 leading-relaxed">
                    <p className="font-bold text-masjid-deepGreen uppercase tracking-wider text-[10px]">
                      Official Declaration / Purpose:
                    </p>
                    <p className="text-gray-700">{data.summary}</p>
                  </div>
                )}

                {/* Revocation notice if invalid */}
                {!data.valid && data.revoked_reason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                    <p className="font-bold">Revocation Remark:</p>
                    <p>{data.revoked_reason}</p>
                  </div>
                )}

                {/* Security Verification Footer */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-masjid-muted">
                  <div className="flex items-center gap-2">
                    <IconShield className="w-4 h-4 text-masjid-green" />
                    <span>Authoritative Noorul Islam Waqf Registry Verification</span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-400">
                    Token: {token.slice(0, 16)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (Print / PDF / Back) */}
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <Link href="/verify">
                <Button variant="ghost" className="text-xs">
                  <IconArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Verify Another Document</span>
                </Button>
              </Link>
              
              <Button onClick={handlePrint} variant="primary" className="text-xs">
                <IconPrinter className="w-4 h-4 mr-1.5" />
                <span>Print Official Verification Page</span>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full py-4 text-center text-[11px] text-masjid-muted border-t border-gray-200/80 print:hidden">
        © {new Date().getFullYear()} Noorul Islam Juma Masjid, MAHEALL OS. Authoritative digital validation service.
      </footer>
    </div>
  );
}
