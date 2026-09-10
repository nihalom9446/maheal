'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { prayerApi } from '../../lib/api';
import type { DayPrayerTimes } from '@maheall/shared';

export function PrayerWidget() {
  const [prayerTimes, setPrayerTimes] = useState<DayPrayerTimes | null>(null);
  const [countdown, setCountdown] = useState<{ hours: string; mins: string; secs: string }>({
    hours: '02',
    mins: '18',
    secs: '36',
  });

  const defaultTimes: DayPrayerTimes = {
    date: new Date().toISOString().split('T')[0],
    fajr_azan: '05:08',
    fajr_iqamah: '05:30',
    sunrise: '06:18',
    dhuhr_azan: '12:28',
    dhuhr_iqamah: '12:40',
    asr_azan: '15:44',
    asr_iqamah: '15:55',
    maghrib_azan: '18:32',
    maghrib_iqamah: '18:37',
    isha_azan: '19:42',
    isha_iqamah: '20:00',
    jumuah_time: '12:30',
    jumuah_iqamah: '12:35',
    current_prayer: 'Dhuhr',
    next_prayer: 'Asr',
    next_prayer_time: '15:44',
    time_to_next: '02:18:36',
    is_jumuah: new Date().getDay() === 5,
    latitude: 11.2588,
    longitude: 75.7804,
    madhab: 'SHAFI',
  };

  useEffect(() => {
    async function loadPrayers() {
      try {
        const res = await prayerApi.getToday();
        if (res.data && res.data.fajr_azan && res.data.next_prayer) {
          setPrayerTimes(res.data);
        } else {
          setPrayerTimes(defaultTimes);
        }
      } catch {
        setPrayerTimes(defaultTimes);
      }
    }
    loadPrayers();
  }, []);

  useEffect(() => {
    const nextTime = prayerTimes?.next_prayer_time || defaultTimes.next_prayer_time || '15:44';

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = nextTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      if (diffMs > 0) {
        const totalSecs = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        setCountdown({
          hours: h.toString().padStart(2, '0'),
          mins: m.toString().padStart(2, '0'),
          secs: s.toString().padStart(2, '0'),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const p = prayerTimes && prayerTimes.fajr_azan ? prayerTimes : defaultTimes;

  const prayers = [
    {
      name: 'Fajr',
      azan: p.fajr_azan,
      iqamah: p.fajr_iqamah,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v4m0 0l-2-2m2 2l2-2M4 17h16M7 20h10M17 13a5 5 0 00-10 0" />
        </svg>
      ),
    },
    {
      name: 'Sunrise',
      azan: p.sunrise,
      iqamah: '—',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" strokeWidth={1.75} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      name: p.is_jumuah ? "Jumu'ah" : 'Dhuhr',
      azan: p.is_jumuah && p.jumuah_time ? p.jumuah_time : p.dhuhr_azan,
      iqamah: p.is_jumuah && p.jumuah_iqamah ? p.jumuah_iqamah : p.dhuhr_iqamah,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" strokeWidth={1.75} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 1v3m0 16v3M1 12h3m16 0h3" />
        </svg>
      ),
    },
    {
      name: 'Asr',
      azan: p.asr_azan,
      iqamah: p.asr_iqamah,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v2m6.364 2.05l-1.414 1.414M20 12h-2M4 12H2m4.757-6.536l1.415 1.414M16 16a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Maghrib',
      azan: p.maghrib_azan,
      iqamah: p.maghrib_iqamah,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 13V9m0 4l-2-2m2 2l2-2M4 17h16M7 20h10M17 13a5 5 0 00-10 0" />
        </svg>
      ),
    },
    {
      name: 'Isha',
      azan: p.isha_azan,
      iqamah: p.isha_iqamah,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-fine p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Section: Header & Quick Link */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#063F35] animate-pulse" />
            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#063F35] tracking-tight">
              Prayer Times
            </h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Confirmed Azan &amp; Iqamah times for Maheall and nearby areas (Shafi&apos;i Madhab).
          </p>
          <div className="pt-1">
            <Link
              href="/prayer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063F35] hover:text-[#0A5C4D] transition underline underline-offset-4 decoration-[#063F35]/30 hover:decoration-[#063F35]"
            >
              <span>View Full 30-Day Timetable &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Middle Section: 6 Prayers Strip */}
        <div className="lg:col-span-6 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
          {prayers.map((prayer) => {
            const isNext = (p.next_prayer || '').toLowerCase() === (prayer.name || '').toLowerCase();
            return (
              <div
                key={prayer.name}
                className={`flex flex-col items-center justify-between p-3 rounded-xl text-center transition-all ${
                  isNext
                    ? 'bg-[#063F35]/5 border-2 border-[#063F35] text-[#063F35]'
                    : 'bg-stone-50/70 border border-stone-200/80 text-stone-700'
                }`}
              >
                <span className="text-base mb-0.5">{prayer.icon}</span>
                <span className={`text-[11px] font-bold ${isNext ? 'text-[#063F35]' : 'text-stone-700'}`}>
                  {prayer.name}
                </span>
                <span className={`text-sm font-black font-mono mt-1 ${isNext ? 'text-[#063F35]' : 'text-[#102522]'}`}>
                  {prayer.azan}
                </span>
                <span className="text-[9px] text-stone-400 font-mono mt-0.5">
                  Iq: {prayer.iqamah}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Section: Countdown Timer */}
        <div className="lg:col-span-3 bg-[#F7F8F5] border border-stone-200 rounded-xl p-4 flex flex-col items-center text-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            <span>Next Prayer:</span>
            <span className="text-[#063F35] font-black">{p.next_prayer || 'Asr'}</span>
          </div>

          <div className="font-mono text-2xl sm:text-3xl font-black text-[#063F35] tracking-wider my-0.5">
            {countdown.hours} : {countdown.mins} : {countdown.secs}
          </div>

          <div className="text-[9px] text-stone-400 font-semibold tracking-widest uppercase">
            HRS &nbsp;&nbsp;&nbsp; MIN &nbsp;&nbsp;&nbsp; SEC
          </div>
        </div>
      </div>
    </div>
  );
}
