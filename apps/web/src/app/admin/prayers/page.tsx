'use client';

import React, { useEffect, useState } from 'react';
import {
  prayerApi,
  ApiResponse,
} from '../../../lib/api';
import type {
  PrayerScheduleDetail,
  DayPrayerTimes,
  MonthPrayerTimesResponse,
  UpdatePrayerScheduleDto,
} from '@maheall/shared';
import {
  IconPrayers,
  IconClock,
  IconSettings,
  IconCalendar,
  IconMapPin,
  IconCheck,
  IconRefresh,
  IconPrinter,
  IconAlertCircle,
} from '../../../components/ui/icons';

const PRAYER_NAMES: Record<string, { en: string; ml?: string }> = {
  Fajr: { en: 'Fajr' },
  Sunrise: { en: 'Sunrise' },
  Dhuhr: { en: 'Dhuhr' },
  "Jumu'ah": { en: "Jumu'ah" },
  Asr: { en: 'Asr' },
  Maghrib: { en: 'Maghrib' },
  Isha: { en: 'Isha' },
};

export default function PrayersAdminPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'monthly'>('today');
  const [loading, setLoading] = useState(true);
  const [todayTimes, setTodayTimes] = useState<DayPrayerTimes | null>(null);
  const [schedule, setSchedule] = useState<PrayerScheduleDetail | null>(null);
  const [monthData, setMonthData] = useState<MonthPrayerTimesResponse | null>(null);

  // Current time ticker for live clock & countdown
  const [currentTime, setCurrentTime] = useState<string>('');

  // Schedule form state
  const [formData, setFormData] = useState<UpdatePrayerScheduleDto>({
    madhab: 'SHAFI',
    fajr_angle: 18.0,
    isha_angle: 18.0,
    fajr_iqamah_offset_minutes: 20,
    dhuhr_iqamah_offset_minutes: 10,
    asr_iqamah_offset_minutes: 10,
    maghrib_iqamah_offset_minutes: 5,
    isha_iqamah_offset_minutes: 15,
    jumuah_time: '12:30',
    jumuah_second_time: null,
    jumuah_iqamah_offset_minutes: 5,
    masjid_lat: 10.8505,
    masjid_lng: 76.2711,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Month query state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [todayRes, schedRes] = await Promise.all([
        prayerApi.getToday(),
        prayerApi.getSchedule(),
      ]);

      if (todayRes.data) {
        setTodayTimes(todayRes.data);
      }
      if (schedRes.data) {
        setSchedule(schedRes.data);
        setFormData({
          madhab: schedRes.data.madhab,
          fajr_angle: schedRes.data.fajr_angle,
          isha_angle: schedRes.data.isha_angle,
          fajr_iqamah_offset_minutes: schedRes.data.fajr_iqamah_offset_minutes,
          dhuhr_iqamah_offset_minutes: schedRes.data.dhuhr_iqamah_offset_minutes,
          asr_iqamah_offset_minutes: schedRes.data.asr_iqamah_offset_minutes,
          maghrib_iqamah_offset_minutes: schedRes.data.maghrib_iqamah_offset_minutes,
          isha_iqamah_offset_minutes: schedRes.data.isha_iqamah_offset_minutes,
          jumuah_time: schedRes.data.jumuah_time || '12:30',
          jumuah_second_time: schedRes.data.jumuah_second_time || null,
          jumuah_iqamah_offset_minutes: schedRes.data.jumuah_iqamah_offset_minutes,
          masjid_lat: schedRes.data.masjid_lat || 10.8505,
          masjid_lng: schedRes.data.masjid_lng || 76.2711,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load prayer data';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthTimes = async (year: number, month: number) => {
    try {
      const res = await prayerApi.getMonth({ year, month });
      if (res.data) {
        setMonthData(res.data);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthTimes(selectedYear, selectedMonth);
    }
  }, [activeTab, selectedYear, selectedMonth]);

  // Live timer tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);
    try {
      const res = await prayerApi.updateSchedule(formData);
      if (res.data) {
        setSchedule(res.data);
        setSaveSuccess(true);
        // Refresh today's calculation with new settings
        const todayRes = await prayerApi.getToday();
        if (todayRes.data) {
          setTodayTimes(todayRes.data);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update schedule';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            masjid_lat: parseFloat(pos.coords.latitude.toFixed(6)),
            masjid_lng: parseFloat(pos.coords.longitude.toFixed(6)),
          }));
        },
        (err) => {
          alert('Could not get current location: ' + err.message);
        },
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Prayer Times & Schedule
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Daily prayer timetable &amp; adhan schedule
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'today'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <IconClock className="w-3.5 h-3.5" />
            <span>Today's Times</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'schedule'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <IconSettings className="w-3.5 h-3.5" />
            <span>Mosque Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'monthly'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <IconCalendar className="w-3.5 h-3.5" />
            <span>Monthly Timetable</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TODAY'S LIVE OVERVIEW TAB */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Live Banner Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl p-6 sm:p-8">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  IST Realtime Clock: {currentTime}
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {todayTimes?.current_prayer
                    ? `${todayTimes.current_prayer} Prayer Time`
                    : 'Upcoming: ' + (todayTimes?.next_prayer || 'Fajr')}
                </div>
                <div className="mt-1 text-emerald-200 text-sm font-gayathri">
                  {todayTimes?.current_prayer &&
                    PRAYER_NAMES[todayTimes.current_prayer]?.ml}
                </div>
              </div>

              {/* Next Prayer Countdown Widget */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-200">
                  <IconClock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-emerald-200 font-medium">
                    Next Prayer:{' '}
                    <span className="font-bold text-white">
                      {todayTimes?.next_prayer || 'Fajr'}
                    </span>{' '}
                    at {todayTimes?.next_prayer_time || '--:--'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300 tracking-wider">
                    {todayTimes?.time_to_next || '--:--:--'}
                  </div>
                  <div className="text-[11px] text-emerald-200/80">
                    Remaining until Azan
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle info footer */}
            <div className="mt-6 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-300/80">
              <div className="flex items-center gap-2">
                <IconMapPin className="w-3.5 h-3.5" />
                <span>
                  Masjid Coordinates: {todayTimes?.latitude ?? 10.8505}° N,{' '}
                  {todayTimes?.longitude ?? 76.2711}° E
                </span>
              </div>
              <div>Madhab: {todayTimes?.madhab ?? 'SHAFI'} (Shafi'i)</div>
              <div>Date: {todayTimes?.date ?? 'Today'}</div>
            </div>
          </div>

          {/* Today's Prayers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Today's Azan &amp; Iqamah Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Adhan calls and Iqamah congregation timings
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-lg transition"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6">Prayer</th>
                    <th className="py-3.5 px-6">Azan</th>
                    <th className="py-3.5 px-6">Iqamah</th>
                    <th className="py-3.5 px-6">Offset</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* Fajr */}
                  <tr
                    className={
                      todayTimes?.current_prayer === 'Fajr'
                        ? 'bg-emerald-50/60 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Fajr</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-mono text-base font-bold">
                      {todayTimes?.fajr_azan || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-mono text-base font-bold">
                      {todayTimes?.fajr_iqamah || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      +{schedule?.fajr_iqamah_offset_minutes ?? 20} mins
                    </td>
                    <td className="py-4 px-6">
                      {todayTimes?.current_prayer === 'Fajr' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>

                  {/* Sunrise */}
                  <tr className="hover:bg-slate-50/60 bg-amber-50/30">
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-amber-900">Sunrise</div>
                    </td>
                    <td className="py-3.5 px-6 text-amber-900 font-mono font-medium">
                      {todayTimes?.sunrise || '--:--'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-xs italic">
                      Ishraq prayer time
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-xs">-</td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                        Ishraq
                      </span>
                    </td>
                  </tr>

                  {/* Dhuhr / Jumuah */}
                  <tr
                    className={
                      todayTimes?.current_prayer === 'Dhuhr' ||
                      todayTimes?.current_prayer === "Jumu'ah"
                        ? 'bg-emerald-50/60 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">
                        {todayTimes?.is_jumuah ? "Jumu'ah (Friday)" : 'Dhuhr'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-mono text-base font-bold">
                      {todayTimes?.is_jumuah
                        ? todayTimes.jumuah_time || '12:30'
                        : todayTimes?.dhuhr_azan || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-mono text-base font-bold">
                      {todayTimes?.is_jumuah
                        ? todayTimes.jumuah_iqamah || '--:--'
                        : todayTimes?.dhuhr_iqamah || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      +
                      {todayTimes?.is_jumuah
                        ? schedule?.jumuah_iqamah_offset_minutes ?? 5
                        : schedule?.dhuhr_iqamah_offset_minutes ?? 10}{' '}
                      mins
                    </td>
                    <td className="py-4 px-6">
                      {todayTimes?.current_prayer === 'Dhuhr' ||
                      todayTimes?.current_prayer === "Jumu'ah" ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>

                  {/* Asr */}
                  <tr
                    className={
                      todayTimes?.current_prayer === 'Asr'
                        ? 'bg-emerald-50/60 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Asr</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-mono text-base font-bold">
                      {todayTimes?.asr_azan || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-mono text-base font-bold">
                      {todayTimes?.asr_iqamah || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      +{schedule?.asr_iqamah_offset_minutes ?? 10} mins
                    </td>
                    <td className="py-4 px-6">
                      {todayTimes?.current_prayer === 'Asr' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>

                  {/* Maghrib */}
                  <tr
                    className={
                      todayTimes?.current_prayer === 'Maghrib'
                        ? 'bg-emerald-50/60 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Maghrib</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-mono text-base font-bold">
                      {todayTimes?.maghrib_azan || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-mono text-base font-bold">
                      {todayTimes?.maghrib_iqamah || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      +{schedule?.maghrib_iqamah_offset_minutes ?? 5} mins
                    </td>
                    <td className="py-4 px-6">
                      {todayTimes?.current_prayer === 'Maghrib' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>

                  {/* Isha */}
                  <tr
                    className={
                      todayTimes?.current_prayer === 'Isha'
                        ? 'bg-emerald-50/60 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Isha</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-mono text-base font-bold">
                      {todayTimes?.isha_azan || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-mono text-base font-bold">
                      {todayTimes?.isha_iqamah || '--:--'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      +{schedule?.isha_iqamah_offset_minutes ?? 15} mins
                    </td>
                    <td className="py-4 px-6">
                      {todayTimes?.current_prayer === 'Isha' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-full">
                          Current
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOSQUE SCHEDULE SETTINGS FORM TAB */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSaveSchedule} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Mosque Location & Calculation Rules
                </h2>
                <p className="text-xs text-slate-500">
                  Location coordinates and prayer calculation parameters
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition"
              >
                <IconMapPin className="w-4 h-4" />
                <span>Use My Device Location</span>
              </button>
            </div>

            {/* Coordinates & Madhab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Masjid Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.masjid_lat ?? 10.8505}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      masjid_lat: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Masjid Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.masjid_lng ?? 76.2711}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      masjid_lng: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Calculation Madhab
                </label>
                <select
                  value={formData.madhab}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      madhab: e.target.value as 'SHAFI' | 'HANAFI',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                >
                  <option value="SHAFI">Shafi'i (Kerala Standard)</option>
                  <option value="HANAFI">Hanafi</option>
                </select>
              </div>
            </div>

            {/* Fajr / Isha angles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fajr Twilight Angle (Standard: 18.0°)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="12"
                  max="22"
                  value={formData.fajr_angle ?? 18.0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fajr_angle: parseFloat(e.target.value) || 18.0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isha Twilight Angle (Standard: 18.0°)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="12"
                  max="22"
                  value={formData.isha_angle ?? 18.0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isha_angle: parseFloat(e.target.value) || 18.0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Iqamah Offsets Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Iqamah Offset Settings (Minutes after Azan)
              </h2>
              <p className="text-xs text-slate-500">
                Minutes elapsed after Adhan before starting congregation Iqamah
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fajr */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Fajr</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.fajr_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={formData.fajr_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fajr_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Dhuhr */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Dhuhr</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.dhuhr_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={formData.dhuhr_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dhuhr_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Asr */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Asr</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.asr_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={formData.asr_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      asr_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Maghrib */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Maghrib</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.maghrib_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={formData.maghrib_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maghrib_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Isha */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Isha</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.isha_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={formData.isha_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isha_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Jumuah offset */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Jumu'ah</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {formData.jumuah_iqamah_offset_minutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={formData.jumuah_iqamah_offset_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jumuah_iqamah_offset_minutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Jumuah Khutbah / Azan Fixed Times */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Jumu'ah Prayer Fixed Timings (Friday)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1st Jumu'ah Time (HH:mm)
                  </label>
                  <input
                    type="text"
                    placeholder="12:30"
                    pattern="^([01]\d|2[0-3]):[0-5]\d$"
                    value={formData.jumuah_time || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, jumuah_time: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-400">
                    Standard Friday Khutbah/Azan time in 24h format (e.g. 12:30)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2nd Jumu'ah Time (Optional, for large Masjids)
                  </label>
                  <input
                    type="text"
                    placeholder="13:15"
                    pattern="^([01]\d|2[0-3]):[0-5]\d$"
                    value={formData.jumuah_second_time || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jumuah_second_time: e.target.value || null,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-400">
                    Leave blank if your mosque only conducts 1 Jumu'ah
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <IconCheck className="w-4 h-4" />
                Schedule Settings Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition disabled:opacity-60"
            >
              {saving ? (
                <>
                  <IconRefresh className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Save Schedule Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MONTHLY TIMETABLE TAB */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                >
                  {[
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800"
                >
                  {[2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
            >
              <IconPrinter className="w-4 h-4 text-slate-600" />
              <span>Print Timetable</span>
            </button>
          </div>

          {/* Printable Monthly Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 text-center bg-emerald-950 text-white">
              <h2 className="text-xl font-bold">
                Kozhikode Town Mahal - Monthly Prayer Timetable
              </h2>
              <p className="text-xs text-emerald-300 mt-0.5">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(selectedYear, selectedMonth - 1, 1))}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Fajr Azan</th>
                    <th className="py-2.5 px-3">Fajr Iqamah</th>
                    <th className="py-2.5 px-3">Sunrise</th>
                    <th className="py-2.5 px-3">Dhuhr/Jumuah</th>
                    <th className="py-2.5 px-3">Asr</th>
                    <th className="py-2.5 px-3">Maghrib</th>
                    <th className="py-2.5 px-3">Isha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {monthData?.days?.map((day) => {
                    const d = new Date(day.date);
                    const isFriday = d.getDay() === 5;
                    const isToday =
                      day.date ===
                      new Date().toISOString().slice(0, 10);

                    return (
                      <tr
                        key={day.date}
                        className={`hover:bg-slate-50 transition ${
                          isToday
                            ? 'bg-emerald-50/80 font-bold text-emerald-950'
                            : isFriday
                            ? 'bg-slate-50/60'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                          {day.date}{' '}
                          {isFriday && (
                            <span className="text-[10px] text-emerald-700 font-bold">
                              (Fri)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">{day.fajr_azan}</td>
                        <td className="py-2 px-3 text-emerald-700">
                          {day.fajr_iqamah}
                        </td>
                        <td className="py-2 px-3 text-amber-800">
                          {day.sunrise}
                        </td>
                        <td className="py-2 px-3 text-slate-900 font-semibold">
                          {day.jumuah_time || day.dhuhr_azan}
                        </td>
                        <td className="py-2 px-3">{day.asr_azan}</td>
                        <td className="py-2 px-3">{day.maghrib_azan}</td>
                        <td className="py-2 px-3">{day.isha_azan}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
