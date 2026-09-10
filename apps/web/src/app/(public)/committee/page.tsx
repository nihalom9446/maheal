'use client';

import React from 'react';
import { PageHeader } from '../../../components/ui/page-header';

interface OfficeBearer {
  name: string;
  designation: string;
  phone?: string;
  ward?: string;
  term?: string;
  category: 'EXECUTIVE' | 'RELIGIOUS' | 'WARD_REP';
}

export default function PublicCommitteePage() {
  const officeBearers: OfficeBearer[] = [
    // Religious Leaders & Scholars
    {
      name: 'Usthad Abdul Rahman Baqavi',
      designation: 'Khatib & Chief Imam',
      phone: '+91 98472 54321',
      term: 'Chief Religious Officer',
      category: 'RELIGIOUS',
    },
    {
      name: 'Usthad Zainuddin Faizy',
      designation: 'Sadar Muallim (Headmaster)',
      phone: '+91 94473 11223',
      term: 'Madrasa Head',
      category: 'RELIGIOUS',
    },
    {
      name: 'Ali Mukri',
      designation: 'Masjid Mukri & Bilal',
      phone: '+91 98470 99887',
      term: 'Masjid Caretaker',
      category: 'RELIGIOUS',
    },

    // Executive Office Bearers
    {
      name: 'P. K. Abdulla Haji',
      designation: 'President',
      phone: '+91 94470 12345',
      term: '2024 - 2027',
      category: 'EXECUTIVE',
    },
    {
      name: 'C. H. Mujeeb Rahman',
      designation: 'General Secretary',
      phone: '+91 94471 98765',
      term: '2024 - 2027',
      category: 'EXECUTIVE',
    },
    {
      name: 'K. T. Musthafa',
      designation: 'Treasurer (Khazanji)',
      phone: '+91 98471 55667',
      term: '2024 - 2027',
      category: 'EXECUTIVE',
    },
    {
      name: 'V. P. Sayyid Alavi Thangal',
      designation: 'Vice President',
      phone: '+91 94472 66778',
      term: '2024 - 2027',
      category: 'EXECUTIVE',
    },
    {
      name: 'T. P. Faisal Babu',
      designation: 'Joint Secretary',
      phone: '+91 98473 77889',
      term: '2024 - 2027',
      category: 'EXECUTIVE',
    },

    // Ward Representatives
    {
      name: 'M. K. Ashraf',
      designation: 'Executive Member',
      ward: 'Ward 1 - West Zone',
      category: 'WARD_REP',
    },
    {
      name: 'P. Shamsuddin',
      designation: 'Executive Member',
      ward: 'Ward 2 - East Zone',
      category: 'WARD_REP',
    },
    {
      name: 'K. Basheer',
      designation: 'Executive Member',
      ward: 'Ward 3 - North Zone',
      category: 'WARD_REP',
    },
    {
      name: 'A. K. Najeeb',
      designation: 'Executive Member',
      ward: 'Ward 4 - South Zone',
      category: 'WARD_REP',
    },
    {
      name: 'O. P. Hamza',
      designation: 'Executive Member',
      ward: 'Ward 5 - Central Zone',
      category: 'WARD_REP',
    },
    {
      name: 'E. K. Rasheed',
      designation: 'Executive Member',
      ward: 'Ward 6 - Bazaar Zone',
      category: 'WARD_REP',
    },
  ];

  const religious = officeBearers.filter((o) => o.category === 'RELIGIOUS');
  const executive = officeBearers.filter((o) => o.category === 'EXECUTIVE');
  const wardReps = officeBearers.filter((o) => o.category === 'WARD_REP');

  return (
    <div className="pb-24">
      <PageHeader
        badge="Official Directory"
        title="Mahal Committee & Office Bearers"
        description="Elected executive office bearers, religious scholars, and ward representatives administering our community under the Kerala State Waqf Board regulations."
        breadcrumbs={[{ label: 'Committee' }]}
        actions={
          <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-600 shadow-fine">
            <div>Office Term: <strong className="text-[#063F35] font-mono font-bold">2024 – 2027</strong></div>
            <div className="text-[11px] text-stone-400">Three-year tenure</div>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Religious Scholars */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#063F35] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
              Religious Leadership &amp; Scholars
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Masjid Khatib, Sadar Muallim and Caretaker
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {religious.map((person) => (
              <div
                key={person.name}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#063F35] text-[#C9A646] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#063F35]/10 text-[#063F35] border border-[#063F35]/15">
                      {person.designation}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#102522] mt-1">
                      {person.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">{person.designation}</span>
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="font-mono font-bold text-[#063F35] hover:text-[#0A5C4D] transition flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{person.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Executive Office Bearers */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#0A5C4D] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
              Executive Office Bearers
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              President, General Secretary, Treasurer &amp; Board Members
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executive.map((person) => (
              <div
                key={person.name}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#022C27] text-[#C9A646] flex items-center justify-center font-serif font-bold text-lg shrink-0">
                    {person.name[0]}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                      {person.designation}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#102522] mt-1">
                      {person.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">{person.designation}</span>
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="font-mono font-bold text-[#063F35] hover:text-[#0A5C4D] transition flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{person.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Ward Representatives */}
        <section className="space-y-6">
          <div className="border-l-4 border-[#063F35] pl-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#063F35]">
              Ward Representatives
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Executive members representing our 6 administrative wards
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wardReps.map((person) => (
              <div
                key={person.name}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#063F35] bg-[#063F35]/10 px-2.5 py-0.5 rounded-md">
                    {person.ward}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">Ward Member</span>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-[#102522]">{person.name}</h3>
                  <p className="text-xs text-stone-500">{person.designation}</p>
                </div>

                <p className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                  Primary point of contact for ward welfare initiatives.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
