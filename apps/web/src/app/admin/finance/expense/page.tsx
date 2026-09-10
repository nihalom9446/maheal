'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { financeApi } from '../../../../lib/api';
import type {
  ExpenseListItem,
  CreateExpenseDto,
  UpdateExpenseDto,
  FundType,
  PaymentMethod,
} from '@maheall/shared';
import { EXPENSE_CATEGORIES, FUND_TYPES, PAYMENT_METHODS } from '@maheall/shared';
import { Modal } from '../../../../components/ui/modal';
import { Badge } from '../../../../components/ui/badge';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
  IconTrendingDown,
} from '../../../../components/ui/icons';

const CATEGORY_NAMES_EN: Record<string, string> = {
  SALARY_IMAM: 'Imam Salary',
  SALARY_MUKRI: 'Muazzin / Mukri Salary',
  SALARY_MADRASA_TEACHER: 'Madrasa Teachers Salary',
  SALARY_OTHER: 'Other Staff Salary',
  UTILITIES: 'Electricity & Water Utilities',
  MAINTENANCE: 'Maintenance & Repairs',
  WELFARE: 'Relief & Medical Assistance',
  WAQF_CESS: 'Waqf Board Cess',
  MADRASA_BOARD_FEES: 'Madrasa Board Exam Fees',
  EVENTS: 'Programs & Events',
  CONSTRUCTION: 'Construction & Development',
  OTHER: 'Miscellaneous Expenses',
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Filters
  const [fundFilter, setFundFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<typeof EXPENSE_CATEGORIES[number]>('UTILITIES');
  const [formFundType, setFormFundType] = useState<FundType>('GENERAL');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formExpenseDate, setFormExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [formPayeeName, setFormPayeeName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionMl, setFormDescriptionMl] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('CASH');
  const [formReference, setFormReference] = useState('');
  const [formVoucherNo, setFormVoucherNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<ExpenseListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Expense list
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await financeApi.listExpense({
        page,
        limit,
        fund_type: (fundFilter as FundType) || undefined,
        category: (categoryFilter as typeof EXPENSE_CATEGORIES[number]) || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search: search.trim() || undefined,
      });

      if (res.success && res.data) {
        setExpenses(res.data.items);
        setTotalRecords(res.data.meta.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, limit, fundFilter, categoryFilter, startDate, endDate, search]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const openAddModal = () => {
    setEditingId(null);
    setFormCategory('UTILITIES');
    setFormFundType('GENERAL');
    setFormAmount(0);
    setFormExpenseDate(new Date().toISOString().split('T')[0]);
    setFormPayeeName('');
    setFormDescription('');
    setFormDescriptionMl('');
    setFormPaymentMethod('CASH');
    setFormReference('');
    setFormVoucherNo('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: ExpenseListItem) => {
    setEditingId(item.id);
    setFormCategory(item.category as typeof EXPENSE_CATEGORIES[number]);
    setFormFundType(item.fund_type as FundType);
    setFormAmount(parseFloat(item.amount) || 0);
    setFormExpenseDate(item.expense_date);
    setFormPayeeName(item.payee_name || '');
    setFormDescription(item.description || '');
    setFormDescriptionMl(item.description_ml || '');
    setFormPaymentMethod((item.payment_method as PaymentMethod) || 'CASH');
    setFormReference(item.reference || '');
    setFormVoucherNo(item.voucher_no || item.voucher_key || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      if (editingId) {
        const dto: UpdateExpenseDto = {
          category: formCategory,
          fund_type: formFundType,
          amount: formAmount,
          expense_date: formExpenseDate,
          payee_name: formPayeeName.trim() || undefined,
          description: formDescription.trim() || undefined,
          description_ml: formDescriptionMl.trim() || undefined,
          payment_method: formPaymentMethod,
          reference: formReference.trim() || undefined,
          voucher_no: formVoucherNo.trim() || undefined,
        };
        await financeApi.updateExpense(editingId, dto);
      } else {
        const dto: CreateExpenseDto = {
          category: formCategory,
          fund_type: formFundType,
          amount: formAmount,
          expense_date: formExpenseDate,
          payee_name: formPayeeName.trim() || undefined,
          description: formDescription.trim() || undefined,
          description_ml: formDescriptionMl.trim() || undefined,
          payment_method: formPaymentMethod,
          reference: formReference.trim() || undefined,
          voucher_no: formVoucherNo.trim() || undefined,
        };
        await financeApi.createExpense(dto);
      }

      setModalOpen(false);
      fetchExpenses();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save expense record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    try {
      setDeleting(true);
      await financeApi.deleteExpense(deletingRecord.id);
      setDeleteModalOpen(false);
      setDeletingRecord(null);
      fetchExpenses();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <IconTrendingDown className="w-5 h-5 text-rose-700" />
            <span>Mahal Expense Records</span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Manage operational expenses, staff salaries, utility bills, maintenance, and welfare payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Table & Filter Container */}
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
                placeholder="Search description, payee, voucher..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-52 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-rose-600"
              />
            </div>

            {/* Fund Filter */}
            <select
              value={fundFilter}
              onChange={(e) => {
                setFundFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium"
            >
              <option value="">All Funds</option>
              {FUND_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f} Fund
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_NAMES_EN[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchExpenses}
            className="p-2 text-gray-500 hover:text-rose-700 hover:bg-gray-50 rounded-lg transition self-end md:self-auto"
            title="Refresh"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Fund</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Payee / Recipient</th>
                <th className="px-6 py-3 font-semibold">Description</th>
                <th className="px-6 py-3 font-semibold">Voucher / Method</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                    Loading expense records...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap font-medium">
                      {item.expense_date}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {item.fund_type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-gray-900">{CATEGORY_NAMES_EN[item.category] || item.category}</div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-800 font-medium">
                      {item.payee_name || '-'}
                    </td>
                    <td className="px-6 py-3.5 max-w-xs truncate text-gray-600">
                      <div>{item.description || '-'}</div>
                      {item.description_ml && (
                        <div className="text-[11px] text-gray-800 font-gayathri truncate">
                          {item.description_ml}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">
                      <div className="font-mono text-[11px]">
                        {item.voucher_no ? `Voucher: ${item.voucher_no}` : item.payment_method || 'CASH'}
                      </div>
                      {item.reference && !item.voucher_no && (
                        <div className="text-[10px] text-gray-600 truncate max-w-28 font-mono">
                          Ref: {item.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-rose-700 text-sm whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Edit"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingRecord(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                    No expense records found matching the criteria.
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

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Expense Record' : 'Record New Expense'}
        subtitle="Add staff salary, maintenance, utility bills, or welfare payouts"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as typeof EXPENSE_CATEGORIES[number])}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:bg-white"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_NAMES_EN[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Fund Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Fund Type *
              </label>
              <select
                value={formFundType}
                onChange={(e) => setFormFundType(e.target.value as FundType)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rose-600 focus:bg-white"
              >
                {FUND_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f} Fund
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={formAmount || ''}
                onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                placeholder="₹ 0.00"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-600 focus:bg-white"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={formExpenseDate}
                onChange={(e) => setFormExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payee Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Payee / Recipient Name
            </label>
            <input
              type="text"
              value={formPayeeName}
              onChange={(e) => setFormPayeeName(e.target.value)}
              placeholder="e.g. KSEB / Usthad Ibrahim Maulavi"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Remarks
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Mosque electricity bill for August"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Voucher No */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Voucher No.
              </label>
              <input
                type="text"
                value={formVoucherNo}
                onChange={(e) => setFormVoucherNo(e.target.value)}
                placeholder="e.g. VOU-2026-042"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-rose-600 focus:bg-white"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-600 focus:bg-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition"
            >
              {saving ? 'Saving...' : editingId ? 'Update Record' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Expense Record"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Are you sure you want to delete this expense record of{' '}
            <strong className="text-gray-900">{formatCurrency(deletingRecord?.amount || 0)}</strong>{' '}
            ({deletingRecord?.category})? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
