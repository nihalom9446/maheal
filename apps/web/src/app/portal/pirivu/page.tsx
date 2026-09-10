'use client';

import React, { useState } from 'react';
import { useMember } from '../../../lib/member-context';
import { PirivuMonthRecord } from '../../../lib/member-data';
import {
  IconReceipt,
  IconCheckCircle,
  IconAlertCircle,
  IconPrinter,
  IconWhatsApp,
  IconCash,
  IconDownload,
  IconX,
} from '../../../components/ui/icons';

export default function MyPirivuPage() {
  const { profile, pirivuRecords, payPirivuMonth } = useMember();
  const [selectedReceipt, setSelectedReceipt] = useState<PirivuMonthRecord | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMonthsToPay, setSelectedMonthsToPay] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'NETBANKING' | 'GATEWAY'>('UPI');
  const [utrInput, setUtrInput] = useState('');
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<string | null>(null);

  const monthlyRate = profile?.monthly_pirivu || 200;
  const unpaidMonths = pirivuRecords.filter((r) => r.status === 'UNPAID');
  const paidMonths = pirivuRecords.filter((r) => r.status === 'PAID');
  const totalPaidYear = paidMonths.reduce((sum, r) => sum + r.amount, 0);
  const totalOverdue = unpaidMonths.reduce((sum, r) => sum + r.amount, 0);

  const handleOpenPayModal = (specificMonthIndex?: number) => {
    if (typeof specificMonthIndex === 'number') {
      setSelectedMonthsToPay([specificMonthIndex]);
    } else {
      setSelectedMonthsToPay(unpaidMonths.map((m) => m.monthIndex));
    }
    setPaymentSuccessReceipt(null);
    setUtrInput('');
    setIsPayModalOpen(true);
  };

  const handleToggleMonthSelection = (idx: number) => {
    if (selectedMonthsToPay.includes(idx)) {
      setSelectedMonthsToPay(selectedMonthsToPay.filter((i) => i !== idx));
    } else {
      setSelectedMonthsToPay([...selectedMonthsToPay, idx]);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMonthsToPay.length === 0) return;

    const receiptNum = payPirivuMonth(selectedMonthsToPay, paymentMethod, utrInput || undefined);
    setPaymentSuccessReceipt(receiptNum);
  };

  const handlePrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Pirivu Dues & Receipts
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            2026 monthly pirivu collection status and digital receipts
          </p>
        </div>

        {unpaidMonths.length > 0 && (
          <button
            onClick={() => handleOpenPayModal()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 border border-amber-300 shadow-lg shadow-amber-950/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <IconCash className="w-4 h-4 text-slate-950" />
            <span>Pay All Dues (₹{totalOverdue})</span>
          </button>
        )}
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-glass-card hover-lift space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Monthly Pirivu Rate
          </span>
          <div className="text-3xl font-black text-gray-900 font-mono">
            ₹{monthlyRate} <span className="text-xs text-gray-400 font-sans font-normal">/ month</span>
          </div>
          <p className="text-xs text-emerald-800 font-medium">Standard monthly rate</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-glass-card hover-lift space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Total Paid in 2026
          </span>
          <div className="text-3xl font-black text-emerald-800 font-mono">
            ₹{totalPaidYear}
          </div>
          <p className="text-xs text-emerald-700 font-medium">
            {paidMonths.length} months settled ✓
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-glass-card hover-lift space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Current Overdue Balance
          </span>
          <div
            className={`text-3xl font-black font-mono ${
              totalOverdue > 0 ? 'text-rose-600' : 'text-emerald-800'
            }`}
          >
            ₹{totalOverdue}
          </div>
          <p className="text-xs text-gray-500">
            {totalOverdue > 0
              ? `${unpaidMonths.length} months pending`
              : 'All dues settled (Up to date ✓)'}
          </p>
        </div>
      </div>

      {/* 3. 12-MONTH LUXURY FINANCIAL CALENDAR GRID */}
      <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900">
              12-Month Financial Calendar Grid (2026)
            </h3>
            <p className="text-xs text-gray-500">
              Monthly pirivu dues status and digital receipts
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Due
            </span>
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {pirivuRecords.map((month) => {
            const isPaid = month.status === 'PAID';

            return (
              <div
                key={month.monthIndex}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                  isPaid
                    ? 'bg-gradient-to-b from-emerald-50/60 to-white border-emerald-300 shadow-xs hover:border-emerald-400'
                    : 'bg-gradient-to-b from-rose-50/40 to-white border-rose-200 shadow-xs hover:border-rose-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900">
                      {month.monthName}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPaid ? 'bg-emerald-500 shadow-xs' : 'bg-rose-500 animate-ping'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500 font-gayathri">
                    {month.monthNameMl}
                  </div>
                  <div className="text-lg font-black font-mono text-gray-900 mt-2">
                    ₹{month.amount}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(month)}
                      className="w-full py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 transition flex items-center justify-center gap-1.5 border border-emerald-200"
                    >
                      <IconReceipt className="w-3.5 h-3.5 text-emerald-700" />
                      <span>View Receipt</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenPayModal(month.monthIndex)}
                      className="w-full py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-[11px] font-black text-white transition shadow-sm"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PAYMENT OPTIONS & BANKING DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Instant UPI & QR */}
        <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Option 1: Instant UPI / Gateway Payment
              </h4>
              <p className="text-[11px] text-gray-500">
                Pay via Google Pay / PhonePe / Paytm UPI
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Official Mahal UPI VPA:</span>
              <span className="font-mono font-bold text-emerald-900">maheallmasjid@upi</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Bank Account:</span>
              <span className="font-mono text-gray-800">SBIN00489218902 (SBI Calicut)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Account Name:</span>
              <span className="text-gray-800 font-medium">Noorul Islam Juma Masjid Mahal</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenPayModal()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 text-slate-950 text-xs font-black shadow-md border border-amber-300 transition"
          >
            Submit UTR Reference After UPI Transfer &rarr;
          </button>
        </div>

        {/* Option 2: Cash at Mahal Office */}
        <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-glass-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Option 2: Cash Payment at Mahal Office
              </h4>
              <p className="text-[11px] text-gray-500">
                Pay cash in person at Mahal office
              </p>
            </div>
          </div>

          <div className="p-4 bg-pearl-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              Members can pay monthly collections directly at the Mahal Secretary desk. Printed and digital receipts will be immediately synced to your portal account.
            </p>
            <div className="pt-1 text-[11px] text-gray-500">
              <strong>Office Timings:</strong> Daily 08:30 AM – 12:30 PM & 04:30 PM – 07:30 PM
              <br />
              <strong>Contact:</strong> +91 98460 00112 (General Secretary Desk)
            </div>
          </div>
        </div>
      </div>

      {/* 5. MODAL: OFFICIAL DIGITAL RECEIPT VIEWER WITH WATERMARK SEAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-800 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <IconReceipt className="w-5 h-5 text-emerald-800" />
                <span className="font-bold text-sm text-gray-900">Official Pirivu Digital Receipt</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Receipt Body (Formatted Official Receipt with Watermark Seal) */}
            <div className="p-6 bg-gradient-to-b from-emerald-50/50 to-white rounded-2xl border-2 border-dashed border-emerald-400 space-y-4 relative overflow-hidden">
              <div className="text-center space-y-1 pb-3 border-b border-emerald-300">
                <div className="text-xs font-black tracking-widest text-emerald-950 uppercase">
                  NOORUL ISLAM JUMA MASJID MAHAL
                </div>
                <div className="text-[11px] text-emerald-800 font-bold">
                  Noorul Islam Juma Masjid Mahal Office
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Waqf Reg: KSWB/CLT/2018/489 &bull; Calicut, Kerala
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Receipt Number</span>
                  <span className="font-mono font-bold text-gray-900">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Date of Payment</span>
                  <span className="font-mono text-gray-900">{selectedReceipt.paidDate || '2026-09-08'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Family Details</span>
                  <span className="font-bold text-gray-900">
                    #{profile?.family_number} - {profile?.house_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">Ward</span>
                  <span className="text-gray-800 font-medium">{profile?.ward_name}</span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Pirivu for {selectedReceipt.monthName} 2026
                  </div>
                </div>
                <div className="text-xl font-black text-emerald-800 font-mono">
                  ₹{selectedReceipt.amount}.00
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-emerald-200">
                <span>Method: <strong className="text-gray-800">{selectedReceipt.paymentMethod || 'UPI'}</strong></span>
                <span className="text-emerald-800 font-bold">✓ Verified Digital Seal</span>
              </div>
            </div>

            {/* Action buttons: Print & WhatsApp Share */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-2.5 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: PAY DUES & SUBMIT UTR */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Pay Pirivu Collections
                </h3>
                <p className="text-xs text-gray-500">
                  Payment gateway and settlement
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {paymentSuccessReceipt ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <IconCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">Payment Successful!</h4>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    Receipt Generated: <strong>{paymentSuccessReceipt}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4">
                {/* Select Months to Pay */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Select Months to Pay
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {unpaidMonths.map((m) => {
                      const isSelected = selectedMonthsToPay.includes(m.monthIndex);
                      return (
                        <div
                          key={m.monthIndex}
                          onClick={() => handleToggleMonthSelection(m.monthIndex)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                              : 'bg-pearl-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              readOnly
                              checked={isSelected}
                              className="rounded text-emerald-600"
                            />
                            <span>{m.monthName} 2026</span>
                          </div>
                          <span className="font-mono font-bold">₹{m.amount}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total amount calculated */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">Total Payable Amount:</span>
                  <span className="text-xl font-black font-mono text-emerald-800">
                    ₹{selectedMonthsToPay.length * monthlyRate}.00
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'UPI' | 'CASH' | 'NETBANKING' | 'GATEWAY')}
                    className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="NETBANKING">Net Banking (NEFT / IMPS)</option>
                    <option value="CASH">Cash at Office (Deposit Slip)</option>
                    <option value="GATEWAY">Debit / Credit Card Gateway</option>
                  </select>
                </div>

                {/* Optional UTR / Reference */}
                {paymentMethod !== 'CASH' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      UPI UTR / Bank Reference Number
                    </label>
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 984601294829 or UTR"
                      className="w-full px-3.5 py-2.5 bg-pearl-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedMonthsToPay.length === 0}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-md disabled:opacity-50 transition"
                  >
                    Confirm & Generate Receipt
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
