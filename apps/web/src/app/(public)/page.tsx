'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PrayerWidget } from '../../components/public/prayer-widget';
import { JanazahBanner } from '../../components/public/janazah-banner';
import { DonationModal } from '../../components/public/donation-modal';
import { announcementsApi, deathRecordsApi } from '../../lib/api';
import type { AnnouncementListItem, DeathRecordItem } from '@maheall/shared';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([]);
  const [latestDeath, setLatestDeath] = useState<DeathRecordItem | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Fallback initial data
  const defaultAnnouncements: AnnouncementListItem[] = [
    {
      id: 'demo-1',
      mahal_id: 'default',
      title: 'Students Cultural Fest & Annual Milad 2026',
      title_ml: 'Students Cultural Fest & Annual Milad 2026',
      content: 'Join us for an evening of knowledge, culture and unity at the Main Masjid Auditorium.',
      content_ml: 'Join us for an evening of knowledge, culture and unity at the Main Masjid Auditorium.',
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
      id: 'demo-2',
      mahal_id: 'default',
      title: 'Monthly Mahal Pirivu & Madrasa Fee Online Collection',
      title_ml: 'Monthly Mahal Pirivu & Madrasa Fee Online Collection',
      content: 'Members can now pay monthly pirivu collections and madrasa fees directly online through UPI or net banking.',
      content_ml: 'Members can now pay monthly pirivu collections and madrasa fees directly online through UPI or net banking.',
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
      id: 'demo-3',
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
  ];

  const defaultDeath: DeathRecordItem = {
    id: 'death-demo',
    mahal_id: 'default',
    name: 'K. Mohammed Haji (78)',
    name_ml: 'K. Mohammed Haji (78)',
    photo_key: null,
    date_of_death: new Date().toISOString().split('T')[0],
    burial_location: 'Masjid Cemetery (Kabaristan)',
    family_id: null,
    house_name: 'Baitul Hamd',
    notes: 'Janazah prayer today after Asr prayer at the main Juma Masjid.',
    is_details_public: true,
    announcement_id: null,
    created_by_user_id: 'system',
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [annRes, deathRes] = await Promise.allSettled([
          announcementsApi.list({ page: 1, limit: 4 }),
          deathRecordsApi.list({ page: 1, limit: 1 }),
        ]);

        if (annRes.status === 'fulfilled' && annRes.value?.data?.items && annRes.value.data.items.length > 0) {
          setAnnouncements(annRes.value.data.items);
        } else {
          setAnnouncements(defaultAnnouncements);
        }

        if (deathRes.status === 'fulfilled' && deathRes.value?.data?.items && deathRes.value.data.items.length > 0) {
          setLatestDeath(deathRes.value.data.items[0]);
        } else {
          setLatestDeath(defaultDeath);
        }
      } catch {
        setAnnouncements(defaultAnnouncements);
        setLatestDeath(defaultDeath);
      }
    }

    fetchData();
  }, []);

  const displayedAnnouncements = announcements.length > 0 ? announcements : defaultAnnouncements;
  const currentTicker = displayedAnnouncements[tickerIndex % displayedAnnouncements.length];

  return (
    <div className="space-y-12 sm:space-y-16 pb-24 bg-[#F7F8F5]">
      {/* 1. HERO SECTION (Editorial Two-Column Composition) */}
      <section className="pt-10 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Eyebrow, Headings, Paragraph, CTAs */}
          <div className="lg:col-span-6 space-y-5">
            {/* Arabic Calligraphy */}
            <div className="text-[#063F35] font-arabic text-xl sm:text-2xl tracking-widest">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>

            {/* Eyebrow & Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#063F35]/10 text-[#063F35] text-xs font-bold uppercase tracking-wider">
                <span>Mundupara Muhiyudheen Juma Masjid</span>
                <span className="text-[#0A5C4D]">•</span>
                <span className="font-mono font-medium">ESTD. 1954</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#063F35] leading-[1.14]">
                A place for prayer, community &amp; service.
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
              Serving our community through authentic Shafi&apos;i prayer guidance, SKIMVB Madrasa education, family administration, official certificate issuance, and welfare assistance.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/portal"
                className="px-6 py-3 rounded-xl bg-[#063F35] hover:bg-[#022C27] text-white text-xs sm:text-sm font-bold shadow-fine transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>Member Passport &rarr;</span>
              </Link>

              <button
                onClick={() => setIsDonationOpen(true)}
                type="button"
                className="px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#063F35] border border-stone-200 text-xs sm:text-sm font-bold shadow-fine transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>Pay Pirivu / Donate</span>
              </button>
            </div>

            {/* Spaced Sub-tags */}
            <div className="pt-2 text-[11px] font-bold text-stone-400 tracking-widest uppercase flex items-center gap-3">
              <span>FAITH</span>
              <span>•</span>
              <span>COMMUNITY</span>
              <span>•</span>
              <span>SERVICE</span>
            </div>
          </div>

          {/* Right: Architectural Showcase of Mundupara Muhiyudheen Juma Masjid */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-elevated bg-gradient-to-b from-stone-50 via-white to-stone-100/70 group transition-all duration-500 hover:shadow-2xl">
              {/* Subtle architectural ambient lighting */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#C9A646]/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#063F35]/10 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#063F35_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Card Top Header */}
              <div className="relative z-10 p-4 sm:p-5 pb-1 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200/80 shadow-xs text-xs font-semibold text-[#063F35]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="font-mono text-[11px] tracking-wide font-medium">KSWB/CLT/2018/489</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063F35] text-white shadow-xs text-[11px] font-bold tracking-wider">
                  <Image
                    src="/mundupara_emblem.png"
                    alt="Emblem"
                    width={16}
                    height={16}
                    className="object-contain brightness-0 invert"
                  />
                  <span>ESTD. 1954</span>
                </div>
              </div>

              {/* Center Mosque Architecture Visual */}
              <div className="relative px-3 sm:px-6 pt-1 pb-3 flex items-center justify-center">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[380px]">
                  <Image
                    src="/mundupara.png"
                    alt="Mundupara Muhiyudheen Juma Masjid Complex"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
                    className="object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  {/* Subtle architectural badge */}
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[10px] font-bold text-stone-700 shadow-xs border border-stone-200/80 pointer-events-none">
                    Masjid Complex
                  </div>
                </div>
              </div>

              {/* Bottom Information & Quranic Inscription Banner */}
              <div className="relative z-10 bg-[#063F35] text-white p-4 sm:p-5 border-t border-[#0A5C4D]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base sm:text-lg leading-tight">
                      Mundupara Muhiyudheen Juma Masjid
                    </h3>
                    <p className="text-[12px] text-stone-300 font-sans mt-0.5">
                      Mundupara, Kozhikode, Kerala • Shafi&apos;i Jama&apos;ath
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-[#0A5C4D] pt-2 sm:pt-0 sm:pl-4">
                    <p className="text-xs text-[#EFE6C9] font-serif italic">
                      &ldquo;And hold firmly to the rope of Allah&rdquo;
                    </p>
                    <p className="text-[10px] text-[#C9A646] font-mono font-semibold uppercase tracking-wider mt-0.5">
                      Qur&apos;an 3:103
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST ANNOUNCEMENT FLOATING TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-fine p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F7F1DE] text-[#785E19] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#785E19] bg-[#F7F1DE] px-2 py-0.5 rounded">
                  LATEST ANNOUNCEMENT
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#102522] leading-snug">
                {currentTicker?.title}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-1">
                {currentTicker?.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs font-mono font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
              {new Date(currentTicker?.created_at || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </span>

            <Link
              href={`/announcements/${currentTicker?.id}`}
              className="text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition"
            >
              Read Notice &rarr;
            </Link>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
              <button
                onClick={() => setTickerIndex((prev) => (prev - 1 + displayedAnnouncements.length) % displayedAnnouncements.length)}
                type="button"
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition"
                aria-label="Previous"
              >
                &larr;
              </button>
              <button
                onClick={() => setTickerIndex((prev) => (prev + 1) % displayedAnnouncements.length)}
                type="button"
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition"
                aria-label="Next"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. URGENT JANAZAH BANNER (IF ACTIVE) */}
      {latestDeath && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <JanazahBanner
            id={latestDeath.id}
            name={latestDeath.name}
            nameMl={latestDeath.name}
            houseName={latestDeath.house_name}
            burialLocation={latestDeath.burial_location}
            time={latestDeath.date_of_death}
          />
        </section>
      )}

      {/* 4. PRAYER TIMETABLE HORIZONTAL WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PrayerWidget />
      </section>

      {/* 5. DIGITAL HOUSEHOLD PASSPORT BANNER (Deep Forest Green) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#063F35] rounded-2xl p-6 sm:p-10 text-white shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#0A5C4D]">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#022C27] text-[#C9A646] flex items-center justify-center border border-[#0A5C4D]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                Digital Household Passport
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
              Your family&apos;s verified records, available securely when you need them. Log in to verify family details, review 12-month Pirivu history, download certificates, and track children&apos;s Madrasa attendance.
            </p>

            <div className="pt-2">
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A646] hover:bg-[#B38F34] text-[#022C27] text-xs font-bold shadow-fine transition"
              >
                <span>Access Member Passport &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Quote */}
          <div className="md:text-right border-t md:border-t-0 md:border-l border-[#0A5C4D] pt-4 md:pt-0 md:pl-8">
            <p className="text-[#EFE6C9] font-serif italic text-sm sm:text-base max-w-xs">
              &ldquo;A stronger, organized community builds brighter generations.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 6. KEY COMMUNITY STATISTICS (Clean Typography Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-fine text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#063F35]">450+</div>
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wide">Registered Families</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-fine text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#063F35]">320+</div>
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wide">Madrasa Students</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-fine text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#063F35]">100%</div>
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wide">Digital Records</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-fine text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#063F35]">6</div>
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wide">Wards &amp; Ellaka</div>
          </div>
        </div>
      </section>

      {/* 7. CIVIC & COMMUNITY SERVICES (Clean 4-Card Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#063F35] tracking-tight">
              Our Services
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Community care through organized, transparent and authenticated systems.
            </p>
          </div>

          <Link
            href="/services"
            className="text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition"
          >
            View All Services &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/services"
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine space-y-3 hover:shadow-elevated hover:border-stone-300 transition block group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#102522] group-hover:text-[#063F35] transition">
              Nikah &amp; NOC Certificates
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Apply and download verified marriage certificates, NOCs, and family membership certificates with QR code verification.
            </p>
            <div className="pt-2 text-xs font-bold text-[#063F35] group-hover:underline">
              Learn More &rarr;
            </div>
          </Link>

          <Link
            href="/services"
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine space-y-3 hover:shadow-elevated hover:border-stone-300 transition block group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#102522] group-hover:text-[#063F35] transition">
              Madrasa Administration
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              SKIMVB Standards 1 to 10 student records, admissions, daily attendance monitoring, and fee status.
            </p>
            <div className="pt-2 text-xs font-bold text-[#063F35] group-hover:underline">
              Learn More &rarr;
            </div>
          </Link>

          <Link
            href="/services"
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine space-y-3 hover:shadow-elevated hover:border-stone-300 transition block group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#102522] group-hover:text-[#063F35] transition">
              Welfare &amp; Relief Cell
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Medical assistance, pension for bedridden patients, marriage aid for needy families, and emergency relief distribution.
            </p>
            <div className="pt-2 text-xs font-bold text-[#063F35] group-hover:underline">
              Learn More &rarr;
            </div>
          </Link>

          <Link
            href="/services"
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine space-y-3 hover:shadow-elevated hover:border-stone-300 transition block group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#102522] group-hover:text-[#063F35] transition">
              Online Pirivu &amp; Receipts
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Instant digital monthly Pirivu contributions via UPI and instant receipt downloads for total accounting transparency.
            </p>
            <div className="pt-2 text-xs font-bold text-[#063F35] group-hover:underline">
              Learn More &rarr;
            </div>
          </Link>
        </div>
      </section>

      {/* 8. RECENT ANNOUNCEMENTS (3-Column Clean Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#063F35] tracking-tight">
              Recent Announcements
            </h2>
          </div>

          <Link
            href="/announcements"
            className="text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition"
          >
            View All Circulars &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedAnnouncements.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine flex flex-col justify-between space-y-4 hover:shadow-elevated transition"
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

                <h3 className="text-base font-bold text-[#102522] leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <Link
                  href={`/announcements/${item.id}`}
                  className="text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition flex items-center gap-1"
                >
                  <span>Read Notice &rarr;</span>
                </Link>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*${item.title}*\n\n${item.content}\n\n- Mundupara Muhiyudheen Juma Masjid Mahal`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#063F35] hover:bg-stone-100 rounded-lg transition"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. COMMUNITY & OFFICE CONTACT SNIPPET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl font-serif font-bold text-[#063F35]">
              Need Assistance or Certificate Guidance?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Our Mahal administrative desk is open Mon–Sat 9:00 AM – 1:00 PM and 4:30 PM – 8:30 PM. 24/7 Janazah emergency assistance is active at +91 98470 12345.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[#063F35] text-white text-xs font-bold hover:bg-[#022C27] transition shadow-fine"
            >
              Contact Office
            </Link>
            <Link
              href="/committee"
              className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-semibold transition"
            >
              View Committee
            </Link>
          </div>
        </div>
      </section>

      {/* Donation / Pay Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </div>
  );
}
