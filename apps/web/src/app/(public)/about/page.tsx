'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '../../../components/ui/page-header';

export default function PublicAboutPage() {
  return (
    <div className="pb-24">
      <PageHeader
        badge="Heritage & History"
        title="About Mundupara Muhiyudheen Juma Masjid Mahal"
        description="Seven decades of spiritual guidance, educational empowerment under SKIMVB, and social welfare serving more than 450 families across 6 designated wards under the Kerala State Waqf Board guidelines."
        breadcrumbs={[{ label: 'About' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. History & Heritage */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="border-l-4 border-[#063F35] pl-4">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
                  Historical Background &amp; Establishment
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Origins and history of the Masjid and Mahal Jama&apos;ath
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p>
                  Mundupara Muhiyudheen Juma Masjid was established in 1954 under the leadership of prominent scholars and community elders. Founded with the mission to unite the faithful and foster spiritual growth, the institution has flourished into a comprehensive social and educational center.
                </p>
                <p>
                  Affiliated with the Samastha Kerala Islam Matha Vidyabhyasa Board (SKIMVB) in 1968, Mundupara Muhiyudheen Madrasa provides foundational Islamic education to more than 300 students. For generations, the Mahal has upheld moral development and harmonious community welfare.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-[#F7F8F5] rounded-2xl border border-stone-200 text-center space-y-3">
              <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-fine border border-stone-200 flex items-center justify-center">
                <Image
                  src="/mundupara_emblem.png"
                  alt="Official Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif font-bold text-sm text-[#063F35]">
                  Official Committee Seal
                </h3>
                <p className="text-[11px] font-mono text-stone-500">
                  Mundupara Muhiyudheen Juma Masjid
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Official Waqf Registration & Legal Credentials */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="border-l-4 border-[#0A5C4D] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
              Waqf Registration &amp; Legal Credentials
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Kerala State Waqf Board official registration details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#F7F8F5] p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Waqf Board Reg No</span>
              <span className="text-base font-black font-mono text-[#063F35]">KSWB/CLT/2018/489</span>
              <p className="text-xs text-stone-500 font-mono">Waqf Record</p>
            </div>

            <div className="bg-[#F7F8F5] p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Madrasa Board Reg</span>
              <span className="text-base font-black font-mono text-[#063F35]">SKIMVB/KKD/1482</span>
              <p className="text-xs text-stone-500 font-mono">SKIMVB Registry</p>
            </div>

            <div className="bg-[#F7F8F5] p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Established Year</span>
              <span className="text-base font-black font-mono text-[#063F35]">1954 AD (1373 AH)</span>
              <p className="text-xs text-stone-500 font-mono">70+ Years</p>
            </div>

            <div className="bg-[#F7F8F5] p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Affiliation</span>
              <span className="text-sm font-black text-[#063F35]">KSMF KERALA</span>
              <p className="text-xs text-stone-500">Kerala Sunni Mahal Federation</p>
            </div>
          </div>
        </section>

        {/* 3. Ellaka Boundaries & Wards */}
        <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
          <div className="border-l-4 border-[#063F35] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
              Ellaka Jurisdiction &amp; Wards
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              6 administrative wards for efficient community service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 01</span>
              <h3 className="text-sm font-bold text-[#102522]">West Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Railway line west side towards the coastal road area. (72 Families)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 02</span>
              <h3 className="text-sm font-bold text-[#102522]">East Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Main highway east side to the canal boundary. (85 Families)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 03</span>
              <h3 className="text-sm font-bold text-[#102522]">North Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Bridge junction to the northern boundary. (78 Families)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 04</span>
              <h3 className="text-sm font-bold text-[#102522]">South Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                South Masjid grounds to the southern border. (68 Families)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 05</span>
              <h3 className="text-sm font-bold text-[#102522]">Central Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Juma Masjid premises and Madrasa complex area. (82 Families)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#063F35]">WARD 06</span>
              <h3 className="text-sm font-bold text-[#102522]">Bazaar Zone</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Main market and commercial district area. (65 Families)
              </p>
            </div>
          </div>
        </section>

        {/* 4. Welfare Programs & Contact */}
        <section className="bg-[#063F35] text-white rounded-2xl p-6 sm:p-10 shadow-elevated space-y-6 border border-[#0A5C4D]">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A646]">
              Vision, Mission &amp; Welfare
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Community Welfare Programs &amp; Initiatives
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#022C27]/60 p-5 rounded-xl border border-[#0A5C4D] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#063F35] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Education Aid</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Scholarships and educational materials for deserving higher education students.
              </p>
            </div>

            <div className="bg-[#022C27]/60 p-5 rounded-xl border border-[#0A5C4D] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#063F35] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Healthcare Fund</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Monthly pension and medical aid for bedridden and critically ill individuals.
              </p>
            </div>

            <div className="bg-[#022C27]/60 p-5 rounded-xl border border-[#0A5C4D] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#063F35] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Marriage Fund</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Financial assistance for marriages in low-income families.
              </p>
            </div>

            <div className="bg-[#022C27]/60 p-5 rounded-xl border border-[#0A5C4D] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#063F35] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white">Relief Ration</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Ramadan food kits and emergency disaster relief fund distribution.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#0A5C4D] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-stone-300">
              For more information on welfare applications or to contribute, visit the Mahal Office.
            </p>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[#C9A646] hover:bg-[#B38F34] text-[#022C27] text-xs font-bold transition shadow-fine"
            >
              Contact Mahal Office &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
