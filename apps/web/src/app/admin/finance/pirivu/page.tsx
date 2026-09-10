'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { financeApi, familiesApi, wardsApi } from '../../../../lib/api';
import type {
  PirivuCollectionItem,
  FamilyListItem,
  FamilyPirivuStatus,
  PirivuReceiptResponse,
  WardWithCounts,
  PaymentMethod,
} from '@maheall/shared';
import { Modal } from '../../../../components/ui/modal';
import { Badge } from '../../../../components/ui/badge';
import {
  IconSearch,
  IconReceipt,
  IconCheck,
  IconX,
  IconWhatsApp,
  IconPrinter,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
} from '../../../../components/ui/icons';

export default function PirivuCollectionPage() {
  // Collection Recorder State
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [familySearchResults, setFamilySearchResults] = useState<FamilyListItem[]>([]);
  const [searchingFamilies, setSearchingFamilies] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyListItem | null>(null);
  const [familyPirivuStatus, setFamilyPirivuStatus] = useState<FamilyPirivuStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amountPerMonth, setAmountPerMonth] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [utrReference, setUtrReference] = useState('');
  const [notes, setNotes] = useState('');
  const [recording, setRecording] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PirivuReceiptResponse | null>(null);

  // Collections List State
  const [collections, setCollections] = useState<PirivuCollectionItem[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsTotal, setCollectionsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchFilter, setSearchFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [wards, setWards] = useState<WardWithCounts[]>([]);

  // 1. Fetch Wards for filter
  useEffect(() => {
    wardsApi.list().then((res) => {
      if (res.success && res.data) {
        setWards(res.data);
      }
    });
  }, []);

  // 2. Fetch Recent Collections
  const fetchCollections = useCallback(async () => {
    try {
      setCollectionsLoading(true);
      const res = await financeApi.listPirivu({
        page,
        limit,
        search: searchFilter.trim() ? searchFilter.trim() : undefined,
        ward_id: wardFilter ? wardFilter : undefined,
      });

      if (res.success && res.data) {
        setCollections(res.data.items);
        setCollectionsTotal(res.data.meta.total);
      }
    } catch {
      // ignore
    } finally {
      setCollectionsLoading(false);
    }
  }, [page, limit, searchFilter, wardFilter]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // 3. Search families autocomplete
  useEffect(() => {
    if (!familySearchQuery.trim() || familySearchQuery.length < 2) {
      setFamilySearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingFamilies(true);
        const res = await familiesApi.list({ search: familySearchQuery.trim(), limit: 8 });
        if (res.success && res.data) {
          setFamilySearchResults(res.data.items);
        }
      } catch {
        setFamilySearchResults([]);
      } finally {
        setSearchingFamilies(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [familySearchQuery]);

  // 4. Fetch family pirivu status on select
  const handleSelectFamily = async (fam: FamilyListItem) => {
    setSelectedFamily(fam);
    setFamilySearchQuery('');
    setFamilySearchResults([]);
    setSelectedMonths([]);
    setAmountPerMonth(parseFloat(fam.pirivu_amount) || 100);
    setRecorderError(null);

    try {
      setStatusLoading(true);
      const res = await financeApi.getFamilyStatus(fam.id, selectedYear);
      if (res.success && res.data) {
        setFamilyPirivuStatus(res.data);
        // Pre-select first unpaid month
        const firstUnpaid = res.data.monthly_status.find((m) => m.status === 'UNPAID');
        if (firstUnpaid) {
          setSelectedMonths([firstUnpaid.month]);
        }
      }
    } catch {
      // ignore
    } finally {
      setStatusLoading(false);
    }
  };

  const handleYearChange = async (newYear: number) => {
    setSelectedYear(newYear);
    if (!selectedFamily) return;

    try {
      setStatusLoading(true);
      const res = await financeApi.getFamilyStatus(selectedFamily.id, newYear);
      if (res.success && res.data) {
        setFamilyPirivuStatus(res.data);
        setSelectedMonths([]);
      }
    } catch {
      // ignore
    } finally {
      setStatusLoading(false);
    }
  };

  // Toggle month selection
  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month].sort());
    }
  };

  const selectAllUnpaid = () => {
    if (!familyPirivuStatus) return;
    const unpaid = familyPirivuStatus.monthly_status
      .filter((m) => m.status === 'UNPAID')
      .map((m) => m.month);
    setSelectedMonths(unpaid);
  };

  const selectNext3Months = () => {
    if (!familyPirivuStatus) return;
    const unpaid = familyPirivuStatus.monthly_status
      .filter((m) => m.status === 'UNPAID')
      .map((m) => m.month)
      .slice(0, 3);
    setSelectedMonths(unpaid);
  };

  // Submit collection
  const handleRecordPirivu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) {
      setRecorderError('Please select a family first.');
      return;
    }

    if (selectedMonths.length === 0) {
      setRecorderError('Please select at least one month to collect.');
      return;
    }

    if (amountPerMonth <= 0) {
      setRecorderError('Monthly amount must be greater than 0.');
      return;
    }

    if (paymentMethod === 'MANUAL_UPI' && !utrReference.trim()) {
      setRecorderError('Please enter the UPI Transaction Reference (UTR).');
      return;
    }

    try {
      setRecording(true);
      setRecorderError(null);

      const res = await financeApi.recordPirivu({
        family_id: selectedFamily.id,
        payment_months: selectedMonths,
        amount_per_month: amountPerMonth,
        payment_method: paymentMethod,
        utr_reference: utrReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setActiveReceipt(res.data);
        setReceiptModalOpen(true);

        // Reset recorder state
        setSelectedMonths([]);
        setUtrReference('');
        setNotes('');

        // Refresh family status & collections list
        if (selectedFamily) {
          handleSelectFamily(selectedFamily);
        }
        fetchCollections();
      }
    } catch (err: unknown) {
      setRecorderError(err instanceof Error ? err.message : 'Failed to record Pirivu');
    } finally {
      setRecording(false);
    }
  };

  // Helper for WhatsApp Share Text
  const getWhatsAppShareUrl = (receipt: PirivuReceiptResponse) => {
    const text = `*Mahal Subscription Receipt*
━━━━━━━━━━━━━━━━━━━━
*Receipt No:* ${receipt.receipt_number}
*Family:* #${receipt.family_number} ${receipt.house_name}
*Head:* ${receipt.head_name || '-'}
*Ward:* ${receipt.ward_name || '-'}
*Months:* ${receipt.payment_months.join(', ')} (${receipt.payment_months.length} Months)
*Total Amount:* ₹${receipt.total_amount}
*Payment Method:* ${receipt.payment_method} ${receipt.utr_reference ? `(UTR: ${receipt.utr_reference})` : ''}
*Date:* ${new Date(receipt.collected_at).toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
Jazakallahu Khair. Thank you.`;

    const phone = receipt.head_phone ? receipt.head_phone.replace(/\D/g, '') : '';
    if (phone && phone.length === 10) {
      return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalPayable = selectedMonths.length * amountPerMonth;

  return (
    <div className="space-y-8">
      {/* 1. Interactive Collection Recorder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <IconReceipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Record Subscription Collection
            </h2>
            <p className="text-xs text-gray-600">
              Search a family, select unpaid months, and generate an instant digital receipt.
            </p>
          </div>
        </div>

        <form onSubmit={handleRecordPirivu} className="mt-6 space-y-6">
          {/* Step A: Family Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              1. Search & Select Family *
            </label>
            <div className="relative">
              <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={familySearchQuery}
                onChange={(e) => setFamilySearchQuery(e.target.value)}
                placeholder="Search by House Name, Malayalam Name, Family #, Head Name, or Phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              {searchingFamilies && (
                <div className="absolute right-3.5 top-3.5 text-xs text-gray-400">
                  Searching...
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {familySearchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {familySearchResults.map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => handleSelectFamily(fam)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50/70 transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-900">
                        #{fam.family_number} {fam.house_name}{' '}
                        {fam.house_name_ml && (
                          <span className="font-gayathri text-xs text-emerald-700 font-normal">
                            ({fam.house_name_ml})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Head: {fam.head_member?.name || '-'} | Phone:{' '}
                        {fam.head_member?.phone || '-'} | Ward: {fam.ward?.name || '-'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        ₹{fam.pirivu_amount}/mo
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Family Info Card */}
          {selectedFamily && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-700 text-white px-2 py-0.5 rounded">
                      Family #{selectedFamily.family_number}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedFamily.house_name}
                    </span>
                    {selectedFamily.house_name_ml && (
                      <span className="text-xs text-emerald-800 font-gayathri">
                        ({selectedFamily.house_name_ml})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>Head:</strong> {selectedFamily.head_member?.name || '-'}
                    </span>
                    <span>
                      <strong>Phone:</strong> {selectedFamily.head_member?.phone || '-'}
                    </span>
                    <span>
                      <strong>Ward:</strong> {selectedFamily.ward?.name || '-'}
                    </span>
                    <span>
                      <strong>Rate:</strong> ₹{selectedFamily.pirivu_amount}/month
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFamily(null);
                    setFamilyPirivuStatus(null);
                    setSelectedMonths([]);
                  }}
                  className="self-start sm:self-auto text-xs text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition"
                >
                  Change Family
                </button>
              </div>
            </div>
          )}

          {/* Step B: 12-Month Grid with Year Selector & Clickable Badges */}
          {selectedFamily && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    2. Select Months to Collect *
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                    className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-800"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectNext3Months}
                    className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition font-medium"
                  >
                    Next 3 Unpaid
                  </button>
                  <button
                    type="button"
                    onClick={selectAllUnpaid}
                    className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition font-medium"
                  >
                    All Unpaid
                  </button>
                  {selectedMonths.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMonths([])}
                      className="text-[11px] text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {statusLoading ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                  Loading monthly status...
                </div>
              ) : familyPirivuStatus ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {familyPirivuStatus.monthly_status.map((m) => {
                    const isPaid = m.status === 'PAID';
                    const isSelected = selectedMonths.includes(m.month);

                    return (
                      <button
                        key={m.month}
                        type="button"
                        disabled={isPaid}
                        onClick={() => toggleMonth(m.month)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isPaid
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 cursor-not-allowed opacity-90'
                            : isSelected
                            ? 'bg-emerald-700 border-emerald-800 text-white shadow-sm ring-2 ring-emerald-500/50 scale-[1.02]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{m.month_name}</span>
                          {isPaid ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          ) : isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-white text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-gray-300" />
                          )}
                        </div>
                        <div className="mt-2 text-[10px]">
                          {isPaid ? (
                            <span className="text-emerald-700 font-semibold truncate block">
                              PAID (₹{m.amount_paid})
                            </span>
                          ) : isSelected ? (
                            <span className="text-emerald-100 font-medium">Selected</span>
                          ) : (
                            <span className="text-gray-600">Unpaid</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* Step C: Payment Options & Calculations */}
          {selectedFamily && selectedMonths.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-gray-100">
              {/* Amount per month & Total auto-sum */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Monthly Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amountPerMonth}
                    onChange={(e) => setAmountPerMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="p-3 bg-emerald-900 text-white rounded-xl">
                  <div className="text-xs text-emerald-200">Total Payable ({selectedMonths.length} Months)</div>
                  <div className="text-2xl font-bold mt-0.5 text-white">
                    {formatCurrency(totalPayable)}
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    {selectedMonths.length} × ₹{amountPerMonth}
                  </div>
                </div>
              </div>

              {/* Payment Method & UTR */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="CASH">CASH</option>
                    <option value="MANUAL_UPI">MANUAL UPI / GPay / PhonePe</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="GATEWAY">PAYMENT GATEWAY</option>
                  </select>
                </div>

                {paymentMethod === 'MANUAL_UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      UPI UTR Reference No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      placeholder="e.g. 423871928371"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Notes & Submit */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional collection note..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={recording}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <IconReceipt className="w-4 h-4" />
                  <span>{recording ? 'Processing...' : `Record ₹${totalPayable} & Issue Receipt`}</span>
                </button>
              </div>
            </div>
          )}

          {recorderError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{recorderError}</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. Receipt Preview Modal with Print & WhatsApp Share */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Pirivu Collection Receipt"
        subtitle="Official payment acknowledgement receipt"
        maxWidth="lg"
      >
        {activeReceipt && (
          <div className="space-y-6">
            {/* Printable Receipt Container */}
            <div
              id="printable-receipt"
              className="p-6 bg-white border-2 border-emerald-900/40 rounded-2xl shadow-xs space-y-5 text-gray-900 print:m-0 print:p-4 print:border"
            >
              {/* Receipt Header */}
              <div className="text-center border-b border-gray-200 pb-4">
                <div className="text-lg font-black text-emerald-900 tracking-tight">
                  KOZHIKODE TOWN MUSLIM MAHAL
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  Reg No: 142/2004 | Official Pirivu Acknowledgement Receipt
                </div>
              </div>

              {/* Receipt Meta & Number */}
              <div className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-600">Receipt No: </span>
                  <span className="font-mono font-bold text-emerald-900">
                    {activeReceipt.receipt_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Date: </span>
                  <span className="font-semibold">
                    {new Date(activeReceipt.collected_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Family Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Family:</span>
                  <div className="font-bold text-gray-900">
                    #{activeReceipt.family_number} {activeReceipt.house_name}
                  </div>
                  {activeReceipt.house_name_ml && (
                    <div className="text-[11px] font-gayathri text-emerald-800">
                      {activeReceipt.house_name_ml}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Head of Family:</span>
                  <div className="font-bold text-gray-900">{activeReceipt.head_name || '-'}</div>
                  <div className="text-[11px] text-gray-600">{activeReceipt.head_phone || '-'}</div>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center">Months</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-2.5">
                        <div className="font-semibold">Mahal Monthly Pirivu</div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {activeReceipt.payment_months.join(', ')}
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {activeReceipt.payment_months.length}
                      </td>
                      <td className="p-2.5 text-right font-medium">
                        ₹{activeReceipt.amount_per_month}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-900">
                        ₹{activeReceipt.total_amount}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-emerald-50/50 font-bold border-t border-gray-200 text-emerald-950">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right">
                        Grand Total Paid:
                      </td>
                      <td className="p-2.5 text-right text-base text-emerald-800 font-extrabold">
                        ₹{activeReceipt.total_amount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Method & Collector */}
              <div className="flex justify-between items-center text-[11px] text-gray-600 pt-1">
                <div>
                  Payment Method: <strong>{activeReceipt.payment_method}</strong>
                  {activeReceipt.utr_reference && ` (UTR: ${activeReceipt.utr_reference})`}
                </div>
                <div>
                  Collected by: <strong>{activeReceipt.collected_by_name || 'Treasurer'}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={getWhatsAppShareUrl(activeReceipt)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                <IconWhatsApp className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  <IconPrinter className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. Recent Pirivu Collections Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Collection History
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Total {collectionsTotal} collection records logged
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Ward Filter */}
            <select
              value={wardFilter}
              onChange={(e) => {
                setWardFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search receipt, family, name..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={fetchCollections}
              className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-gray-50 rounded-lg transition"
              title="Refresh"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Receipt No</th>
                <th className="px-6 py-3 font-semibold">Family</th>
                <th className="px-6 py-3 font-semibold">Ward</th>
                <th className="px-6 py-3 font-semibold">Month</th>
                <th className="px-6 py-3 font-semibold">Method</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collectionsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    Loading collections...
                  </td>
                </tr>
              ) : collections.length > 0 ? (
                collections.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-emerald-800">
                      {col.receipt_number}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-gray-900">
                        #{col.family_number} {col.house_name}
                      </div>
                      <div className="text-[11px] text-gray-600">
                        {col.head_name || '-'} {col.head_phone ? `(${col.head_phone})` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{col.ward_name || '-'}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-800">
                      {col.payment_month}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="neutral" size="sm">
                        {col.payment_method}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-800">
                      ₹{col.amount}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReceipt({
                            receipt_number: col.receipt_number,
                            family_id: col.family_id,
                            family_number: col.family_number,
                            house_name: col.house_name,
                            house_name_ml: col.house_name_ml,
                            door_number: col.door_number,
                            head_name: col.head_name,
                            head_phone: col.head_phone,
                            ward_name: col.ward_name,
                            ward_name_ml: col.ward_name_ml,
                            payment_months: [col.payment_month],
                            amount_per_month: parseFloat(col.amount) || 0,
                            total_amount: parseFloat(col.amount) || 0,
                            payment_method: col.payment_method,
                            utr_reference: col.utr_reference,
                            notes: col.notes,
                            collected_at: col.created_at,
                            collection_ids: [col.id],
                            income_record_id: '',
                            collected_by_name: col.collected_by_name,
                          });
                          setReceiptModalOpen(true);
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    No pirivu collections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {collectionsTotal > limit && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, collectionsTotal)} of {collectionsTotal}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page {page} of {Math.ceil(collectionsTotal / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(collectionsTotal / limit)}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
