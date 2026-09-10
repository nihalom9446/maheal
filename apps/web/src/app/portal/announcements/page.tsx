'use client';

import React, { useState } from 'react';
import { useMember } from '../../../lib/member-context';
import {
  IconAnnouncements,
  IconWhatsApp,
  IconDownload,
  IconFilter,
  IconMapPin,
  IconClock,
} from '../../../components/ui/icons';

export default function MemberAnnouncementsPage() {
  const { profile, announcements } = useMember();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'ALL', name: 'All Notices' },
    { key: 'WARD', name: `My Ward (${profile?.ward_number || 3})` },
    { key: 'JANAZAH', name: 'Janazah / Demise' },
    { key: 'MADRASA', name: 'Madrasa & Exams' },
    { key: 'FINANCE', name: 'Finance & Pirivu' },
  ];

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL'
        ? true
        : selectedCategory === 'WARD'
        ? item.is_ward_targeted
        : item.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDownloadAttachment = (item: (typeof announcements)[0]) => {
    const textContent = `=====================================================
NOORUL ISLAM JUMA MASJID MAHAL COMMITTEE
OFFICIAL CIRCULAR / ANNOUNCEMENT ATTACHMENT
=====================================================
Ref: ${item.id}
Date: ${item.created_at}
Category: ${item.category}
Target Ward: ${item.is_ward_targeted ? `Ward ${profile?.ward_number || 3}` : 'All Wards'}

TITLE:
${item.title}

CIRCULAR DETAILS:
${item.content}

-----------------------------------------------------
Issued by: General Secretary, Noorul Islam Juma Masjid
Registered Mahal ID: KL-KNR-2024-004
Verified digital circular generated via Maheall Portal
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.attachment_name || `circular-${item.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Member Announcements
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Official notices from the Mahal Office and Ward Committee
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs">
          <IconMapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-gray-700 font-semibold">
            {profile?.ward_name || 'Ward 3 - Valiya Parambu'}
          </span>
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-3.5 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* 3. ANNOUNCEMENTS LIST */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 space-y-2">
            <IconAnnouncements className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">No notices found</p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.priority === 'URGENT'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : item.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.category}
                  </span>

                  {item.is_ward_targeted && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                      Targeted for {item.ward_name || profile?.ward_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                  <IconClock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-2 whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              {item.attachment_name && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-mono font-medium text-gray-800">
                      {item.attachment_name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(item)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-gray-200 transition"
                  >
                    <IconDownload className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-semibold">
                  Noorul Islam Juma Masjid Office
                </span>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*${item.title}*\n\n${item.content}\n\n- Noorul Islam Juma Masjid Member Portal`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition"
                >
                  <IconWhatsApp className="w-4 h-4 text-emerald-700" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
