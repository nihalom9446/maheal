'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { financeApi } from '../../../lib/api';
import type { FinancialSummaryDto, RecentTransactionItem } from '@maheall/shared';
import { Badge } from '../../../components/ui/badge';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconFinance,
  IconReceipt,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
} from '../../../components/ui/icons';

export default function FinanceOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryDto | null>(null);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeApi.getSummary({ period });
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load financial summary');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatCurrency = (val?: number) => {
    const num = val || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Period Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Reporting Period:
          </span>
          <div className="inline-flex p-1 bg-gray-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'month'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'year'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                period === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition"
        >
          <IconRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Net Balance & Totals Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IconTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatCurrency(summary?.total_income)}
            </div>
            {summary?.comparison && (
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span
                  className={`font-semibold ${
                    summary.comparison.income_change_percentage >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {summary.comparison.income_change_percentage >= 0 ? '+' : ''}
                  {summary.comparison.income_change_percentage}%
                </span>
                <span className="text-gray-600">vs prev period</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <IconTrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatCurrency(summary?.total_expense)}
            </div>
            {summary?.comparison && (
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span
                  className={`font-semibold ${
                    summary.comparison.expense_change_percentage <= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {summary.comparison.expense_change_percentage >= 0 ? '+' : ''}
                  {summary.comparison.expense_change_percentage}%
                </span>
                <span className="text-gray-600">vs prev period</span>
              </div>
            )}
          </div>
        </div>

        {/* Net Operating Balance */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Net Operating Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center">
              <IconFinance className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? '...' : formatCurrency(summary?.net_balance)}
            </div>
            <p className="text-xs text-emerald-200 mt-1">
              Net operating reserve balance
            </p>
          </div>
        </div>
      </div>

      {/* Pirivu Collection Performance Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Monthly Collection Performance</span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Active Mahal Families: {summary?.pirivu.total_families_count || 0} | Paying this
              period: {summary?.pirivu.paying_families_count || 0}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/finance/arrears"
              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition"
            >
              View Arrears
            </Link>
            <Link
              href="/admin/finance/pirivu"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Record Collection</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Progress Bar & Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-700">Collection Rate</span>
              <span className="text-emerald-700 font-bold">
                {summary?.pirivu.collection_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, summary?.pirivu.collection_percentage || 0)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              {summary?.pirivu.paying_families_count || 0} of{' '}
              {summary?.pirivu.total_families_count || 0} families have paid
            </p>
          </div>

          {/* Expected vs Collected */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-xs text-gray-600 font-medium">Expected Target</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {formatCurrency(summary?.pirivu.total_expected)}
            </div>
            <div className="text-[11px] text-gray-600 mt-1">
              Sum of monthly rates for all active families
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <div className="text-xs text-emerald-800 font-medium">
              Collected
            </div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">
              {formatCurrency(summary?.pirivu.total_collected)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Total subscription received in this period
            </div>
          </div>
        </div>
      </div>

      {/* Fund-wise Balances (General, Zakat, Madrasa) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900">
          Fund Balances Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* General Fund */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-bold text-gray-900 text-sm">General Fund</span>
              </div>
              <Badge variant="primary">GENERAL</Badge>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Income:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(summary?.funds.GENERAL.income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expense:</span>
                <span className="font-semibold text-rose-700">
                  {formatCurrency(summary?.funds.GENERAL.expense)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold">
                <span className="text-gray-800">Net:</span>
                <span
                  className={
                    (summary?.funds.GENERAL.net || 0) >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {formatCurrency(summary?.funds.GENERAL.net)}
                </span>
              </div>
            </div>
          </div>

          {/* Zakat Fund */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-bold text-gray-900 text-sm">Zakat & Welfare Fund</span>
              </div>
              <Badge variant="gold">ZAKAT</Badge>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Income:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(summary?.funds.ZAKAT.income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expense:</span>
                <span className="font-semibold text-rose-700">
                  {formatCurrency(summary?.funds.ZAKAT.expense)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold">
                <span className="text-gray-800">Net:</span>
                <span
                  className={
                    (summary?.funds.ZAKAT.net || 0) >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {formatCurrency(summary?.funds.ZAKAT.net)}
                </span>
              </div>
            </div>
          </div>

          {/* Madrasa Fund */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-bold text-gray-900 text-sm">Madrasa Fund</span>
              </div>
              <Badge variant="info">MADRASA</Badge>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Income:</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(summary?.funds.MADRASA.income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expense:</span>
                <span className="font-semibold text-rose-700">
                  {formatCurrency(summary?.funds.MADRASA.expense)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold">
                <span className="text-gray-800">Net:</span>
                <span
                  className={
                    (summary?.funds.MADRASA.net || 0) >= 0
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {formatCurrency(summary?.funds.MADRASA.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Latest financial activity across income, expenses, and pirivu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/finance/income"
              className="text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              All Income
            </Link>
            <Link
              href="/admin/finance/expense"
              className="text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              All Expenses
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Fund</th>
                <th className="px-6 py-3 font-semibold">Category / Description</th>
                <th className="px-6 py-3 font-semibold">Party Name</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                    Loading transactions...
                  </td>
                </tr>
              ) : summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
                summary.recent_transactions.map((tx: RecentTransactionItem) => {
                  const isExpense = tx.type === 'EXPENSE';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-3.5">
                        <Badge variant={isExpense ? 'danger' : 'success'} size="sm">
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {tx.fund_type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-gray-900">{tx.category}</div>
                        {tx.description && (
                          <div className="text-[11px] text-gray-600 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-gray-700">
                        {tx.party_name || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold whitespace-nowrap">
                        <span className={isExpense ? 'text-rose-700' : 'text-emerald-700'}>
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                    No transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
