'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SearchResult {
  title: string;
  category: string;
  href: string;
  snippet?: string;
}

const searchableData: SearchResult[] = [
  { title: 'Prayer Timetable & Azan Times', category: 'PRAYER', href: '/prayer', snippet: 'Daily 5 times Salah and Friday Jumu’ah prayer schedule' },
  { title: 'Digital Household Passport', category: 'PORTAL', href: '/portal', snippet: 'Member login, 12-month Pirivu history, certificates and family records' },
  { title: 'Nikah & NOC Certificates', category: 'SERVICES', href: '/services', snippet: 'Apply and download official marriage and transfer certificates' },
  { title: 'Madrasa Administration (SKIMVB)', category: 'SERVICES', href: '/services', snippet: 'Class 1-10 admissions, student records, fee status' },
  { title: 'Welfare & Medical Relief Cell', category: 'SERVICES', href: '/services', snippet: 'Healthcare assistance, monthly pension, marriage fund' },
  { title: 'Janazah & Demise Notices', category: 'JANAZAH', href: '/deaths', snippet: 'Demise notices, funeral prayer times, Kabaristan details' },
  { title: 'Milad-un-Nabi Celebrations & Students Fest 2026', category: 'EVENTS', href: '/events', snippet: 'Annual cultural festival and public conference' },
  { title: 'Free Medical Screening Camp', category: 'EVENTS', href: '/events', snippet: 'Health checkup, blood pressure, sugar, doctor consultation' },
  { title: 'Mahal Committee & Office Bearers', category: 'ABOUT', href: '/committee', snippet: 'Religious scholars, executive leadership and ward members' },
  { title: 'Mahal History & Waqf Registration', category: 'ABOUT', href: '/about', snippet: 'Established 1954, Waqf Reg KSWB/CLT/2018/489' },
  { title: 'Contact Mahal Office & 24/7 Helpline', category: 'CONTACT', href: '/contact', snippet: 'Phone numbers, office hours, email and location map' },
  { title: 'Verify Certificate QR Code', category: 'VERIFY', href: '/verify', snippet: 'Official cryptographic certificate verification' },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? searchableData.slice(0, 6)
    : searchableData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.snippet?.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-modal border border-stone-200 overflow-hidden z-10 animate-fadeIn">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200">
          <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prayer times, services, notices, contacts..."
            className="w-full px-3 py-1 text-sm text-[#102522] placeholder-stone-400 bg-transparent border-none outline-hidden"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-600 bg-stone-100 px-2 py-1 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-100">
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-stone-50 transition group"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#102522] group-hover:text-[#063F35] transition">
                    {item.title}
                  </div>
                  {item.snippet && (
                    <div className="text-[11px] text-stone-500 line-clamp-1">
                      {item.snippet}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded shrink-0">
                  {item.category}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-400 flex items-center justify-between">
          <span>Search Noorul Islam Juma Masjid</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
