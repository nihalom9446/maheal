'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { financeApi, wardsApi } from '../../../../lib/api';
import type { PirivuArrearsItem, WardWithCounts } from '@maheall/shared';
import { Badge } from '../../../../components/ui/badge';
import {
  IconSearch,
  IconWhatsApp,
  IconDownload,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
} from '../../../../components/ui/icons';

export default function PirivuArrearsPage() {
  const [arrears, setArrears] = useState<PirivuArrearsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filters
  const [search, setSearch] = useState('');
  const [wardId, setWardId] = useState('');
  const [minMonths, setMinMonths] = useState(1);
  const [wards, setWards] = useState<WardWithCounts[]>([]);

  // Fetch Wards
  useEffect(() => {
    wardsApi.list().then((res) => {
      if (res.success && res.data) {
        setWards(res.data);
      }
    });
  }, []);

  // Fetch Arrears
  const fetchArrears = useCallback(async () => {
    try {
      setLoading(true);
      const res = await financeApi.getArrears({
        page,
        limit,
        min_months: minMonths,
        ward_id: wardId || undefined,
        search: search.trim() || undefined,
      });

      if (res.success && res.data) {
        setArrears(res.data.items);
        setTotalRecords(res.data.meta.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, limit, minMonths, wardId, search]);

  useEffect(() => {
    fetchArrears();
  }, [fetchArrears]);

  const totalOverdueSum = arrears.reduce((sum, item) => sum + item.total_arrears, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // WhatsApp Reminder Link Generator
  const getWhatsAppReminderUrl = (item: PirivuArrearsItem) => {
    const text = `Assalamu Alaikum ${item.head_name ? item.head_name : ''} (${item.house_name}, Family #${item.family_number}),

Monthly Subscription Arrears Notice from Kozhikode Town Muslim Mahal:
━━━━━━━━━━━━━━━━━━━━
*Family:* #${item.family_number} ${item.house_name}
*Ward:* ${item.ward_name || '-'}
*Overdue Months:* ${item.unpaid_months_count} Months
*Total Overdue Amount:* ₹${item.total_arrears}
━━━━━━━━━━━━━━━━━━━━
Kindly clear this pending subscription at the Mahal office or via UPI online payment at your earliest convenience.

Jazakallahu Khair.
Mahal Committee`;

    const phone = item.head_phone ? item.head_phone.replace(/\D/g, '') : '';
    if (phone && phone.length === 10) {
      return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (arrears.length === 0) return;

    const headers = [
      'Family Number',
      'House Name',
      'House Name (ML)',
      'Ward',
      'Head Name',
      'Phone Number',
      'Monthly Rate (INR)',
      'Unpaid Months Count',
      'Total Arrears (INR)',
      'Unpaid Months List',
      'Last Paid Month',
    ];

    const rows = arrears.map((item) => [
      item.family_number,
      `"${item.house_name.replace(/"/g, '""')}"`,
      `"${(item.house_name_ml || '').replace(/"/g, '""')}"`,
      `"${(item.ward_name || '').replace(/"/g, '""')}"`,
      `"${(item.head_name || '').replace(/"/g, '""')}"`,
      `"${item.head_phone || ''}"`,
      item.monthly_pirivu_amount,
      item.unpaid_months_count,
      item.total_arrears,
      `"${item.unpaid_months.join(', ')}"`,
      item.last_payment_month || 'None',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mahal_pirivu_arrears_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Total Defaulter Families
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{totalRecords} Families</div>
          <p className="text-[11px] text-gray-600 mt-1">Families with overdue pirivu payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Page Overdue Total
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">
            {formatCurrency(totalOverdueSum)}
          </div>
          <p className="text-[11px] text-gray-600 mt-1">Sum of arrears on current page</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-900">Arrears Audit & Recovery</div>
            <p className="text-xs text-amber-800 mt-1">
              Send direct WhatsApp reminders to family heads or export list for ward conveners.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-gray-50 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <IconDownload className="w-4 h-4 text-amber-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search house, name, phone, family #..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-56 sm:w-64 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Ward Filter */}
            <select
              value={wardId}
              onChange={(e) => {
                setWardId(e.target.value);
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

            {/* Minimum Overdue Months Filter */}
            <select
              value={minMonths}
              onChange={(e) => {
                setMinMonths(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium"
            >
              <option value={1}>1+ Months Overdue</option>
              <option value={3}>3+ Months Overdue</option>
              <option value={6}>6+ Months Overdue</option>
              <option value={12}>12+ Months Overdue (1+ Year)</option>
            </select>
          </div>

          <button
            onClick={fetchArrears}
            className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-gray-50 rounded-lg transition self-end md:self-auto"
            title="Refresh"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>

        {/* Arrears Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Family</th>
                <th className="px-6 py-3 font-semibold">Ward</th>
                <th className="px-6 py-3 font-semibold">Head & Contact</th>
                <th className="px-6 py-3 font-semibold text-center">Monthly Rate</th>
                <th className="px-6 py-3 font-semibold">Unpaid Months</th>
                <th className="px-6 py-3 font-semibold text-right">Total Overdue</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    Loading arrears data...
                  </td>
                </tr>
              ) : arrears.length > 0 ? (
                arrears.map((item) => {
                  const isHighArrears = item.unpaid_months_count >= 6;
                  return (
                    <tr key={item.family_id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-gray-900">
                          #{item.family_number} {item.house_name}
                        </div>
                        {item.house_name_ml && (
                          <div className="text-[11px] font-gayathri text-emerald-800">
                            {item.house_name_ml}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{item.ward_name || '-'}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-gray-800">
                          {item.head_name || '-'}
                        </div>
                        <div className="text-[11px] text-gray-600 font-mono">
                          {item.head_phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center font-medium text-gray-700">
                        ₹{item.monthly_pirivu_amount}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={isHighArrears ? 'danger' : 'warning'} size="sm">
                            {item.unpaid_months_count} Months
                          </Badge>
                          <span className="text-[11px] text-gray-600 truncate max-w-xs">
                            {item.unpaid_months.slice(0, 3).join(', ')}
                            {item.unpaid_months.length > 3 ? '...' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-rose-700 text-sm whitespace-nowrap">
                        ₹{item.total_arrears}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <a
                          href={getWhatsAppReminderUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
                        >
                          <IconWhatsApp className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>Remind</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    No arrears found matching current filters. All families are up to date!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRecords > limit && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalRecords)} of {totalRecords}
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
                Page {page} of {Math.ceil(totalRecords / limit)}
              </span>
              <button
                disabled={page >= Math.ceil(totalRecords / limit)}
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
