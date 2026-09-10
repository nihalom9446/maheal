'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMember } from '../../../lib/member-context';
import { MemberCertificateRecord } from '../../../lib/member-data';
import {
  IconCertificates,
  IconPlus,
  IconCheckCircle,
  IconPrinter,
  IconWhatsApp,
  IconDownload,
  IconAlertCircle,
  IconEye,
} from '../../../components/ui/icons';

export default function MyCertificatesPage() {
  const { profile, familyMembers, certificates, requestCertificate } = useMember();
  const [selectedCert, setSelectedCert] = useState<MemberCertificateRecord | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Form State
  const [certType, setCertType] = useState<'NIKAH' | 'NOC' | 'MEMBERSHIP'>('MEMBERSHIP');
  const [selectedMemberName, setSelectedMemberName] = useState(familyMembers[0]?.name || '');
  const [purpose, setPurpose] = useState('Minority Higher Education Scholarship');
  const [details, setDetails] = useState('');
  const [contactPhone, setContactPhone] = useState(profile?.phone || '+91 98460 12345');
  const [submittedCert, setSubmittedCert] = useState<MemberCertificateRecord | null>(null);

  const getCertTypeBadge = (type: string) => {
    switch (type) {
      case 'NIKAH':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'NOC':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const created = requestCertificate({
      type: certType,
      member_name: selectedMemberName,
      purpose,
      details,
      phone: contactPhone,
    });
    setSubmittedCert(created);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Official Certificate Vault
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Official certificates from the Mahal office with digital QR verification
          </p>
        </div>

        <button
          onClick={() => {
            setSubmittedCert(null);
            setIsRequestModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 border border-amber-300 shadow-lg shadow-amber-950/20 transition-all duration-200 hover:-translate-y-0.5"
        >
          <IconPlus className="w-4 h-4" />
          <span>Request Certificate</span>
        </button>
      </div>

      {/* 2. CERTIFICATES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900">
            Issued Family Certificates ({certificates.length})
          </h3>
          <span className="text-xs text-gray-400">
            Click to view and print official certificate with QR seal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-emerald-900/10 p-6 shadow-glass-card hover-lift flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCertTypeBadge(
                      cert.type
                    )}`}
                  >
                    {cert.type}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {cert.issued_date}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-gray-900 leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-gray-700 font-medium mt-2">
                    Recipient: <strong className="text-gray-900">{cert.recipient_name}</strong>
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    Purpose: {cert.purpose}
                  </p>
                </div>

                <div className="p-3 bg-pearl-50 rounded-2xl text-[11px] font-mono text-gray-600 flex items-center justify-between border border-gray-100">
                  <span>No: {cert.certificate_number}</span>
                  <span className="text-emerald-800 font-bold">✓ Verified Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition border border-emerald-200"
                >
                  <IconEye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View Document</span>
                </button>

                <Link
                  href={`/verify/${cert.verification_token}`}
                  className="p-2.5 rounded-2xl text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 transition border border-transparent hover:border-emerald-200"
                  title="Verify Official QR Link"
                >
                  <span className="text-xs font-black font-mono">QR</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MODAL: REQUEST NEW CERTIFICATE */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Request Official Mahal Certificate
                </h3>
                <p className="text-xs text-gray-500">
                  Online application for official certificate
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {submittedCert ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <IconCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">Certificate Generated!</h4>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Certificate No: <strong>{submittedCert.certificate_number}</strong>
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    Your certificate is ready. You can download or print it immediately.
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCert(submittedCert);
                      setIsRequestModalOpen(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition"
                  >
                    View & Print Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="py-3 px-4 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="space-y-4">
                {/* Certificate Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Select Certificate Type
                  </label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value as 'NIKAH' | 'NOC' | 'MEMBERSHIP')}
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MEMBERSHIP">Membership & Residence Certificate</option>
                    <option value="NIKAH">Nikah Clearance / NOC</option>
                    <option value="NOC">Mahal Transfer & Clearance NOC</option>
                  </select>
                </div>

                {/* Member selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Certificate Recipient Member
                  </label>
                  <select
                    value={selectedMemberName}
                    onChange={(e) => setSelectedMemberName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} - {m.relationship}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purpose Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Purpose of Certificate
                  </label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Higher Education Minority Scholarship Scheme / Haj Application"
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Extra Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional reference or submission department..."
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2.5">
                  <IconAlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Note: Certificates include an authenticated verification QR code and digital seal recognized by government departments and embassies.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-md transition"
                  >
                    Submit & Generate Certificate &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL: FULL DIGITAL CERTIFICATE VIEWER */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <IconCertificates className="w-5 h-5 text-emerald-800" />
                <span className="font-bold text-sm text-gray-900">Official Authenticated Certificate</span>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Formal Certificate Layout */}
            <div className="p-8 bg-white border-4 border-double border-emerald-900 rounded-3xl space-y-6 text-gray-900 relative print:p-0">
              {/* Header Motif */}
              <div className="text-center space-y-1.5 border-b-2 border-emerald-900 pb-4">
                <div className="w-14 h-14 mx-auto mb-1 flex items-center justify-center">
                  <Image
                    src="/mundupara_emblem.png"
                    alt="Official Seal"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="text-xs font-black tracking-widest text-emerald-950 uppercase">
                  MUNDUPARA MUHIYUDHEEN JUMA MASJID MAHAL JAMA&apos;ATH
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  Waqf Reg: KSWB/CLT/2018/489 &bull; Calicut District, Kerala, India
                </div>
              </div>

              {/* Title & Badge */}
              <div className="text-center space-y-1">
                <span className="inline-block px-5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
                  {selectedCert.title}
                </span>
                <div className="text-[11px] font-mono text-gray-500 pt-1">
                  Certificate No: <strong>{selectedCert.certificate_number}</strong>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-800 leading-relaxed">
                <p>
                  This is to certify that <strong>{selectedCert.recipient_name}</strong> is a registered member of Mundupara Muhiyudheen Juma Masjid Mahal Jama&apos;ath under <strong>Family #{profile?.family_number} ({profile?.house_name})</strong>, situated at Door No. {profile?.door_number}, {profile?.ward_name}.
                </p>

                <p>
                  <strong>Purpose:</strong> {selectedCert.purpose}
                  <br />
                  <strong>Issued Date:</strong> {selectedCert.issued_date}
                  {selectedCert.valid_until && (
                    <>
                      <br />
                      <strong>Valid Until:</strong> {selectedCert.valid_until}
                    </>
                  )}
                </p>
              </div>

              {/* Seal & Signature Footer */}
              <div className="pt-6 border-t border-gray-300 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="w-16 h-16 border-2 border-dashed border-emerald-700 rounded-xl flex items-center justify-center font-bold font-mono text-[10px] text-emerald-900 bg-emerald-50">
                    QR SEAL
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Token: {selectedCert.verification_token}</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-bold text-gray-900">General Secretary</div>
                  <div className="text-[10px] text-gray-400">Digital Seal & Verification</div>
                </div>
              </div>
            </div>

            {/* Action buttons: Print & WhatsApp Share */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*OFFICIAL MAHAL CERTIFICATE*\n\nType: ${selectedCert.title}\nCertificate No: ${selectedCert.certificate_number}\nRecipient: ${selectedCert.recipient_name}\nFamily: #${profile?.family_number}\n\n- Mundupara Muhiyudheen Juma Masjid`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition"
              >
                <IconWhatsApp className="w-4 h-4 text-emerald-800" />
                <span>Share WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition"
              >
                <IconPrinter className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
