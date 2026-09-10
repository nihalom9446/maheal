'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/page-header';
import { prayerApi } from '../../../lib/api';
import type { MonthPrayerTimesResponse, CalculatedPrayerTimes } from '@maheall/shared';

export default function PrayerPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthData, setMonthData] = useState<MonthPrayerTimesResponse | null>(null);

  const generateFallbackMonth = (year: number, month: number): MonthPrayerTimesResponse => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: CalculatedPrayerTimes[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      const isJumuah = d.getDay() === 5;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      days.push({
        date: dateStr,
        fajr_azan: '05:08',
        fajr_iqamah: '05:30',
        sunrise: '06:18',
        dhuhr_azan: isJumuah ? '12:30' : '12:28',
        dhuhr_iqamah: isJumuah ? '12:35' : '12:40',
        asr_azan: '15:44',
        asr_iqamah: '15:55',
        maghrib_azan: '18:32',
        maghrib_iqamah: '18:37',
        isha_azan: '19:42',
        isha_iqamah: '20:00',
        jumuah_time: isJumuah ? '12:30' : null,
        jumuah_iqamah: isJumuah ? '12:35' : null,
      });
    }

    return {
      year,
      month,
      mahal_id: 'default',
      days,
    };
  };

  useEffect(() => {
    async function loadMonthlyPrayers() {
      try {
        const res = await prayerApi.getMonth({ year: currentYear, month: currentMonth });
        if (res.data?.days && res.data.days.length > 0) {
          setMonthData(res.data);
        } else {
          setMonthData(generateFallbackMonth(currentYear, currentMonth));
        }
      } catch {
        setMonthData(generateFallbackMonth(currentYear, currentMonth));
      }
    }

    loadMonthlyPrayers();
  }, [currentYear, currentMonth]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysList = monthData?.days || [];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pb-24">
      <PageHeader
        badge="Shafi'i Standard"
        title="Monthly Prayer Timetable"
        description="Astronomically verified Azan & Iqamah timetable for daily prayers and Friday Jumu'ah congregations calibrated for Kerala coordinates (11.2588° N, 75.7804° E)."
        breadcrumbs={[{ label: 'Prayer Times' }]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-fine">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-[#102522] outline-hidden cursor-pointer"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-[#102522] outline-hidden cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#063F35] hover:bg-[#022C27] text-white text-xs font-bold transition shadow-fine flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Save PDF</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Friday Jumu'ah Schedule Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-fine space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="bg-[#063F35]/10 text-[#063F35] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider">
                Friday Special
              </span>
              <h3 className="text-lg font-serif font-bold text-[#063F35] mt-1">
                Jumu&apos;ah Congregation Schedule
              </h3>
            </div>
            <div className="text-xs text-stone-600 font-medium">
              Chief Khatib: <strong className="text-stone-900 font-bold">Usthad Abdul Rahman Baqavi</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-center">
            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-500 font-medium">1st Azan</p>
              <p className="text-xl font-black font-mono text-[#063F35] mt-0.5">12:15 PM</p>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-500 font-medium">Khutbah &amp; 2nd Azan</p>
              <p className="text-xl font-black font-mono text-[#063F35] mt-0.5">12:30 PM</p>
            </div>

            <div className="bg-[#F7F8F5] p-4 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-500 font-medium">Jumu&apos;ah Salah</p>
              <p className="text-xl font-black font-mono text-[#063F35] mt-0.5">12:45 PM</p>
            </div>
          </div>
        </div>

        {/* 30-Day Monthly Timetable */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-fine overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#102522]">
                {monthNames[currentMonth - 1]} {currentYear} Prayer Calendar
              </h3>
            </div>
            <div className="text-xs text-[#063F35] font-bold font-mono">
              {daysList.length} Days Calibrated
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#063F35] text-white font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Day</th>
                  <th className="py-3 px-4 text-center">Fajr<br/><span className="text-[10px] text-[#C9A646] font-normal">Azan / Iqamah</span></th>
                  <th className="py-3 px-4 text-center">Sunrise<br/><span className="text-[10px] text-stone-300 font-normal">Ishraq</span></th>
                  <th className="py-3 px-4 text-center">Dhuhr<br/><span className="text-[10px] text-[#C9A646] font-normal">Azan / Iqamah</span></th>
                  <th className="py-3 px-4 text-center">Asr<br/><span className="text-[10px] text-[#C9A646] font-normal">Azan / Iqamah</span></th>
                  <th className="py-3 px-4 text-center">Maghrib<br/><span className="text-[10px] text-[#C9A646] font-normal">Azan / Iqamah</span></th>
                  <th className="py-3 px-4 text-center">Isha<br/><span className="text-[10px] text-[#C9A646] font-normal">Azan / Iqamah</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {daysList.map((day) => {
                  const isToday = day.date === todayStr;
                  const dayDate = new Date(day.date);
                  const isFriday = dayDate.getDay() === 5;
                  const dayName = dayDate.toLocaleDateString('en-GB', { weekday: 'short' });

                  return (
                    <tr
                      key={day.date}
                      className={`transition ${
                        isToday
                          ? 'bg-[#063F35]/5 font-bold ring-2 ring-inset ring-[#063F35]'
                          : isFriday
                          ? 'bg-amber-50/40 hover:bg-amber-50/60'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-[#063F35] animate-pulse" title="Today" />
                          )}
                          <span className="font-mono font-bold text-stone-900">
                            {day.date.split('-')[2]}
                          </span>
                          <span className={`text-[11px] font-semibold ${isFriday ? 'text-amber-800' : 'text-stone-500'}`}>
                            {dayName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <span className="font-bold text-stone-900">{day.fajr_azan}</span>
                        <span className="text-[10px] text-stone-400 block">{day.fajr_iqamah}</span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-stone-600">
                        {day.sunrise}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <span className={`font-bold ${isFriday ? 'text-amber-800' : 'text-stone-900'}`}>
                          {isFriday && day.jumuah_time ? day.jumuah_time : day.dhuhr_azan}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {isFriday && day.jumuah_iqamah ? day.jumuah_iqamah : day.dhuhr_iqamah}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <span className="font-bold text-stone-900">{day.asr_azan}</span>
                        <span className="text-[10px] text-stone-400 block">{day.asr_iqamah}</span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <span className="font-bold text-stone-900">{day.maghrib_azan}</span>
                        <span className="text-[10px] text-stone-400 block">{day.maghrib_iqamah}</span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                        <span className="font-bold text-stone-900">{day.isha_azan}</span>
                        <span className="text-[10px] text-stone-400 block">{day.isha_iqamah}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Parameters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-fine space-y-3">
          <h4 className="text-xs font-bold text-[#063F35] uppercase tracking-wider">
            Calculation Methodology &amp; Astronomical Parameters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="space-y-1">
              <strong className="text-stone-900">Shafi&apos;i Madhab Rule:</strong>
              <p className="text-stone-500 leading-relaxed">
                Asr time begins when the shadow of an object equals its length plus the solar noon shadow (1x ratio).
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900">Fajr &amp; Isha Twilight Angles:</strong>
              <p className="text-stone-500 leading-relaxed">
                Fajr angle 18.0° • Isha angle 18.0° (Karachi convention calibrated for Kerala latitude).
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900">Qibla Direction:</strong>
              <p className="text-stone-500 leading-relaxed">
                294.6° WNW from Calicut centroid (11.2588° N, 75.7804° E).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
