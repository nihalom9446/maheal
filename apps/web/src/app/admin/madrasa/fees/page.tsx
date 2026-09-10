'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { madrasaApi } from '@/lib/api';
import type {
  MadrasaFeeReceipt,
  MadrasaStudentItem,
  MadrasaFeeFilterDto,
  CollectMadrasaFeeDto,
  PaymentMethod,
} from '@maheall/shared';
import { Modal } from '@/components/ui/modal';
import {
  IconSearch,
  IconPlus,
  IconCash,
  IconRefresh,
  IconAlertCircle,
  IconPrinter,
  IconWhatsApp,
  IconReceipt,
  IconCheck,
  IconCalendar,
} from '@/components/ui/icons';

const CLASS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MONTHS_LIST = [
  { label: 'Jan', num: '01' },
  { label: 'Feb', num: '02' },
  { label: 'Mar', num: '03' },
  { label: 'Apr', num: '04' },
  { label: 'May', num: '05' },
  { label: 'Jun', num: '06' },
  { label: 'Jul', num: '07' },
  { label: 'Aug', num: '08' },
  { label: 'Sep', num: '09' },
  { label: 'Oct', num: '10' },
  { label: 'Nov', num: '11' },
  { label: 'Dec', num: '12' },
];

function MadrasaFeesContent() {
  const searchParams = useSearchParams();
  const initialClass = searchParams.get('class') ? parseInt(searchParams.get('class')!, 10) : undefined;

  const [collections, setCollections] = useState<MadrasaFeeReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>(initialClass || 'ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Collect Fee Modal
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchedStudents, setSearchedStudents] = useState<MadrasaStudentItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<MadrasaStudentItem | null>(null);

  const currentYear = new Date().getFullYear();
  const [feeYear, setFeeYear] = useState<number>(currentYear);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amountPerMonth, setAmountPerMonth] = useState<number>(250);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  // View Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<MadrasaFeeReceipt | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: MadrasaFeeFilterDto = {
        page,
        limit: 15,
        ...(selectedClass !== 'ALL' ? { class_level: selectedClass } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await madrasaApi.listFeeCollections(params);
      if (res.success && res.data) {
        setCollections(res.data.items);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      } else {
        setCollections([]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load fee collections.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedClass, search]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Search active students for fee collection
  useEffect(() => {
    if (!studentSearch.trim() || studentSearch.length < 2) {
      setSearchedStudents([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await madrasaApi.listStudents({
          page: 1,
          search: studentSearch.trim(),
          status: 'ACTIVE',
          limit: 8,
        });
        if (res.success && res.data) {
          setSearchedStudents(res.data.items || []);
        }
      } catch {
        // silent error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearch]);

  const handleSelectStudent = (s: MadrasaStudentItem) => {
    setSelectedStudent(s);
    setSearchedStudents([]);
    setStudentSearch('');
    setAmountPerMonth(s.monthly_fee || 250);
    // Pre-select current month
    const curMonthStr = `${feeYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
    setSelectedMonths([curMonthStr]);
  };

  const toggleMonth = (monthNum: string) => {
    const formatted = `${feeYear}-${monthNum}-01`;
    setSelectedMonths((prev) =>
      prev.includes(formatted) ? prev.filter((m) => m !== formatted) : [...prev, formatted].sort(),
    );
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setCollectError('Please select a student for fee collection.');
      return;
    }
    if (selectedMonths.length === 0) {
      setCollectError('Please select at least one fee month.');
      return;
    }

    try {
      setCollectLoading(true);
      setCollectError(null);

      const dto: CollectMadrasaFeeDto = {
        student_id: selectedStudent.id,
        fee_months: selectedMonths,
        amount_per_month: amountPerMonth,
        payment_method: paymentMethod,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await madrasaApi.collectFee(dto);
      setShowCollectModal(false);
      setSelectedStudent(null);
      setSelectedMonths([]);
      setReference('');
      setNotes('');
      fetchCollections();

      if (res.success && res.data) {
        setActiveReceipt(res.data);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setCollectError(e.message || 'Failed to record fee collection.');
    } finally {
      setCollectLoading(false);
    }
  };

  const getWhatsAppShareUrl = (receipt: MadrasaFeeReceipt) => {
    const monthsText = receipt.fee_months.map((m) => m.substring(0, 7)).join(', ');
    const message = `*MAHEALL MADRASA FEE RECEIPT*\n\n` +
      `Receipt No: *${receipt.receipt_number}*\n` +
      `Student: *${receipt.student_name}* (Std ${receipt.class_level})\n` +
      `Months Paid: *${monthsText}*\n` +
      `Total Amount: *₹${receipt.total_amount}* (${receipt.payment_method})\n` +
      `Mahal Administration\n` +
      `Jazakumullahu Khairan!`;

    const phone = receipt.parent_phone ? receipt.parent_phone.replace(/\D/g, '') : '';
    return `https://wa.me/${phone ? (phone.startsWith('91') ? phone : `91${phone}`) : ''}?text=${encodeURIComponent(
      message,
    )}`;
  };

  const totalCalculated = selectedMonths.length * amountPerMonth;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Madrasa Fee Collections</h1>
            <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full">
              {totalCount} Receipts
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Madrasa fee collection • Numbered receipts, automatic ledger entries, and instant WhatsApp receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCollections}
            className="p-2 text-gray-600 hover:text-purple-700 bg-white hover:bg-purple-50 border border-gray-200 rounded-lg transition"
            title="Refresh Data"
          >
            <IconRefresh className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setCollectError(null);
              setShowCollectModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Collect Madrasa Fee</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search receipt no, student name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="ALL">All Classes (Std 1 - 10)</option>
              {CLASS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Standard {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fee Collections Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Student & Class</th>
                <th className="py-3.5 px-4">Months Paid</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Collected By</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : collections.length > 0 ? (
                collections.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50 transition">
                    {/* Receipt No */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-xs text-purple-900">
                      {col.receipt_number}
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{col.student_name}</div>
                      <div className="text-xs text-gray-500">
                        Class {col.class_level} • Parent: {col.parent_name || 'N/A'}
                      </div>
                    </td>

                    {/* Months Paid */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {col.fee_months.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px] rounded"
                          >
                            {m.substring(0, 7)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-extrabold text-gray-900">
                      ₹{col.total_amount.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {col.payment_method}
                      </span>
                    </td>

                    {/* Collector */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                      {col.collected_by_name}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {new Date(col.created_at).toLocaleDateString('en-IN')}
                    </td>

                    {/* Receipt Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveReceipt(col)}
                          className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                          title="View / Print Receipt"
                        >
                          <IconPrinter className="w-4 h-4" />
                        </button>

                        <a
                          href={getWhatsAppShareUrl(col)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Share via WhatsApp"
                        >
                          <IconWhatsApp className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <IconReceipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No fee collection receipts found</p>
                    <p className="text-xs text-gray-500 mt-0.5">Collect monthly madrasa fees to view receipts here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collect Fee Modal */}
      <Modal
        isOpen={showCollectModal}
        onClose={() => setShowCollectModal(false)}
        title="Collect Madrasa Fee"
      >
        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 -mt-2">
            Record monthly Madrasa fee payment • Generates receipt and automatic ledger entry
          </p>

          {collectError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{collectError}</span>
            </div>
          )}

          {/* Student Search */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Select Student <span className="text-red-500">*</span>
            </label>
            {selectedStudent ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-purple-900">{selectedStudent.student_name}</div>
                  <div className="text-xs text-purple-700">
                    Class: Standard {selectedStudent.class_level} • Category: {selectedStudent.fee_category} • House:{' '}
                    {selectedStudent.house_name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-1 relative">
                <input
                  type="text"
                  placeholder="Type student name to lookup..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchedStudents.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {searchedStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className="w-full p-2.5 text-left hover:bg-purple-50 flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{s.student_name}</span>
                          <span className="text-gray-500 ml-1">(Std {s.class_level} - {s.house_name})</span>
                        </div>
                        <span className="text-purple-700 font-semibold">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Year & Multi-Month Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Select Fee Months ({feeYear}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFeeYear((y) => y - 1)}
                  className="px-2 py-0.5 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50"
                >
                  {feeYear - 1}
                </button>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded text-xs">
                  {feeYear}
                </span>
                <button
                  type="button"
                  onClick={() => setFeeYear((y) => y + 1)}
                  className="px-2 py-0.5 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50"
                >
                  {feeYear + 1}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {MONTHS_LIST.map((m) => {
                const monthVal = `${feeYear}-${m.num}-01`;
                const isSelected = selectedMonths.includes(monthVal);
                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => toggleMonth(m.num)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {m.label} {m.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount per month & Total auto-sum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Amount per Month (₹)
              </label>
              <input
                type="number"
                min="0"
                value={amountPerMonth}
                onChange={(e) => setAmountPerMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Total Amount to Collect
              </label>
              <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-extrabold text-purple-950">
                ₹{totalCalculated} ({selectedMonths.length} Months)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="CASH">Cash</option>
                <option value="MANUAL_UPI">Manual UPI (GPay / PhonePe)</option>
                <option value="BANK_TRANSFER">Bank Transfer / IMPS</option>
                <option value="GATEWAY">Online Gateway</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                UTR / Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="UPI UTR or notes"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCollectModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={collectLoading || !selectedStudent || selectedMonths.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {collectLoading ? 'Recording...' : `Collect ₹${totalCalculated}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* View / Print Receipt Modal */}
      {activeReceipt && (
        <Modal
          isOpen={Boolean(activeReceipt)}
          onClose={() => setActiveReceipt(null)}
          title="Madrasa Fee Receipt"
        >
          <div className="space-y-4">
            {/* Printable Receipt Container */}
            <div className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl space-y-4 print:border-none">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-3">
                <h3 className="font-bold text-lg text-gray-900 tracking-tight">Kozhikode Town Mahal Madrasa</h3>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full mt-1 inline-block border border-purple-200">
                  {activeReceipt.receipt_number}
                </span>
              </div>

              {/* Student & Payment Summary */}
              <div className="text-xs space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-900">{activeReceipt.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Standard / Class:</span>
                  <span className="font-semibold text-gray-900">Class {activeReceipt.class_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Parent / Guardian:</span>
                  <span className="font-semibold text-gray-900">{activeReceipt.parent_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee Months:</span>
                  <span className="font-mono font-semibold text-purple-900">
                    {activeReceipt.fee_months.map((m) => m.substring(0, 7)).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-semibold">{activeReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-mono">{new Date(activeReceipt.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Total Box */}
              <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between border border-purple-200">
                <span className="text-xs font-bold text-purple-900">Total Amount Received</span>
                <span className="text-xl font-extrabold text-purple-900">₹{activeReceipt.total_amount}</span>
              </div>

              <div className="text-[11px] text-gray-500 text-center italic">
                Collected by {activeReceipt.collected_by_name} • Thank you for timely payment!
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={getWhatsAppShareUrl(activeReceipt)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <IconWhatsApp className="w-4 h-4" />
                <span>Share WhatsApp Receipt</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 transition"
                >
                  <IconPrinter className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function MadrasaFeesPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Fees...</div>}>
      <MadrasaFeesContent />
    </React.Suspense>
  );
}
