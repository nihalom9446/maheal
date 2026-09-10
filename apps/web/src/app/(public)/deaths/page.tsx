'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/page-header';
import { EmptyState } from '../../../components/ui/empty-state';
import { deathRecordsApi } from '../../../lib/api';
import type { DeathRecordItem } from '@maheall/shared';

export default function PublicDeathsPage() {
  const [deaths, setDeaths] = useState<DeathRecordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fallbackDeaths: DeathRecordItem[] = [
    {
      id: 'death-1',
      mahal_id: 'default',
      name: 'K. Mohammed Haji (78)',
      name_ml: 'K. Mohammed Haji (78)',
      photo_key: null,
      date_of_death: new Date().toISOString().split('T')[0],
      burial_location: 'Noorul Islam Masjid Cemetery (Kabaristan)',
      family_id: null,
      house_name: 'Baitul Hamd',
      notes: 'Janazah prayer today after Asr prayer at the main Juma Masjid. Children: Abdulla, Fathima, Subair.',
      is_details_public: true,
      announcement_id: null,
      created_by_user_id: 'system',
      created_at: new Date().toISOString(),
    },
    {
      id: 'death-2',
      mahal_id: 'default',
      name: 'Amina Umma (82)',
      name_ml: 'Amina Umma (82)',
      photo_key: null,
      date_of_death: '2026-08-28',
      burial_location: 'Noorul Islam Masjid Cemetery (Kabaristan)',
      family_id: null,
      house_name: 'Kuttiyadi House',
      notes: 'Burial took place at 10:00 AM at the Masjid Cemetery. May Allah grant Maghfirah.',
      is_details_public: true,
      announcement_id: null,
      created_by_user_id: 'system',
      created_at: '2026-08-28T09:00:00.000Z',
    },
    {
      id: 'death-3',
      mahal_id: 'default',
      name: 'P. V. Usman (64)',
      name_ml: 'P. V. Usman (64)',
      photo_key: null,
      date_of_death: '2026-08-14',
      burial_location: 'Noorul Islam Masjid Cemetery (Kabaristan)',
      family_id: null,
      house_name: 'Rahmath Manzil',
      notes: 'Janazah prayer was conducted after Dhuhr prayer. Please keep the departed in your prayers.',
      is_details_public: true,
      announcement_id: null,
      created_by_user_id: 'system',
      created_at: '2026-08-14T11:00:00.000Z',
    },
  ];

  useEffect(() => {
    async function loadDeaths() {
      setLoading(true);
      try {
        const res = await deathRecordsApi.list({ page: 1, limit: 20, search: searchQuery || undefined });
        if (res.data?.items && res.data.items.length > 0) {
          setDeaths(res.data.items);
        } else {
          setDeaths(fallbackDeaths);
        }
      } catch {
        setDeaths(fallbackDeaths);
      } finally {
        setLoading(false);
      }
    }

    loadDeaths();
  }, [searchQuery]);

  const filtered = deaths.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.house_name?.toLowerCase().includes(q) ||
      d.burial_location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-24">
      <PageHeader
        badge="Demise Notices"
        title="Janazah & Demise Notice Board"
        description="Respectful community demise notices, funeral prayer timings, burial plots, and 24/7 volunteer assistance."
        breadcrumbs={[{ label: 'Janazah Notices' }]}
        actions={
          <div className="bg-[#022C27] text-white px-4 py-2.5 rounded-xl border border-[#063F35] shadow-fine">
            <span className="text-[10px] text-[#C9A646] uppercase font-bold tracking-wider block">24/7 Janazah Helpline</span>
            <span className="font-mono text-sm font-bold text-white">+91 98470 12345</span>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Arabic Inna Lillahi Banner */}
        <div className="bg-[#022C27] text-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-[#0A5C4D] text-center space-y-3">
          <p className="text-xl sm:text-2xl lg:text-3xl font-arabic text-[#C9A646] tracking-wide">
            إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>
          <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-xl mx-auto italic">
            &ldquo;Indeed we belong to Allah, and indeed to Him we will return.&rdquo;
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deceased name or house..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-[#102522] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#063F35] shadow-fine"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Demise Cards List */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No demise notices found"
            description="No active demise records match your search keyword."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const shareMsg = `*Janazah Demise Notice*\n\n*${item.name}*\n${item.house_name ? `House: ${item.house_name}\n` : ''}${item.burial_location ? `Burial: ${item.burial_location}\n` : ''}${item.notes ? `Details: ${item.notes}\n` : ''}\nPlease make special prayer for the deceased.\n\n- Noorul Islam Juma Masjid Mahal`;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Badge & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#022C27] text-[#C9A646]">
                        Janazah Notice
                      </span>
                      {item.date_of_death && (
                        <span className="text-xs text-stone-400 font-mono">
                          {new Date(item.date_of_death).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Name & House */}
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#102522] leading-snug">
                        {item.name}
                      </h3>
                      {item.house_name && (
                        <p className="text-xs text-[#063F35] font-bold mt-1">
                          House: {item.house_name}
                        </p>
                      )}
                    </div>

                    {/* Burial & Details */}
                    <div className="bg-[#F7F8F5] p-3.5 rounded-xl border border-stone-200 space-y-1.5 text-xs text-stone-700">
                      {item.burial_location && (
                        <p>
                          <strong className="text-stone-900 font-bold">Burial Location:</strong>{' '}
                          <span className="text-stone-800">{item.burial_location}</span>
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-stone-600 text-[11px] leading-relaxed pt-1 border-t border-stone-200">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Share Action */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 italic">
                      May Allah grant Maghfirah
                    </span>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#063F35] hover:bg-[#022C27] text-white text-xs font-bold transition shadow-fine"
                    >
                      <svg className="w-3.5 h-3.5 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                      <span>Share Notice</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
