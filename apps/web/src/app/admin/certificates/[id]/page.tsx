'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { certificatesApi } from '@/lib/api';
import type {
  CertificateDetail,
  NikahCertificateData,
  NocCertificateData,
  MembershipCertificateData,
} from '@maheall/shared';
import { QRCode } from '@/components/ui/qr-code';
import { Modal } from '@/components/ui/modal';
import {
  IconArrowLeft,
  IconPrinter,
  IconShare,
  IconTrash,
  IconCheck,
  IconAlertCircle,
  IconWhatsApp,
} from '@/components/ui/icons';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CertificateDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Revoke state
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Copied alert
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCertificate() {
      try {
        setLoading(true);
        setError(null);
        const res = await certificatesApi.get(id);
        if (res.success && res.data) {
          setCert(res.data);
        } else {
          setError('Certificate not found.');
        }
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    }
    loadCertificate();
  }, [id]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (!cert) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/verify/${cert.verification_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!cert) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/verify/${cert.verification_token}`;
    const text = `Official Certificate from ${cert.mahal.name}\nType: ${cert.type}\nCertificate No: ${cert.certificate_number}\nRecipient: ${cert.recipient_name}\n\nVerify authenticity online:\n${url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cert || !revokeReason.trim()) return;

    try {
      setRevoking(true);
      setRevokeError(null);
      await certificatesApi.revoke(cert.id, { reason: revokeReason.trim() });
      setShowRevokeModal(false);
      // Reload
      const res = await certificatesApi.get(cert.id);
      if (res.success && res.data) {
        setCert(res.data);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setRevokeError(e.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading certificate template...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4 text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-center gap-2">
          <IconAlertCircle className="w-5 h-5" />
          <span>{error || 'Certificate not found'}</span>
        </div>
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline font-semibold"
        >
          <IconArrowLeft className="w-4 h-4" /> Back to Certificate Registry
        </Link>
      </div>
    );
  }

  const isRevoked = cert.status === 'REVOKED';
  const fullVerificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify/${cert.verification_token}`
      : `/verify/${cert.verification_token}`;

  const issueDateFormatted = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const validUntilFormatted = cert.valid_until
    ? new Date(cert.valid_until).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Screen-only Action Toolbar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/certificates"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{cert.certificate_number}</h1>
              {isRevoked ? (
                <span className="text-xs bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full">
                  Revoked
                </span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                  Active & Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Issued to: {cert.recipient_name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <IconWhatsApp className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
          >
            {copied ? <IconCheck className="w-4 h-4 text-green-600" /> : <IconShare className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Verify URL'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <IconPrinter className="w-4 h-4" />
            <span>Print Certificate (A4)</span>
          </button>

          {/* Revoke Button */}
          {!isRevoked && (
            <button
              type="button"
              onClick={() => {
                setShowRevokeModal(true);
                setRevokeReason('');
                setRevokeError(null);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
              title="Revoke Certificate"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Revocation Banner if revoked */}
      {isRevoked && (
        <div className="print:hidden p-4 bg-red-50 border border-red-300 rounded-xl text-sm text-red-800">
          <p className="font-bold flex items-center gap-1.5">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Certificate Revoked</span>
          </p>
          <p className="text-xs mt-0.5">
            Reason: {cert.revoked_reason || 'Administrative Revocation'} | Revoked on:{' '}
            {cert.revoked_at ? new Date(cert.revoked_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-FIDELITY OFFICIAL A4 PRINTABLE CERTIFICATE TEMPLATE */}
      {/* ========================================================================= */}
      <div
        id="printable-certificate"
        className="relative bg-white text-gray-900 shadow-xl print:shadow-none mx-auto border border-gray-200 print:border-none p-4 sm:p-10 w-full max-w-[210mm] min-h-[297mm] overflow-hidden"
      >
        {/* Double Border Frame with Corner Embellishments */}
        <div className="relative border-4 border-double border-emerald-950 p-6 sm:p-8 min-h-[275mm] flex flex-col justify-between">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
            <div className="text-center">
              <div className="text-[120px] font-bold text-emerald-950 font-serif">MAHEALL</div>
            </div>
          </div>

          {/* Revoked diagonal watermark if revoked */}
          {isRevoked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
              <div className="transform -rotate-45 border-8 border-red-600/40 text-red-600/40 font-black text-6xl px-12 py-4 rounded-xl tracking-widest uppercase">
                REVOKED
              </div>
            </div>
          )}

          {/* TOP SECTION: MAHAL OFFICIAL HEADER */}
          <div className="relative z-10 text-center border-b-2 border-emerald-900/60 pb-5">
            {/* Islamic Bismillah */}
            <div className="text-center mb-2">
              <p className="arabic text-xl sm:text-2xl text-emerald-950 font-medium">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p className="text-[11px] text-gray-500 italic mt-0.5">
                In the Name of Allah, the Most Gracious, the Most Merciful
              </p>
            </div>

            {/* Mahal Name in English */}
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-wide">
              {cert.mahal.name}
            </h1>

            {/* Registration & Waqf info */}
            <div className="text-[11px] text-gray-600 font-medium mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5">
              {cert.mahal.waqf_number && <span>Waqf Reg. No: {cert.mahal.waqf_number}</span>}
              {cert.mahal.registration_type && (
                <span>Reg Type: {cert.mahal.registration_type}</span>
              )}
              {cert.mahal.address && <span>{cert.mahal.address}</span>}
              {cert.mahal.district && <span>{cert.mahal.district}, Kerala</span>}
              {cert.mahal.contact_phone && <span>Ph: {cert.mahal.contact_phone}</span>}
            </div>
          </div>

          {/* CERTIFICATE TITLE BANNER */}
          <div className="relative z-10 text-center my-4">
            <div className="inline-block bg-emerald-950 text-white px-8 py-1.5 rounded-md shadow-xs">
              <p className="text-sm sm:text-base font-black tracking-wider uppercase">
                {cert.type === 'NIKAH' && 'Nikah / Marriage Certificate'}
                {cert.type === 'NOC' && 'No Objection Certificate (NOC)'}
                {cert.type === 'MEMBERSHIP' && 'Mahal Membership & Identity Certificate'}
              </p>
            </div>

            {/* Certificate # and Issued Date Bar */}
            <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mt-3 px-2">
              <div>
                <span className="text-gray-500">Certificate No: </span>
                <span className="font-mono text-emerald-950 font-bold">
                  {cert.certificate_number}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Date: </span>
                <span className="text-gray-900 font-bold">{issueDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* MAIN BODY CONTENT */}
          <div className="relative z-10 flex-1 my-2 text-xs sm:text-sm text-gray-800 leading-relaxed">
            {/* 1. NIKAH CERTIFICATE CONTENT */}
            {cert.type === 'NIKAH' && (
              <NikahCertificateBody
                data={cert.data as unknown as NikahCertificateData}
                certNumber={cert.certificate_number}
              />
            )}

            {/* 2. NOC CERTIFICATE CONTENT */}
            {cert.type === 'NOC' && (
              <NocCertificateBody
                data={cert.data as unknown as NocCertificateData}
                mahalName={cert.mahal.name}
                mahalNameMl={cert.mahal.name_ml}
                validUntil={validUntilFormatted}
              />
            )}

            {/* 3. MEMBERSHIP CERTIFICATE CONTENT */}
            {cert.type === 'MEMBERSHIP' && (
              <MembershipCertificateBody
                data={cert.data as unknown as MembershipCertificateData}
                mahalName={cert.mahal.name}
                mahalNameMl={cert.mahal.name_ml}
                validUntil={validUntilFormatted}
              />
            )}
          </div>

          {/* STATUTORY LEGAL DISCLAIMER */}
          <div className="relative z-10 border-t border-b border-gray-200 py-2.5 my-3 bg-gray-50/75 rounded text-[10px] sm:text-[11px] text-gray-600 text-center leading-normal">
            <p className="font-semibold text-gray-700">
              Statutory Declaration:
            </p>
            <p className="mt-0.5">
              This certificate is officially issued under the authority of the Mahal Committee as
              recorded in the permanent register. Scan the QR code below or visit the verification
              portal to verify authenticity.
            </p>
          </div>

          {/* FOOTER: QR CODE & OFFICIAL SIGNATORIES */}
          <div className="relative z-10 flex flex-row items-end justify-between gap-4 pt-2">
            {/* QR Code Section */}
            <div className="flex items-center gap-3">
              <div className="border border-gray-300 p-1 rounded bg-white shadow-2xs">
                <QRCode value={fullVerificationUrl} size={76} />
              </div>
              <div className="text-[10px] text-gray-600">
                <p className="font-bold text-emerald-950">Digital Verification</p>
                <p className="font-mono text-[9px] text-gray-500 mt-0.5">
                  Token: {cert.verification_token.substring(0, 12)}...
                </p>
                <p className="text-[9px] text-emerald-800 underline mt-0.5">
                  /verify/{cert.verification_token.substring(0, 8)}
                </p>
              </div>
            </div>

            {/* Signatures & Seal Block */}
            <div className="flex items-end gap-6 sm:gap-10 text-center text-[10px] sm:text-xs">
              {cert.type === 'NIKAH' && (
                <div>
                  <div className="h-10 border-b border-dashed border-gray-400 w-20 sm:w-24 mb-1" />
                  <p className="font-bold text-gray-800">Qazi</p>
                  <p className="text-[9px] text-gray-500">Solemnizer</p>
                </div>
              )}

              <div>
                <div className="h-10 border-b border-dashed border-gray-400 w-20 sm:w-28 mb-1" />
                <p className="font-bold text-gray-800">General Secretary</p>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-gray-400 w-20 sm:w-28 mb-1" />
                <p className="font-bold text-gray-800">President</p>
              </div>

              {/* Seal Box */}
              <div className="hidden sm:block">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-800/40 flex items-center justify-center text-[8px] text-emerald-900/60 font-bold uppercase rotate-12">
                  Official Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revocation Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Certificate"
        subtitle={`Certificate #: ${cert.certificate_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleRevoke} className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to revoke this certificate for{' '}
            <strong className="text-gray-900">{cert.recipient_name}</strong>? Once revoked, the
            public verification page will permanently indicate this certificate as invalid.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Revocation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Discrepancy in registration / Transferred to another Mahal..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {revokeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {revokeError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRevokeModal(false)}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={revoking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {revoking ? 'Revoking...' : 'Confirm Revocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// =============================================================================
// NIKAH TEMPLATE COMPONENT
// =============================================================================
function NikahCertificateBody({
  data,
  certNumber,
}: {
  data: NikahCertificateData;
  certNumber: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-center italic text-gray-700 text-xs sm:text-sm">
        This is to certify that the marriage (Nikah) between the following parties was solemnized in
        accordance with Islamic Shari'ah and duly registered in the official marriage register.
      </p>

      {/* Two Column Grid for Groom & Bride */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GROOM BOX */}
        <div className="border border-emerald-900/30 rounded-lg p-3 bg-emerald-50/20">
          <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-900/20">
            <span className="font-bold text-emerald-950 uppercase tracking-wide text-xs">
              GROOM
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div>
              <span className="text-gray-500">Full Name: </span>
              <span className="font-bold text-gray-900">{data.groom_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Father: </span>
              <span className="font-semibold text-gray-800">{data.groom_father}</span>
            </div>
            <div>
              <span className="text-gray-500">House: </span>
              <span className="font-medium text-gray-800">{data.groom_house}</span>
            </div>
            <div>
              <span className="text-gray-500">Mahal / Place: </span>
              <span className="font-medium text-gray-800">{data.groom_mahal}</span>
            </div>
            {data.groom_dob && (
              <div>
                <span className="text-gray-500">Date of Birth: </span>
                <span className="font-medium text-gray-800">{data.groom_dob}</span>
              </div>
            )}
          </div>
        </div>

        {/* BRIDE BOX */}
        <div className="border border-emerald-900/30 rounded-lg p-3 bg-emerald-50/20">
          <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-900/20">
            <span className="font-bold text-emerald-950 uppercase tracking-wide text-xs">
              BRIDE
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div>
              <span className="text-gray-500">Full Name: </span>
              <span className="font-bold text-gray-900">{data.bride_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Father: </span>
              <span className="font-semibold text-gray-800">{data.bride_father}</span>
            </div>
            <div>
              <span className="text-gray-500">House: </span>
              <span className="font-medium text-gray-800">{data.bride_house}</span>
            </div>
            <div>
              <span className="text-gray-500">Mahal / Place: </span>
              <span className="font-medium text-gray-800">{data.bride_mahal}</span>
            </div>
            {data.bride_dob && (
              <div>
                <span className="text-gray-500">Date of Birth: </span>
                <span className="font-medium text-gray-800">{data.bride_dob}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOLEMNIZATION DETAILS TABLE */}
      <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
        <div className="bg-gray-100/80 px-3 py-1.5 font-bold text-gray-800 border-b border-gray-200 uppercase tracking-wide">
          Solemnization & Officiation Details
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <span className="text-gray-500">Date & Time of Nikah: </span>
            <span className="font-bold text-gray-900">
              {data.nikah_date} {data.nikah_time ? `at ${data.nikah_time}` : ''}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Venue: </span>
            <span className="font-semibold text-gray-900">{data.nikah_venue}</span>
          </div>
          <div>
            <span className="text-gray-500">Dower (Mahr): </span>
            <span className="font-semibold text-emerald-950">
              {data.mahr_description || data.mahr_amount || 'Prompt Dower Settled'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Guardian (Wali): </span>
            <span className="font-semibold text-gray-900">
              {data.wali_name} ({data.wali_relation})
            </span>
          </div>
          <div>
            <span className="text-gray-500">Witness 1: </span>
            <span className="font-medium text-gray-900">{data.witness1_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Witness 2: </span>
            <span className="font-medium text-gray-900">{data.witness2_name}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500">Officiating Qazi / Solemnizer: </span>
            <span className="font-bold text-emerald-950">{data.qazi_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// NOC TEMPLATE COMPONENT
// =============================================================================
function NocCertificateBody({
  data,
  mahalName,
  mahalNameMl,
  validUntil,
}: {
  data: NocCertificateData;
  mahalName: string;
  mahalNameMl?: string | null;
  validUntil: string | null;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="text-justify leading-relaxed space-y-3">
        <p>
          This is to certify that{' '}
          <strong className="text-emerald-950 font-bold">
            {data.member_name || data.family_name}
          </strong>{' '}
          {data.member_name ? (
            <>
              belonging to the family of{' '}
              <strong className="text-gray-900">{data.family_name}</strong> (Family #{data.family_number})
            </>
          ) : (
            <>(Family #{data.family_number})</>
          )}{' '}
          has been a bonafide member of this Mahal (
          <strong className="text-gray-900">{mahalName}</strong>).
        </p>

        <p>
          The Mahal Committee has{' '}
          <strong className="text-emerald-950 font-bold">NO OBJECTION</strong> to the transfer /
          registration of their membership to:
        </p>

        <div className="p-4 bg-emerald-50/40 border border-emerald-900/30 rounded-lg text-center my-2">
          <p className="text-sm font-bold text-emerald-950 uppercase">{data.target_mahal_name}</p>
          <p className="text-xs text-gray-600 mt-0.5">{data.destination_place}</p>
        </div>

        <p>
          <strong>Reason for NOC:</strong> {data.reason}
        </p>

        {data.dues_cleared && (
          <p className="text-xs bg-green-50 text-green-900 p-2.5 rounded border border-green-200">
            ✓ <strong>Clearance Confirmation:</strong> All monthly subscriptions, pirivu, and dues to
            this Mahal have been fully paid and cleared up to the date of issue.
          </p>
        )}

        {validUntil && (
          <p className="text-xs text-gray-600">
            This certificate is valid until:{' '}
            <strong className="text-gray-900">{validUntil}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MEMBERSHIP TEMPLATE COMPONENT
// =============================================================================
function MembershipCertificateBody({
  data,
  mahalName,
  validUntil,
}: {
  data: MembershipCertificateData;
  mahalName: string;
  mahalNameMl?: string | null;
  validUntil: string | null;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="text-justify leading-relaxed space-y-3">
        <p>
          This is to certify that{' '}
          <strong className="text-emerald-950 font-bold">
            {data.member_name || `${data.family_name} Family`}
          </strong>
          , residing at{' '}
          <strong className="text-gray-900">{data.house_name || data.family_name}</strong>
          {data.ward_name ? `, Ward: ${data.ward_name}` : ''} (Family Reg. #{data.family_number}), is a
          registered, recognized member in good standing of{' '}
          <strong className="text-emerald-950">{mahalName}</strong>.
        </p>

        <div className="p-4 bg-emerald-50/40 border border-emerald-900/30 rounded-lg my-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            CERTIFICATE ISSUED FOR PURPOSE:
          </p>
          <p className="text-sm font-bold text-emerald-950 mt-1">
            {data.purpose}
            {data.custom_purpose_text ? ` — ${data.custom_purpose_text}` : ''}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-gray-700">
          This certificate is issued upon the request of the member for the aforementioned purpose
          and is confirmed by the official records maintained by the Mahal Executive Committee.
        </p>

        {validUntil && (
          <p className="text-xs text-gray-600">
            Valid Until: <strong className="text-gray-900">{validUntil}</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
