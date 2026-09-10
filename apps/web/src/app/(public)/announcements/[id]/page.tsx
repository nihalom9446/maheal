import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { announcementsApi } from '../../../../lib/api';
import type { AnnouncementDetail } from '@maheall/shared';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await announcementsApi.get(id);
    const item = res.data;
    if (!item) {
      return {
        title: 'Announcement Not Found',
      };
    }

    const title = item.title;
    const description = item.content || 'Mahal Announcement from Noorul Islam Juma Masjid';

    return {
      title: `${title} | MAHEALL`,
      description: description.slice(0, 160),
      openGraph: {
        title,
        description: description.slice(0, 200),
        type: 'article',
        publishedTime: typeof item.created_at === 'string' ? item.created_at : item.created_at.toISOString(),
        siteName: 'Noorul Islam Juma Masjid Mahal',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description.slice(0, 200),
      },
    };
  } catch {
    return {
      title: 'Mahal Announcement | MAHEALL',
    };
  }
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params;

  let announcement: AnnouncementDetail | null = null;
  try {
    const res = await announcementsApi.get(id);
    announcement = res.data ?? null;
  } catch {
    announcement = {
      id,
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
      publisher_name: 'Mahal Secretary Office',
    };
  }

  if (!announcement) {
    notFound();
  }

  const shareText = `*${announcement.title}*\n\n${announcement.content}\n\n- Noorul Islam Juma Masjid Mahal`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back to Announcements Link */}
      <Link
        href="/announcements"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition"
      >
        <span>&larr; Back to all circulars</span>
      </Link>

      {/* Main Notice Container */}
      <article className="bg-white rounded-2xl border border-stone-200 shadow-fine overflow-hidden">
        {/* Notice Header */}
        <div className="bg-[#063F35] text-white p-6 sm:p-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#022C27] border border-[#0A5C4D] text-stone-200">
              {announcement.category}
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Published: {new Date(announcement.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
            {announcement.title}
          </h1>
        </div>

        {/* Notice Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {announcement.content && (
            <div className="text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line">
              {announcement.content}
            </div>
          )}

          {/* Social Share & WhatsApp Action */}
          <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Issued by: <strong className="text-stone-900">{announcement.publisher_name || 'Mahal Committee'}</strong>
            </div>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#063F35] hover:bg-[#022C27] text-white text-xs font-bold shadow-fine transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
