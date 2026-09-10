'use client';

import React from 'react';
import Link from 'next/link';

export interface JanazahBannerProps {
  id?: string;
  name: string;
  nameMl?: string | null;
  houseName?: string | null;
  burialLocation?: string | null;
  time?: string | null;
}

export function JanazahBanner({
  id,
  name,
  nameMl,
  houseName,
  burialLocation,
  time,
}: JanazahBannerProps) {
  if (!name) return null;

  const shareText = `*Inna lillahi wa inna ilayhi raji'un*\n\n*${name}* (${houseName || 'Mahal Resident'}) passed away.\nBurial: ${burialLocation || 'Masjid Qabarstan'}\nTime: ${time || 'Today'}\n\nMay Allah grant maghfirah and elevate their ranks in Jannah. Ameen.\n- Noorul Islam Juma Masjid Office`;

  return (
    <div className="w-full bg-[#022C27] rounded-2xl border border-[#0A5C4D] text-white p-5 sm:p-6 shadow-elevated relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Demise Header & Details */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#063F35] border border-[#C9A646]/40 flex items-center justify-center text-[#C9A646] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-[#C9A646]/20 text-[#EFE6C9] font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider border border-[#C9A646]/30">
                Janazah Demise Notice
              </span>
              <span className="text-xs sm:text-sm font-arabic text-[#C9A646]">
                إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
              </span>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white leading-snug">
                {name}
              </h4>
              <p className="text-xs text-stone-300 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
                {houseName && <span>House: <strong className="text-white">{houseName}</strong></span>}
                {burialLocation && (
                  <span>
                    • Burial: <strong className="text-[#EFE6C9]">{burialLocation}</strong>
                  </span>
                )}
                {time && <span>• Time: <strong className="text-white">{time}</strong></span>}
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#063F35] hover:bg-[#0A5C4D] text-stone-200 hover:text-white text-xs font-semibold border border-[#0A5C4D] transition"
          >
            <svg className="w-3.5 h-3.5 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
            <span>Share</span>
          </a>

          <Link
            href="/deaths"
            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-[#C9A646] hover:bg-[#B38F34] text-[#022C27] text-xs font-bold transition shadow-fine"
          >
            <span>All Notices &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
