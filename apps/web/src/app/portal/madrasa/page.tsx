'use client';

import React, { useState } from 'react';
import { useMember } from '../../../lib/member-context';
import {
  IconMadrasa,
  IconReceipt,
  IconCheckCircle,
  IconCalendar,
  IconClock,
  IconPrinter,
  IconWhatsApp,
} from '../../../components/ui/icons';

export default function MyMadrasaPage() {
  const { madrasaChildren } = useMember();
  const [selectedChildId, setSelectedChildId] = useState<string>(
    madrasaChildren[0]?.id || 'std_child_1'
  );
  const [selectedFeeReceipt, setSelectedFeeReceipt] = useState<{
    month: string;
    amount: number;
    receipt_number: string;
    paid_date: string;
    child_name: string;
  } | null>(null);

  const activeChild = madrasaChildren.find((c) => c.id === selectedChildId) || madrasaChildren[0];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Student Academic Passport
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Attendance records and fee receipts for children enrolled in Noorul Islam Madrasa
          </p>
        </div>

        <div className="text-xs text-purple-950 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200 font-bold shadow-xs">
          Affiliated to SKIMVB &bull; Samastha Kerala Islam Matha Vidyabhyasa Board
        </div>
      </div>

      {/* 2. ENROLLED CHILDREN SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {madrasaChildren.map((child) => {
          const isSelected = child.id === activeChild?.id;

          return (
            <div
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-glass-card hover-lift ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-50 via-purple-50/70 to-white border-purple-600 ring-2 ring-purple-500/20'
                  : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-sm border ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-700 to-purple-900 text-white shadow-md border-purple-500'
                      : 'bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                >
                  Std {child.class_level}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    {child.name}
                  </h3>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Adm No: {child.admission_number}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-xs font-black text-purple-950 bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 block">
                  {child.attendance_stats.percentage}% Attendance
                </span>
                <div className="text-[11px] text-gray-500 font-mono">
                  ₹{child.monthly_fee}/month
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ACTIVE CHILD PROFILE & ACADEMIC ATTENDANCE BREAKDOWN */}
      {activeChild && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-200">
                    Standard {activeChild.class_level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Category: {activeChild.fee_category}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-gray-900 pt-1">
                  {activeChild.name}
                </h2>

                <p className="text-xs text-gray-600 pt-0.5">
                  Usthad In-Charge: <strong className="text-gray-900">{activeChild.usthad_name}</strong>
                </p>
              </div>

              {/* Circular Attendance Meter in Card */}
              <div className="bg-pearl-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Attendance Meter
                  </div>
                  <div className="text-2xl font-black text-purple-950 font-mono mt-0.5">
                    {activeChild.attendance_stats.percentage}%
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {activeChild.attendance_stats.present_days} of {activeChild.attendance_stats.total_days} days
                  </div>
                </div>

                {/* SVG Meter */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-purple-100"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-purple-700"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - activeChild.attendance_stats.percentage / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                  Fee Status
                </div>
                <div className="text-2xl font-black text-purple-950 font-mono">
                  ₹{activeChild.monthly_fee}
                </div>
                <div className="text-xs text-emerald-800 font-bold">
                  September Fee Paid ✓
                </div>
              </div>
            </div>
          </div>

          {/* ATTENDANCE CALENDAR STRIP */}
          <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Daily Attendance Log (September 2026)
                </h3>
                <p className="text-xs text-gray-500">
                  Daily madrasa attendance status
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Leave
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {activeChild.daily_attendance.map((day) => {
                const isPresent = day.status === 'PRESENT';
                const isAbsent = day.status === 'ABSENT';
                const isLeave = day.status === 'LEAVE';

                return (
                  <div
                    key={day.date}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      isPresent
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                        : isAbsent
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : isLeave
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-pearl-100 border-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-gray-500">{day.day_name}</div>
                    <div className="text-xs font-black font-mono my-0.5">
                      {new Date(day.date).getDate()} Sep
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isPresent
                          ? 'bg-emerald-200/60 text-emerald-950'
                          : isAbsent
                          ? 'bg-rose-200/60 text-rose-950'
                          : isLeave
                          ? 'bg-amber-200/60 text-amber-950'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {day.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. FEE PAYMENT HISTORY & DIGITAL RECEIPTS */}
          <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Madrasa Fee Receipts & Payment History
                </h3>
                <p className="text-xs text-gray-500">
                  Official receipts of paid madrasa fees
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-pearl-100 text-gray-700 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 rounded-l-xl">Fee Month</th>
                    <th className="py-3.5 px-4">Receipt No</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeChild.fee_history.map((item) => (
                    <tr key={item.receipt_number} className="hover:bg-purple-50/40 transition">
                      <td className="py-4 px-4 font-bold text-gray-900">{item.month}</td>
                      <td className="py-4 px-4 font-mono font-bold text-purple-900">{item.receipt_number}</td>
                      <td className="py-4 px-4 font-mono font-black text-gray-900">₹{item.amount}</td>
                      <td className="py-4 px-4 text-gray-500 font-mono">{item.paid_date}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {item.status} ✓
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFeeReceipt({
                              ...item,
                              child_name: activeChild.name,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition border border-purple-200"
                        >
                          <IconReceipt className="w-3.5 h-3.5 text-purple-700" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: MADRASA FEE RECEIPT VIEWER */}
      {selectedFeeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-purple-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <IconMadrasa className="w-5 h-5 text-purple-800" />
                <span className="font-bold text-sm text-gray-900">Official Madrasa Fee Receipt</span>
              </div>
              <button
                onClick={() => setSelectedFeeReceipt(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-purple-50/50 rounded-2xl border-2 border-dashed border-purple-300 space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-purple-200">
                <div className="text-xs font-black tracking-widest text-purple-950 uppercase">
                  NOORUL ISLAM MADRASA COMMITTEE
                </div>
                <div className="text-[11px] text-purple-800 font-bold">
                  Noorul Islam Madrasa Office • SKIMVB Affiliation
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Receipt No</span>
                  <span className="font-mono font-bold text-gray-900">{selectedFeeReceipt.receipt_number}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Payment Date</span>
                  <span className="font-mono text-gray-900">{selectedFeeReceipt.paid_date}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Student</span>
                  <span className="font-black text-gray-900">{selectedFeeReceipt.child_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Month</span>
                  <span className="text-purple-900 font-bold">{selectedFeeReceipt.month}</span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Monthly Tuition Fee</span>
                <span className="text-xl font-black text-purple-900 font-mono">₹{selectedFeeReceipt.amount}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*MADRASA FEE RECEIPT*\n\nStudent: ${selectedFeeReceipt.child_name}\nReceipt No: ${selectedFeeReceipt.receipt_number}\nMonth: ${selectedFeeReceipt.month}\nAmount: ₹${selectedFeeReceipt.amount}\nStatus: PAID ✓\n\n- Noorul Islam Madrasa`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 transition"
              >
                <IconWhatsApp className="w-4 h-4 text-purple-800" />
                <span>Share WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 transition"
              >
                <IconPrinter className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
