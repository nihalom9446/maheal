'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/page-header';
import { EmptyState } from '../../../components/ui/empty-state';
import { eventsApi } from '../../../lib/api';
import type { EventListItem } from '@maheall/shared';

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [filter, setFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');
  const [loading, setLoading] = useState<boolean>(true);

  const fallbackEvents: EventListItem[] = [
    {
      id: 'event-1',
      mahal_id: 'default',
      title: 'Grand Milad Conference & Cultural Fest 2026',
      title_ml: 'Grand Milad Conference & Cultural Fest 2026',
      description: 'Annual Mawlid commemoration featuring spiritual talks, recitation of Burdah, and awards ceremony for top Madrasa rank holders.',
      starts_at: '2026-09-15T09:00:00.000Z',
      ends_at: '2026-09-15T21:00:00.000Z',
      location: 'Noorul Islam Masjid Convention Centre',
      image_key: null,
      status: 'ACTIVE',
      created_by_user_id: 'system',
      created_at: new Date().toISOString(),
    },
    {
      id: 'event-2',
      mahal_id: 'default',
      title: 'Free Mega Health & Ophthalmology Medical Camp',
      title_ml: 'Free Mega Health & Ophthalmology Medical Camp',
      description: 'Comprehensive general health, diabetes, cardiac ECG checkup and free eye cataract screenings in association with Calicut Medical College doctors.',
      starts_at: '2026-09-20T08:30:00.000Z',
      ends_at: '2026-09-20T14:00:00.000Z',
      location: 'Mahal Welfare Relief Complex, Ward 2',
      image_key: null,
      status: 'ACTIVE',
      created_by_user_id: 'system',
      created_at: new Date().toISOString(),
    },
    {
      id: 'event-3',
      mahal_id: 'default',
      title: 'Mahal Annual General Body Meeting',
      title_ml: 'Mahal Annual General Body Meeting',
      description: 'Presentation of annual financial audit statements, election of ward executive representatives, and review of community development masterplan.',
      starts_at: '2026-09-27T14:00:00.000Z',
      ends_at: '2026-09-27T17:30:00.000Z',
      location: 'Masjid Basement Hall',
      image_key: null,
      status: 'ACTIVE',
      created_by_user_id: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await eventsApi.list();
        if (res.data?.items && res.data.items.length > 0) {
          setEvents(res.data.items);
        } else {
          setEvents(fallbackEvents);
        }
      } catch {
        setEvents(fallbackEvents);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const now = new Date();
  const filtered = events.filter((ev) => {
    const evDate = ev.starts_at ? new Date(ev.starts_at) : new Date(ev.created_at);
    if (filter === 'UPCOMING') return evDate >= now || ev.status === 'ACTIVE';
    if (filter === 'PAST') return evDate < now || ev.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="pb-24">
      <PageHeader
        badge="Community Calendar"
        title="Events & Community Programs"
        description="Upcoming religious conferences, educational fests, general body conventions, and medical relief camps for our community."
        breadcrumbs={[{ label: 'Events' }]}
        actions={
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-fine">
            <button
              type="button"
              onClick={() => setFilter('UPCOMING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'UPCOMING'
                  ? 'bg-[#063F35] text-white shadow-fine'
                  : 'text-stone-600 hover:text-[#063F35]'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setFilter('PAST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'PAST'
                  ? 'bg-[#063F35] text-white shadow-fine'
                  : 'text-stone-600 hover:text-[#063F35]'
              }`}
            >
              Past Events
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No events listed"
            description="There are currently no events matching the selected filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => {
              const startDate = item.starts_at ? new Date(item.starts_at) : null;
              const shareText = `*${item.title}*\nVenue: ${item.location || 'Masjid Auditorium'}\nDate: ${startDate ? startDate.toLocaleDateString('en-GB') : 'TBA'}\n\n- Noorul Islam Juma Masjid`;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine hover:shadow-elevated transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#063F35]/10 text-[#063F35] border border-[#063F35]/15">
                        {startDate ? startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Upcoming'}
                      </span>
                      {startDate && (
                        <span className="text-xs text-stone-500 font-mono">
                          {startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-[#102522] leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {item.description && (
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.location && (
                      <div className="flex items-center gap-2 text-xs text-stone-700 bg-[#F7F8F5] p-2.5 rounded-xl border border-stone-200">
                        <svg className="w-4 h-4 text-[#063F35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Organized by Mahal Committee
                    </span>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#063F35] hover:bg-[#022C27] text-white text-xs font-bold transition shadow-fine"
                    >
                      <svg className="w-3.5 h-3.5 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      </svg>
                      <span>Share Event</span>
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
