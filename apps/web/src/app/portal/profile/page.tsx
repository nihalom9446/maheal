'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '../../../lib/member-context';
import {
  IconUser,
  IconCheckCircle,
  IconAlertCircle,
  IconPhone,
  IconLogOut,
} from '../../../components/ui/icons';

export default function MemberProfilePage() {
  const router = useRouter();
  const { profile, updateConsent, logout } = useMember();

  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maheall_member_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.whatsapp === 'boolean') setWhatsappAlerts(parsed.whatsapp);
        if (typeof parsed.sms === 'boolean') setSmsAlerts(parsed.sms);
        if (typeof parsed.email === 'boolean') setEmailAlerts(parsed.email);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleConsent = () => {
    if (!profile) return;
    updateConsent(!profile.dpdpa_consent);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        'maheall_member_preferences',
        JSON.stringify({
          whatsapp: whatsappAlerts,
          sms: smsAlerts,
          email: emailAlerts,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    router.push('/portal/login');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Profile & Privacy Settings
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Digital Personal Data Protection Act (DPDPA 2023) and membership details
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
        >
          <IconLogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. MEMBER ACCOUNT CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-sm">
            {profile?.head_name.slice(0, 1) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                {profile?.head_name || 'Abdurahiman Musliyar'}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                FAM #{profile?.family_number || 104}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">
              Phone: {profile?.phone || '+91 98460 12345'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="text-gray-400 text-[10px] block uppercase font-bold">House Name</span>
            <span className="font-bold text-gray-800">{profile?.house_name}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="text-gray-400 text-[10px] block uppercase font-bold">Door Number</span>
            <span className="font-mono font-bold text-gray-800">{profile?.door_number}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <span className="text-gray-400 text-[10px] block uppercase font-bold">Ward Area</span>
            <span className="font-bold text-gray-800">{profile?.ward_name}</span>
          </div>
        </div>
      </div>

      {/* 3. DPDPA 2023 PRIVACY & DATA CONSENT SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              DPDPA 2023 Compliance & Data Privacy Disclosure
            </h3>
            <p className="text-xs text-emerald-700">
              Rights under Personal Data Protection law
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-gray-600 leading-relaxed bg-gray-50/80 p-4 rounded-xl border border-gray-200/70">
          <p>
            In accordance with India&apos;s <strong>Digital Personal Data Protection Act (DPDPA) 2023</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1 text-gray-700">
            <li>
              <strong>Purpose Limitation:</strong> Your family and contact details are collected strictly for Mahal administration, Madrasa student tracking, verified certificate issuance, and community notices.
            </li>
            <li>
              <strong>No Third-Party Commercial Sharing:</strong> Mahal data is never sold, shared, or processed for commercial advertisement purposes.
            </li>
            <li>
              <strong>Right of Correction & Erasure:</strong> You can request corrections or updates to your family records at any time through this portal.
            </li>
            <li>
              <strong>Data Fiduciary:</strong> Noorul Islam Juma Masjid Mahal Committee is the official Data Fiduciary for registered members.
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <IconCheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Consent Status: ACTIVE</span>
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              Consent recorded on: {profile?.dpdpa_consent_date ? new Date(profile.dpdpa_consent_date).toLocaleDateString('en-IN') : '2026-01-10'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleConsent}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 transition"
          >
            Review Consent
          </button>
        </div>
      </div>

      {/* 4. NOTIFICATION PREFERENCES */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Community Notification Channels
            </h3>
            <p className="text-xs text-gray-500">
              Choose your preferred communication channels
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <IconCheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Notification preferences updated successfully!</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 cursor-pointer transition">
            <div>
              <div className="text-xs font-bold text-gray-900">WhatsApp Urgent Alerts & Janazah Notices</div>
              <div className="text-[11px] text-gray-500">WhatsApp demise and urgent community alerts</div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 cursor-pointer transition">
            <div>
              <div className="text-xs font-bold text-gray-900">SMS Pirivu Receipts & Madrasa Alerts</div>
              <div className="text-[11px] text-gray-500">Monthly pirivu digital receipts and madrasa messages</div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
