'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMember } from '@/lib/member-context';
import { getHijriDate } from '@/lib/hijri';
import {
  IconFamily,
  IconReceipt,
  IconMadrasa,
  IconCertificates,
  IconClock,
  IconAlertCircle,
  IconCheckCircle,
  IconWhatsApp,
  IconChevronRight,
  IconDownload,
  IconPrinter,
  IconQrCode,
} from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface PrayerTiming {
  name: string;
  time: string;
  isNext?: boolean;
}

export default function MemberDashboardPage() {
  const { profile, familyMembers, pirivuRecords, madrasaChildren, announcements } = useMember();
  const [hijriDate, setHijriDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Calculate Pirivu stats
  const unpaidMonths = pirivuRecords.filter((r) => r.status === 'UNPAID');
  const totalOverdue = unpaidMonths.reduce((sum, r) => sum + r.amount, 0);
  const isPirivuUpToDate = unpaidMonths.length === 0;

  // Calculate Madrasa stats
  const totalChildren = madrasaChildren.length;
  const avgAttendance =
    totalChildren > 0
      ? Math.round(
          madrasaChildren.reduce((acc, c) => acc + c.attendance_stats.percentage, 0) / totalChildren
        )
      : 0;

  // Prayer Timetable for Today (Kerala Shafi'i Standard)
  const todayPrayers: PrayerTiming[] = [
    { name: 'Fajr', time: '05:08 AM' },
    { name: 'Sunrise', time: '06:19 AM' },
    { name: 'Dhuhr', time: '12:28 PM' },
    { name: 'Asr', time: '03:44 PM' },
    { name: 'Maghrib', time: '06:33 PM', isNext: true },
    { name: 'Isha', time: '07:46 PM' },
  ];

  useEffect(() => {
    const info = getHijriDate(new Date());
    setHijriDate(info.formattedEn);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. DIGITAL MAHAL FAMILY SMART CARD (Institutional Forest Green & Gold Trim) */}
      <section className="relative overflow-hidden rounded-2xl bg-masjid-deepGreen text-white p-6 sm:p-8 shadow-md border-2 border-masjid-gold/40">
        {/* Subtle Decorative Geometry */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-masjid-green/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            {/* Top Card Chips: NFC + Family # + NRI Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-masjid-gold/15 border border-masjid-gold/40 text-masjid-gold text-xs font-mono font-bold">
                <span>DIGITAL HOUSEHOLD PASSPORT</span>
              </div>

              <span className="px-3 py-1 rounded-lg bg-masjid-green border border-white/15 text-white text-xs font-mono font-bold">
                FAMILY #{profile?.family_number || 104}
              </span>

              {profile?.is_nri_household ? (
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-semibold flex items-center gap-1">
                  <span>UAE</span>
                  <span>•</span>
                  <span>NRI Household</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-gray-200 text-xs font-medium">
                  <span>Resident</span>
                </span>
              )}

              <span className="text-xs text-gray-300 font-medium">
                {profile?.ward_name || 'Ward 3 - Valiya Parambu'}
              </span>
            </div>

            {/* House Name & Head Info */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-playfair flex items-baseline flex-wrap gap-3">
                <span>{profile?.house_name || 'Baitul Noor'}</span>
              </h1>
              <p className="text-xs text-gray-300">
                Mundupara Muhiyudheen Juma Masjid Mahal Membership Register
              </p>
            </div>

            {/* Household Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Head of Family</span>
                <span className="font-bold text-white text-sm">{profile?.head_name || 'Abdurahiman Musliyar'}</span>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Door / House No</span>
                <span className="font-bold font-mono text-white text-sm">{profile?.door_number || '14/280-B'}</span>
                <span className="text-[11px] text-gray-300 block">{profile?.ward_name?.split('-')[0] || 'Ward 3'}</span>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Registered Members</span>
                <span className="font-bold text-white text-sm font-mono">{familyMembers.length} Members</span>
                <span className="text-[11px] text-emerald-400 font-medium block">Verified Active</span>
              </div>
            </div>
          </div>

          {/* Right Action: QR Code Instant Counter Scan Card */}
          <div className="flex flex-col items-center sm:items-end gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsQrModalOpen(true)}
              type="button"
              className="w-full sm:w-auto p-4 rounded-xl bg-white text-ink flex items-center gap-3.5 shadow-sm hover:bg-gray-50 transition border border-masjid-gold/50"
            >
              <div className="w-10 h-10 rounded-lg bg-masjid-deepGreen text-masjid-gold flex items-center justify-center font-mono font-bold text-sm">
                QR
              </div>
              <div className="text-left pr-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-masjid-green block">
                  Office Clerk QR
                </span>
                <span className="text-xs font-bold text-ink">
                  Instant Counter Verification
                </span>
                <span className="text-[10px] text-masjid-muted block">
                  Office counter scan sync
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/portal/pirivu"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-masjid-gold text-masjid-deepGreen text-xs font-bold shadow-xs hover:bg-masjid-gold/90 transition flex items-center justify-center gap-1.5"
              >
                <IconReceipt className="w-4 h-4 text-masjid-deepGreen" />
                <span>Pay Pirivu</span>
              </Link>

              <Link
                href="/portal/certificates"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-masjid-green text-white text-xs font-semibold border border-white/10 hover:bg-masjid-green/80 transition flex items-center justify-center gap-1.5"
              >
                <IconCertificates className="w-4 h-4 text-masjid-gold" />
                <span>Certificates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE QUICK METRIC & STATUS CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1: Pirivu Dues Status */}
        <div className="surface-card rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-masjid-muted">
                <IconReceipt className="w-4 h-4 text-masjid-green" />
                <span>Pirivu Dues Status</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isPirivuUpToDate
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {isPirivuUpToDate ? 'Up to Date ✓' : `${unpaidMonths.length} Months Overdue`}
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-ink font-mono">
                {isPirivuUpToDate ? '₹0.00' : `₹${totalOverdue}`}
              </div>
              <p className="text-xs text-masjid-muted mt-1">
                {isPirivuUpToDate ? (
                  <span className="text-emerald-700 font-medium">
                    Monthly subscription for this year is fully paid
                  </span>
                ) : (
                  <span className="text-red-700 font-medium">
                    {unpaidMonths.map((m) => m.monthName).join(', ')} overdue
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-masjid-muted">
              Rate: ₹{profile?.monthly_pirivu || 200}/month
            </span>
            <Link
              href="/portal/pirivu"
              className="text-xs font-bold text-masjid-green hover:underline flex items-center gap-1"
            >
              <span>12-Month Calendar &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Stat 2: Madrasa Children Status */}
        <div className="surface-card rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-masjid-muted">
                <IconMadrasa className="w-4 h-4 text-masjid-green" />
                <span>Madrasa Children</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-masjid-green border border-emerald-200">
                {totalChildren} Enrolled
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-ink font-mono">
                {avgAttendance}%{' '}
                <span className="text-xs font-normal text-masjid-muted font-sans">Avg Attendance</span>
              </div>
              <p className="text-xs text-masjid-muted mt-1">
                {madrasaChildren.map((c) => `${c.name} (Std ${c.class_level})`).join(', ')}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-masjid-muted">Affiliated to SKIMVB</span>
            <Link
              href="/portal/madrasa"
              className="text-xs font-bold text-masjid-green hover:underline flex items-center gap-1"
            >
              <span>Academic Passport &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Stat 3: Next Prayer Countdown */}
        <div className="bg-masjid-deepGreen text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between border border-masjid-green/40 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-masjid-gold font-bold uppercase tracking-wider">
                <IconClock className="w-4 h-4 text-masjid-gold" />
                <span>Next Prayer: Maghrib</span>
              </div>
              <span className="text-[10px] font-mono text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {currentTime || '18:36'}
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-masjid-gold font-mono">
                06:33 PM
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Maghrib prayer time • Shafi'i Standard
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
            <span>{hijriDate || '1448 AH'}</span>
            <span className="text-[11px] text-masjid-gold font-semibold">
              Isha: 07:46 PM
            </span>
          </div>
        </div>
      </section>

      {/* 3. TODAY'S PRAYER TIMETABLE STRIP */}
      <section className="surface-card rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Today&apos;s Masjid Schedule
            </span>
          </div>
          <span className="text-[11px] text-masjid-muted font-mono">Shafi&apos;i Calicut Centroid</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {todayPrayers.map((prayer) => (
            <div
              key={prayer.name}
              className={`p-3 rounded-xl border text-center transition ${
                prayer.isNext
                  ? 'bg-masjid-sand/40 border-masjid-gold/60 ring-1 ring-masjid-gold/30 shadow-xs'
                  : 'bg-canvas-bg border-gray-100 hover:bg-gray-100/60'
              }`}
            >
              <div className="text-xs font-bold text-ink">{prayer.name}</div>
              <div
                className={`text-sm font-bold font-mono mt-1 ${
                  prayer.isNext ? 'text-masjid-green' : 'text-ink'
                }`}
              >
                {prayer.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MAIN DASHBOARD SPLIT: Member Announcements & Quick Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Member Announcements Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink font-playfair tracking-tight">
                Recent Member Notices
              </h2>
            </div>
            <Link
              href="/portal/announcements"
              className="text-xs font-semibold text-masjid-green hover:underline flex items-center gap-1"
            >
              <span>View All ({announcements.length}) &rarr;</span>
            </Link>
          </div>

          <div className="space-y-4">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="surface-card rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ann.priority === 'URGENT'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : ann.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {ann.category}
                    </span>

                    {ann.is_ward_targeted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                        {ann.ward_name || 'Ward 3'}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-masjid-muted font-mono">
                    {new Date(ann.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-ink leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-masjid-green font-medium">
                    Noorul Islam Mahal Office
                  </span>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `*${ann.title}*\n\n${ann.content}\n\n- Mundupara Muhiyudheen Juma Masjid Member Portal`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-masjid-green bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200/60"
                  >
                    <IconWhatsApp className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Share</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Urgent Janazah & Quick Member Action Links */}
        <div className="space-y-6">
          {/* Urgent Janazah Card */}
          <div className="bg-masjid-deepGreen text-white rounded-2xl p-5 border border-masjid-gold/40 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-masjid-gold">
                Janazah Demise Notice
              </h3>
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white font-playfair">
                K. Mohammed Haji (78)
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pt-1">
                House: <strong className="text-white">Baitul Hamd</strong>
                <br />
                Janazah prayer today after Asr (04:45 PM) at Mundupara Muhiyudheen Juma Masjid Cemetery.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-gray-300 flex items-center justify-between">
              <span>May Allah grant Maghfirah</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*Inna Lillahi Wa Inna Ilayhi Raji'un*\n\nDemise notice: K. Mohammed Haji (78), Baitul Hamd has passed away.\nJanazah prayer today after Asr prayer at the main Juma Masjid.\n\nMay Allah grant Maghfirah.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-masjid-gold hover:underline flex items-center gap-1 font-semibold"
              >
                <IconWhatsApp className="w-3.5 h-3.5" />
                <span>Share Notice</span>
              </a>
            </div>
          </div>

          {/* Member Quick Services Navigation Card */}
          <div className="surface-card rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Quick Member Services
            </h3>

            <div className="space-y-2">
              <Link
                href="/portal/family"
                className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg hover:bg-gray-100 text-ink transition group border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-masjid-green/10 text-masjid-green flex items-center justify-center font-bold">
                    <IconFamily className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">My Family Registry</div>
                    <div className="text-[10px] text-masjid-muted">Family Members</div>
                  </div>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 group-hover:text-masjid-green" />
              </Link>

              <Link
                href="/portal/pirivu"
                className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg hover:bg-gray-100 text-ink transition group border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-masjid-green/10 text-masjid-green flex items-center justify-center font-bold">
                    <IconReceipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Pirivu Dues & Receipts</div>
                    <div className="text-[10px] text-masjid-muted">Monthly Subscriptions</div>
                  </div>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 group-hover:text-masjid-green" />
              </Link>

              <Link
                href="/portal/madrasa"
                className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg hover:bg-gray-100 text-ink transition group border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-masjid-green/10 text-masjid-green flex items-center justify-center font-bold">
                    <IconMadrasa className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Madrasa Attendance & Fees</div>
                    <div className="text-[10px] text-masjid-muted">Madrasa Details</div>
                  </div>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 group-hover:text-masjid-green" />
              </Link>

              <Link
                href="/portal/certificates"
                className="flex items-center justify-between p-3 rounded-xl bg-canvas-bg hover:bg-gray-100 text-ink transition group border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-masjid-green/10 text-masjid-green flex items-center justify-center font-bold">
                    <IconCertificates className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink">Certificate Vault & Request</div>
                    <div className="text-[10px] text-masjid-muted">Official Certificates</div>
                  </div>
                </div>
                <IconChevronRight className="w-4 h-4 text-gray-400 group-hover:text-masjid-green" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MODAL: CLERK COUNTER SCAN QR CODE */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-masjid-green">
                Official Mahal Passport QR
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* QR Card Body */}
            <div className="p-6 bg-masjid-deepGreen rounded-xl text-white space-y-4 border border-masjid-gold/30">
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-masjid-gold">
                  FAMILY #{profile?.family_number || 104}
                </div>
                <div className="text-base font-bold text-white font-playfair">
                  {profile?.house_name || 'Baitul Noor'}
                </div>
              </div>

              {/* QR Mock graphic with clean border */}
              <div className="bg-white p-3 rounded-xl mx-auto inline-block shadow-sm">
                <div className="w-32 h-32 border-2 border-masjid-deepGreen flex flex-col items-center justify-center text-masjid-deepGreen">
                  <div className="grid grid-cols-4 gap-1 p-1 w-full h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          i % 2 === 0 || i === 3 || i === 9 || i === 15 ? 'bg-masjid-deepGreen' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-masjid-gold font-mono">
                Token: MAHAL-VERIFIED-{profile?.family_number || 104}-2026
              </div>
            </div>

            <p className="text-xs text-masjid-muted leading-relaxed font-normal">
              Show this QR code at the Mahal clerk counter or Madrasa office for instant identification & receipt synchronization.
            </p>

            <Button
              type="button"
              variant="primary"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full text-xs justify-center"
            >
              Done & Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
