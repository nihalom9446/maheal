'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { madrasaApi } from '@/lib/api';
import type { MadrasaOverviewStats } from '@maheall/shared';
import {
  IconMadrasa,
  IconUser,
  IconCheckCircle,
  IconCash,
  IconCalendar,
  IconRefresh,
  IconPlus,
  IconAlertCircle,
  IconChevronRight,
} from '@/components/ui/icons';

const CLASS_NAMES_EN: Record<number, string> = {
  1: 'Standard 1',
  2: 'Standard 2',
  3: 'Standard 3',
  4: 'Standard 4',
  5: 'Standard 5',
  6: 'Standard 6',
  7: 'Standard 7',
  8: 'Standard 8',
  9: 'Standard 9',
  10: 'Standard 10',
};

export default function MadrasaOverviewPage() {
  const [overview, setOverview] = useState<MadrasaOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await madrasaApi.getOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load madrasa overview stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <IconMadrasa className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Madrasa Administration</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Madrasa administration system • Classes 1 through 10 students, teachers, attendance & fee records
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchOverview}
            className="p-2 text-gray-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-gray-200 rounded-lg transition"
            title="Refresh Data"
          >
            <IconRefresh className="w-5 h-5" />
          </button>

          <Link
            href="/admin/madrasa/students?action=enroll"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Link>

          <Link
            href="/admin/madrasa/attendance"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconCheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Mark Attendance</span>
          </Link>

          <Link
            href="/admin/madrasa/fees"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconCash className="w-4 h-4 text-emerald-700" />
            <span>Collect Fee</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Enrolled Students */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled Students</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <IconUser className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-900">
              {loading ? '...' : overview?.total_active_students ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total students ({overview?.total_students ?? 0} registered)
            </div>
          </div>
          <Link
            href="/admin/madrasa/students"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Student Register →
          </Link>
        </div>

        {/* Classes 1-10 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Standards</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <IconMadrasa className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-900">1 - 10</div>
            <div className="text-xs text-gray-500 mt-1">Divisions (10 Standards)</div>
          </div>
          <div className="mt-3 text-xs text-indigo-700 font-medium">SKIMVB & Samastha Syllabus</div>
        </div>

        {/* Muallims Count */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Muallim Staff</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <IconUser className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-900">
              {loading ? '...' : overview?.active_teachers ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Teachers ({overview?.total_teachers ?? 0} total staff)
            </div>
          </div>
          <Link
            href="/admin/madrasa/teachers"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
          >
            Manage Muallims →
          </Link>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today&apos;s Attendance</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <IconCheckCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-700">
              {loading ? '...' : `${overview?.today_attendance_percentage ?? 0}%`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Today&apos;s Attendance ({overview?.today_present_count ?? 0}/{overview?.today_total_marked ?? 0})
            </div>
          </div>
          <Link
            href="/admin/madrasa/attendance"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Attendance Register →
          </Link>
        </div>

        {/* Month Fee Collection */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Month Fees Collected</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <IconCash className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-purple-800">
              {loading ? '...' : `₹${(overview?.current_month_fee_collected ?? 0).toLocaleString('en-IN')}`}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current month fee revenue</div>
          </div>
          <Link
            href="/admin/madrasa/fees"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900"
          >
            Fee Collections →
          </Link>
        </div>
      </div>

      {/* Class by Class Standards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Classes & Standards Overview (1 to 10)</h2>
            <p className="text-xs text-gray-500">
              Student enrollment per standard, teacher in-charge, and daily attendance status
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            Standard 1 - 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {overview?.classes && overview.classes.length > 0 ? (
            overview.classes.map((cls) => (
              <div
                key={cls.class_level}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {cls.class_level}
                    </span>
                    <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {CLASS_NAMES_EN[cls.class_level] || `Standard ${cls.class_level}`}
                    </span>
                  </div>

                  {/* Student Count */}
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900">{cls.active_students}</div>
                    <div className="text-xs text-gray-500">Active Students enrolled</div>
                  </div>

                  {/* Teacher in-charge */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                    <span className="text-gray-400 block uppercase tracking-wider text-[10px] font-semibold">
                      Usthad in-charge
                    </span>
                    <p className="font-semibold text-gray-800 mt-0.5 truncate">
                      {cls.teacher_in_charge ? cls.teacher_in_charge.name : 'Not Assigned'}
                    </p>
                    {cls.teacher_in_charge && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium inline-block mt-0.5">
                        {cls.teacher_in_charge.designation.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Attendance Bar */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                      <span>Today&apos;s Attendance</span>
                      <span className="font-bold text-emerald-700">
                        {cls.today_attendance_percentage !== null && cls.today_attendance_percentage !== undefined
                          ? `${cls.today_attendance_percentage}%`
                          : 'Not Marked'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${cls.today_attendance_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick links */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/admin/madrasa/attendance?class=${cls.class_level}`}
                    className="text-emerald-700 hover:text-emerald-900 hover:underline"
                  >
                    Attendance
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    href={`/admin/madrasa/students?class=${cls.class_level}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Students
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link
                    href={`/admin/madrasa/fees?class=${cls.class_level}`}
                    className="text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Fees
                  </Link>
                </div>
              </div>
            ))
          ) : (
            Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx + 1}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-1/2 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/madrasa/students"
          className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
              <IconUser className="w-6 h-6" />
            </span>
            <IconChevronRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mt-4">Student Registry & DPDPA Consent</h3>
          <p className="text-xs text-gray-600 mt-1">
            Student admissions, fee categories, and parental consent records
          </p>
        </Link>

        <Link
          href="/admin/madrasa/attendance"
          className="p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
              <IconCalendar className="w-6 h-6" />
            </span>
            <IconChevronRight className="w-5 h-5 text-blue-700 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mt-4">Interactive Attendance Register</h3>
          <p className="text-xs text-gray-600 mt-1">
            Daily class attendance logging and monthly overview reports
          </p>
        </Link>

        <Link
          href="/admin/madrasa/fees"
          className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200 rounded-2xl hover:border-purple-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="p-3 bg-purple-600 text-white rounded-xl shadow-sm">
              <IconCash className="w-6 h-6" />
            </span>
            <IconChevronRight className="w-5 h-5 text-purple-700 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mt-4">Fee Collections & WhatsApp Receipts</h3>
          <p className="text-xs text-gray-600 mt-1">
            Automatic income entry, numbered receipts, and instant WhatsApp receipts
          </p>
        </Link>
      </div>
    </div>
  );
}
