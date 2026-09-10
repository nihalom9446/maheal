'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../components/ui/page-header';

export default function ServicesPage() {
  return (
    <div className="pb-24">
      <PageHeader
        badge="Civic & Welfare Infrastructure"
        title="Mahal Services & Community Administration"
        description="Comprehensive official services, authenticated certificate issuance under Kerala State Waqf Board, SKIMVB Madrasa education, and relief assistance."
        breadcrumbs={[{ label: 'Services' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Service 1: Nikah & Official Certificates */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0A5C4D] uppercase tracking-wider">
                Service 01 • Certificates
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
                Nikah &amp; Official NOC Certificates
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Marriage clearance, NOC, transfer, and family membership certificates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Available Certificates:</strong>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li>Nikah (Marriage) Certificate with QR verification</li>
                <li>NOC / Transfer Certificate for Inter-Mahal relocation</li>
                <li>Family / Membership Certificate for Passport/Haj/Scholarship</li>
                <li>Madrasa Study &amp; Character Certificate</li>
              </ul>
            </div>

            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Required Documentation:</strong>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li>Mahal Family Number &amp; Household Head identification</li>
                <li>Aadhaar / Passport copy of applicant and spouse</li>
                <li>Previous 3 months Pirivu clearance record</li>
                <li>Qazi / Imam endorsement from officiating Masjid</li>
              </ul>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Processing Time</span>
                <p className="text-stone-800 font-medium">Same day or 24 Hours for urgent cases</p>
                <p className="text-[11px] text-stone-500">Official seal and cryptographic QR code included.</p>
              </div>

              <Link
                href="/portal"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#063F35] text-white rounded-xl text-xs font-bold hover:bg-[#022C27] transition"
              >
                Apply via Member Passport &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Service 2: Madrasa Administration */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0A5C4D] uppercase tracking-wider">
                Service 02 • Madrasa Education
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
                Noorul Islam Madrasa Administration (SKIMVB)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Affiliated with Samastha Kerala Islam Matha Vidyabhyasa Board (Reg: SKIMVB/KKD/1482)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Academic Syllabus:</strong>
              <p className="leading-relaxed">
                Primary and secondary Islamic curriculum from Standard 1 to Standard 10 covering Quranic recitation with Tajweed, Fiqh, Aqeedah, Akhlaq, and Islamic history.
              </p>
              <p className="text-stone-500 font-mono text-[11px]">Timings: Daily 06:30 AM – 08:30 AM</p>
            </div>

            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Parental Digital Portal:</strong>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li>Track child&apos;s daily attendance records</li>
                <li>Review monthly exam marks and rank cards</li>
                <li>Pay Madrasa fees online with instant digital receipts</li>
                <li>Receive teacher notifications and event circulars</li>
              </ul>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Annual Admission</span>
                <p className="text-stone-800 font-medium">Open in Shawwal / June annually</p>
                <p className="text-[11px] text-stone-500">Admissions open for children aged 5 and above.</p>
              </div>

              <Link
                href="/portal/madrasa"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#063F35] text-white rounded-xl text-xs font-bold hover:bg-[#022C27] transition"
              >
                View Enrolled Children &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Service 3: Welfare & Relief Cell */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0A5C4D] uppercase tracking-wider">
                Service 03 • Welfare Programs
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
                Mahal Welfare &amp; Relief Cell
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Medical assistance, pensions, marriage aid, and emergency relief distribution
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Medical &amp; Healthcare Aid:</strong>
              <p className="leading-relaxed">
                Emergency financial grants for major surgeries, dialysis patients, and recurring monthly medical allowances for bedridden elderly residents across all 6 wards.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Family Assistance Schemes:</strong>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                <li>Marriage financial aid for underprivileged brides</li>
                <li>Monthly pension scheme for destitute widows and orphans</li>
                <li>Ramadan food ration kits and Eid welfare packages</li>
                <li>Educational scholarships for needy college students</li>
              </ul>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Relief Committee</span>
                <p className="text-stone-800 font-medium">Sub-committee convenes monthly</p>
                <p className="text-[11px] text-stone-500">Contact Ward Convener or Office for application submission.</p>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#063F35] rounded-xl text-xs font-bold transition"
              >
                Inquire at Office &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Service 4: Online Pirivu & Transparency */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#0A5C4D] uppercase tracking-wider">
                Service 04 • Monthly Subscriptions &amp; Accounts
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
                Online Monthly Pirivu &amp; Accounting Transparency
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Digital receipts, UPI payments, and bank transfer support
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">Seamless Digital Payment:</strong>
              <p className="leading-relaxed">
                Pay your household monthly Pirivu dues directly online using UPI apps (GPay, PhonePe, Paytm), QR code, or net banking with zero hassle and instant receipt generation.
              </p>
            </div>

            <div className="space-y-2">
              <strong className="text-stone-900 block text-xs">12-Month Payment Ledger:</strong>
              <p className="leading-relaxed">
                Review your complete 12-month payment history in the Member Passport, track cleared months, download PDF receipts anytime, and receive instant WhatsApp acknowledgments.
              </p>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Segregated Funds</span>
                <p className="text-stone-800 font-medium">General, Zakat &amp; Madrasa Accounts</p>
                <p className="text-[11px] text-stone-500">Audited annual financial statements presented at General Body.</p>
              </div>

              <Link
                href="/portal/pirivu"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#063F35] text-white rounded-xl text-xs font-bold hover:bg-[#022C27] transition"
              >
                View My Pirivu Dues &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
