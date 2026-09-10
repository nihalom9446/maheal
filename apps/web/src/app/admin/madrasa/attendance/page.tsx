'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { madrasaApi } from '@/lib/api';
import type {
  MadrasaClassAttendanceItem,
  MadrasaMonthlyAttendanceStudentSummary,
  MadrasaAttendanceStatus,
  MarkAttendanceDto,
} from '@maheall/shared';
import {
  IconCheckCircle,
  IconCalendar,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconClock,
  IconUser,
} from '@/components/ui/icons';

const CLASS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function MadrasaAttendanceContent() {
  const searchParams = useSearchParams();
  const initialClass = searchParams.get('class') ? parseInt(searchParams.get('class')!, 10) : 1;

  const [activeTab, setActiveTab] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [classLevel, setClassLevel] = useState<number>(initialClass);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));

  // Daily State
  const [classStudents, setClassStudents] = useState<MadrasaClassAttendanceItem[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: MadrasaAttendanceStatus; notes: string }>>({});
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [savingDaily, setSavingDaily] = useState(false);
  const [dailySuccessMessage, setDailySuccessMessage] = useState<string | null>(null);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Monthly State
  const [monthlySummaries, setMonthlySummaries] = useState<MadrasaMonthlyAttendanceStudentSummary[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  // 1. Fetch Daily Attendance
  const fetchDailyAttendance = useCallback(async () => {
    try {
      setLoadingDaily(true);
      setDailyError(null);
      setDailySuccessMessage(null);

      const res = await madrasaApi.getAttendanceForClass(classLevel, selectedDate);
      if (res.success && res.data) {
        setClassStudents(res.data);
        const map: Record<string, { status: MadrasaAttendanceStatus; notes: string }> = {};
        res.data.forEach((s) => {
          map[s.student_id] = {
            status: s.status === 'UNMARKED' ? 'PRESENT' : (s.status as MadrasaAttendanceStatus),
            notes: s.notes || '',
          };
        });
        setAttendanceMap(map);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setDailyError(e.message || 'Failed to load class attendance register.');
    } finally {
      setLoadingDaily(false);
    }
  }, [classLevel, selectedDate]);

  // 2. Fetch Monthly Summary
  const fetchMonthlySummary = useCallback(async () => {
    try {
      setLoadingMonthly(true);
      setMonthlyError(null);

      const res = await madrasaApi.getAttendanceMonthlySummary(classLevel, selectedMonth);
      if (res.success && res.data) {
        setMonthlySummaries(res.data);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setMonthlyError(e.message || 'Failed to load monthly attendance report.');
    } finally {
      setLoadingMonthly(false);
    }
  }, [classLevel, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'DAILY') {
      fetchDailyAttendance();
    } else {
      fetchMonthlySummary();
    }
  }, [activeTab, fetchDailyAttendance, fetchMonthlySummary]);

  // Toggle student status
  const handleStatusChange = (studentId: string, status: MadrasaAttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status: 'PRESENT' };
      });
      return updated;
    });
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    if (classStudents.length === 0) return;

    try {
      setSavingDaily(true);
      setDailyError(null);
      setDailySuccessMessage(null);

      const records = classStudents.map((s) => ({
        student_id: s.student_id,
        status: attendanceMap[s.student_id]?.status || 'PRESENT',
        notes: attendanceMap[s.student_id]?.notes || null,
      }));

      const dto: MarkAttendanceDto = {
        class_level: classLevel,
        date: selectedDate,
        records,
      };

      await madrasaApi.markAttendance(dto);
      setDailySuccessMessage(`Attendance saved successfully for ${records.length} students.`);
      fetchDailyAttendance();
    } catch (err: unknown) {
      const e = err as Error;
      setDailyError(e.message || 'Failed to save attendance records.');
    } finally {
      setSavingDaily(false);
    }
  };

  // Calculate live stats
  const totalInClass = classStudents.length;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const leaveCount = Object.values(attendanceMap).filter((a) => a.status === 'LEAVE').length;
  const percentage = totalInClass > 0 ? Math.round((presentCount / totalInClass) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Madrasa Attendance Register</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Standard {classLevel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Daily attendance marking & monthly analytics • Batch attendance save
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'DAILY'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Register
          </button>
          <button
            onClick={() => setActiveTab('MONTHLY')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'MONTHLY'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Summary
          </button>
        </div>
      </div>

      {/* Selector Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Class selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Class:</label>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {CLASS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Standard {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker (for Daily) or Month Picker (for Monthly) */}
          {activeTab === 'DAILY' ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {activeTab === 'DAILY' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              type="button"
              disabled={savingDaily || totalInClass === 0}
              onClick={handleSaveAttendance}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
            >
              {savingDaily ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {dailySuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <IconCheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{dailySuccessMessage}</span>
        </div>
      )}
      {(dailyError || monthlyError) && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <IconAlertCircle className="w-5 h-5 text-red-600" />
          <span>{dailyError || monthlyError}</span>
        </div>
      )}

      {/* DAILY REGISTER VIEW */}
      {activeTab === 'DAILY' && (
        <div className="space-y-4">
          {/* Live Summary Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-gray-500 block uppercase">Enrolled</span>
              <span className="text-xl font-extrabold text-gray-900">{totalInClass}</span>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-700 block uppercase">Present</span>
              <span className="text-xl font-extrabold text-emerald-800">{presentCount}</span>
            </div>
            <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-red-700 block uppercase">Absent</span>
              <span className="text-xl font-extrabold text-red-800">{absentCount}</span>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-center shadow-sm">
              <span className="text-[11px] font-semibold text-amber-700 block uppercase">Leave</span>
              <span className="text-xl font-extrabold text-amber-800">{leaveCount}</span>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-center shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-blue-700 block uppercase">Attendance %</span>
              <span className="text-xl font-extrabold text-blue-800">{percentage}%</span>
            </div>
          </div>

          {/* Student Register Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-3.5 px-4 w-12">#</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Admission No</th>
                    <th className="py-3.5 px-4 text-center">Attendance Status</th>
                    <th className="py-3.5 px-4">Notes / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loadingDaily ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td colSpan={5} className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </td>
                      </tr>
                    ))
                  ) : classStudents.length > 0 ? (
                    classStudents.map((student, idx) => {
                      const current = attendanceMap[student.student_id] || { status: 'PRESENT', notes: '' };
                      return (
                        <tr key={student.student_id} className="hover:bg-gray-50 transition">
                          {/* Serial */}
                          <td className="py-3.5 px-4 text-gray-400 font-mono text-xs">{idx + 1}</td>

                          {/* Student Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">{student.student_name}</div>
                            {student.student_name_ml && (
                              <div className="text-xs text-gray-500 font-gayathri">{student.student_name_ml}</div>
                            )}
                          </td>

                          {/* Admission Number */}
                          <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                            {student.board_admission_number || '—'}
                          </td>

                          {/* Toggle Pills */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 gap-1">
                              {/* PRESENT */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.student_id, 'PRESENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  current.status === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-emerald-800'
                                }`}
                              >
                                <IconCheck className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </button>

                              {/* ABSENT */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.student_id, 'ABSENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  current.status === 'ABSENT'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-red-800'
                                }`}
                              >
                                <IconX className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>

                              {/* LEAVE */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(student.student_id, 'LEAVE')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  current.status === 'LEAVE'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-amber-800'
                                }`}
                              >
                                <IconClock className="w-3.5 h-3.5" />
                                <span>Leave</span>
                              </button>
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              placeholder="Reason / Notes (optional)"
                              value={current.notes || ''}
                              onChange={(e) =>
                                setAttendanceMap((prev) => ({
                                  ...prev,
                                  [student.student_id]: {
                                    ...prev[student.student_id],
                                    notes: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        <IconUser className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">No active students in Standard {classLevel}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Please enroll students into this class first.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            {classStudents.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Total {classStudents.length} students marked for {selectedDate}.
                </span>
                <button
                  type="button"
                  disabled={savingDaily}
                  onClick={handleSaveAttendance}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
                >
                  {savingDaily ? 'Saving Attendance...' : 'Save Attendance Register'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MONTHLY SUMMARY VIEW */}
      {activeTab === 'MONTHLY' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 text-center">Working Days</th>
                  <th className="py-3.5 px-4 text-center">Present Days</th>
                  <th className="py-3.5 px-4 text-center">Absent Days</th>
                  <th className="py-3.5 px-4 text-center">Leave Days</th>
                  <th className="py-3.5 px-4 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loadingMonthly ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={6} className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </td>
                    </tr>
                  ))
                ) : monthlySummaries.length > 0 ? (
                  monthlySummaries.map((sum) => (
                    <tr key={sum.student_id} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{sum.student_name}</div>
                        {sum.student_name_ml && (
                          <div className="text-xs text-gray-500 font-gayathri">{sum.student_name_ml}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                        {sum.total_working_days}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {sum.present_count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-red-700">
                        {sum.absent_count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                        {sum.leave_count}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            sum.attendance_percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : sum.attendance_percentage >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sum.attendance_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <IconCalendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">No attendance records for {selectedMonth}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Please mark attendance for days in this month.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MadrasaAttendancePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Attendance...</div>}>
      <MadrasaAttendanceContent />
    </React.Suspense>
  );
}
