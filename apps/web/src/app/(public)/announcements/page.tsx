'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '../../../components/ui/page-header';
import { EmptyState } from '../../../components/ui/empty-state';
import { announcementsApi } from '../../../lib/api';
import type { AnnouncementListItem } from '@maheall/shared';

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fallbackAnnouncements: AnnouncementListItem[] = [
    {
      id: 'ann-1',
      mahal_id: 'default',
      title: 'Milad-un-Nabi Celebrations & Students Cultural Fest 2026',
      title_ml: 'Milad-un-Nabi Celebrations & Students Cultural Fest 2026',
      content: 'The annual Milad conference and Madrasa fest will take place this Sunday from 09:00 AM at the Main Masjid Auditorium. All members and families are cordially invited.',
      content_ml: 'The annual Milad conference and Madrasa fest will take place this Sunday from 09:00 AM at the Main Masjid Auditorium. All members and families are cordially invited.',
      category: 'EVENT',
      priority: 'HIGH',
      attachment_key: null,
      audience: 'ALL',
      target_ward_ids: null,
      death_record_id: null,
      status: 'PUBLISHED',
      publish_at: new Date().toISOString(),
      published_by_user_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      mahal_id: 'default',
      title: 'Monthly Mahal Pirivu & Madrasa Fee Online Collection',
      title_ml: 'Monthly Mahal Pirivu & Madrasa Fee Online Collection',
      content: 'Members can now pay monthly pirivu collections and madrasa fees directly online through UPI or net banking using our verified payment portal.',
      content_ml: 'Members can now pay monthly pirivu collections and madrasa fees directly online through UPI or net banking using our verified payment portal.',
      category: 'FINANCE',
      priority: 'NORMAL',
      attachment_key: null,
      audience: 'ALL',
      target_ward_ids: null,
      death_record_id: null,
      status: 'PUBLISHED',
      publish_at: new Date().toISOString(),
      published_by_user_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ann-3',
      mahal_id: 'default',
      title: 'Free Medical Screening Camp by Mahal Relief Cell',
      title_ml: 'Free Medical Screening Camp by Mahal Relief Cell',
      content: 'Comprehensive health checkup, sugar, BP and doctor consultation on Saturday 10:00 AM to 02:00 PM at Mahal Community Hall.',
      content_ml: 'Comprehensive health checkup, sugar, BP and doctor consultation on Saturday 10:00 AM to 02:00 PM at Mahal Community Hall.',
      category: 'WELFARE',
      priority: 'NORMAL',
      attachment_key: null,
      audience: 'ALL',
      target_ward_ids: null,
      death_record_id: null,
      status: 'PUBLISHED',
      publish_at: new Date().toISOString(),
      published_by_user_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ann-4',
      mahal_id: 'default',
      title: 'Madrasa Academic Year Admission Open for Class 1 to 10',
      title_ml: 'Madrasa Academic Year Admission Open for Class 1 to 10',
      content: 'Applications are invited for admissions from Class 1 to 10 for the upcoming academic session under SKIMVB syllabus. Forms available at Mahal office.',
      content_ml: 'Applications are invited for admissions from Class 1 to 10 for the upcoming academic session under SKIMVB syllabus. Forms available at Mahal office.',
      category: 'MADRASA',
      priority: 'NORMAL',
      attachment_key: null,
      audience: 'ALL',
      target_ward_ids: null,
      death_record_id: null,
      status: 'PUBLISHED',
      publish_at: new Date().toISOString(),
      published_by_user_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function loadAnnouncements() {
      setLoading(true);
      try {
        const res = await announcementsApi.list({
          page: 1,
          limit: 20,
          category: selectedCategory === 'ALL' ? undefined : (selectedCategory as any),
          search: searchQuery || undefined,
        });

        if (res.data?.items && res.data.items.length > 0) {
          setAnnouncements(res.data.items);
        } else {
          setAnnouncements(fallbackAnnouncements);
        }
      } catch {
        setAnnouncements(fallbackAnnouncements);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'ALL', label: 'All Notices' },
    { id: 'GENERAL', label: 'General' },
    { id: 'MADRASA', label: 'Madrasa' },
    { id: 'EVENT', label: 'Events' },
    { id: 'WELFARE', label: 'Welfare' },
    { id: 'FINANCE', label: 'Finance' },
  ];

  const filtered = announcements.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      return matchTitle || matchContent;
    }
    return true;
  });

  return (
    <div className="pb-24">
      <PageHeader
        badge="Official Circulars"
        title="Mahal Announcements & Circulars"
        description="Official notices, decisions of the executive committee, welfare announcements, and educational notifications for registered households."
        breadcrumbs={[{ label: 'Announcements' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls: Category Filter Tabs & Search Box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#063F35] text-white shadow-fine'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-[#102522] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#063F35] shadow-fine"
              />
              <svg
                className="w-4 h-4 text-stone-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notices Cards Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No notices found"
            description="Try changing your search keywords or category filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#102522] leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={`/announcements/${item.id}`}
                    className="text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition flex items-center gap-1"
                  >
                    <span>Read Full Details &rarr;</span>
                  </Link>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `*${item.title}*\n\n${item.content}\n\n- Noorul Islam Juma Masjid Mahal`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[#063F35] bg-stone-50 hover:bg-stone-100 rounded-lg text-xs font-semibold transition"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    <span>Share</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
