'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { familiesApi, wardsApi } from '../../../lib/api';
import type {
  FamilyListItem,
  WardWithCounts,
  CreateFamilyDto,
} from '@maheall/shared';
import {
  IconSearch,
  IconPlus,
  IconFamily,
  IconPhone,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from '../../../components/ui/icons';
import { Badge } from '../../../components/ui/badge';
import { Modal } from '../../../components/ui/modal';

export default function FamiliesPage() {
  const [families, setFamilies] = useState<FamilyListItem[]>([]);
  const [wards, setWards] = useState<WardWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [wardId, setWardId] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | ''>('ACTIVE');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add Family Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    house_name: string;
    house_name_ml: string;
    door_number: string;
    address: string;
    ward_id: string;
    pirivu_amount: number;
    is_nri_household: boolean;
    notes: string;
    add_head: boolean;
    head_name: string;
    head_name_ml: string;
    head_gender: 'M' | 'F';
    head_phone: string;
    head_blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
    head_occupation: string;
    head_is_nri: boolean;
  }>({
    house_name: '',
    house_name_ml: '',
    door_number: '',
    address: '',
    ward_id: '',
    pirivu_amount: 100,
    is_nri_household: false,
    notes: '',
    add_head: true,
    head_name: '',
    head_name_ml: '',
    head_gender: 'M',
    head_phone: '',
    head_blood_group: '',
    head_occupation: '',
    head_is_nri: false,
  });

  // Duplicate Check
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const loadWards = async () => {
    try {
      const res = await wardsApi.list();
      if (res.data) setWards(res.data);
    } catch {
      // Ignore
    }
  };

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await familiesApi.list({
        search: search || undefined,
        ward_id: wardId || undefined,
        status: (status as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED') || undefined,
        page,
        limit: 15,
      });

      if (res.data) {
        setFamilies(res.data.items);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load families');
    } finally {
      setLoading(false);
    }
  }, [search, wardId, status, page]);

  useEffect(() => {
    loadWards();
  }, []);

  useEffect(() => {
    loadFamilies();
  }, [loadFamilies]);

  // Debounced duplicate check
  useEffect(() => {
    if (!formData.house_name.trim() || !isAddModalOpen) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await familiesApi.checkDuplicate({
          house_name: formData.house_name,
          house_name_ml: formData.house_name_ml || undefined,
        });
        if (res.data && res.data.hasDuplicate && res.data.duplicates.length > 0) {
          const match = res.data.duplicates[0]!;
          setDuplicateWarning(
            `Notice: Similar house exists (#${match.family_number}: ${match.house_name}${match.ward_name ? ` in ${match.ward_name}` : ''})`
          );
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        setDuplicateWarning(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.house_name, formData.house_name_ml, isAddModalOpen]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.house_name.trim()) {
      setCreateError('House name is required');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const payload: CreateFamilyDto = {
        house_name: formData.house_name.trim(),
        house_name_ml: formData.house_name_ml.trim() || null,
        door_number: formData.door_number.trim() || null,
        address: formData.address.trim() || null,
        ward_id: formData.ward_id || null,
        pirivu_amount: Number(formData.pirivu_amount) || 0,
        is_nri_household: formData.is_nri_household,
        notes: formData.notes.trim() || null,
        head_member:
          formData.add_head && formData.head_name.trim()
            ? {
                name: formData.head_name.trim(),
                name_ml: formData.head_name_ml.trim() || null,
                gender: formData.head_gender,
                phone: formData.head_phone.trim() || null,
                blood_group: formData.head_blood_group || null,
                occupation: formData.head_occupation.trim() || null,
                is_nri: formData.head_is_nri,
              }
            : null,
      };

      await familiesApi.create(payload);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        house_name: '',
        house_name_ml: '',
        door_number: '',
        address: '',
        ward_id: '',
        pirivu_amount: 100,
        is_nri_household: false,
        notes: '',
        add_head: true,
        head_name: '',
        head_name_ml: '',
        head_gender: 'M',
        head_phone: '',
        head_blood_group: '',
        head_occupation: '',
        head_is_nri: false,
      });
      loadFamilies();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create family');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Families Registry</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Comprehensive directory of registered Mahal households
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadFamilies()}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg shadow-xs transition"
            title="Refresh list"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setCreateError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Family</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search house name, family #, member name, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Ward filter */}
        <div className="sm:col-span-3">
          <select
            value={wardId}
            onChange={(e) => {
              setWardId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.ward_number ? `Ward ${w.ward_number}: ` : ''}
                {w.name} {w.name_ml ? `(${w.name_ml})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="sm:col-span-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | '');
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          >
            <option value="ACTIVE">Status: Active</option>
            <option value="INACTIVE">Status: Inactive</option>
            <option value="TRANSFERRED">Status: Transferred</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Families Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            <IconRefresh className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading families data...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">
            <IconAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => loadFamilies()}
              className="mt-3 text-xs text-emerald-600 underline font-medium"
            >
              Try Again
            </button>
          </div>
        ) : families.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">
            <IconFamily className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-800">No families found</p>
            <p className="text-xs text-gray-400 mt-0.5">
              No matching family records found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Family #</th>
                  <th className="px-5 py-3.5">House Name</th>
                  <th className="px-5 py-3.5">Ward</th>
                  <th className="px-5 py-3.5">Head of Family</th>
                  <th className="px-5 py-3.5 text-center">Members</th>
                  <th className="px-5 py-3.5 text-right">Pirivu (₹)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {families.map((fam) => (
                  <tr
                    key={fam.id}
                    className="hover:bg-emerald-50/30 transition group"
                  >
                    {/* Family # */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        #{String(fam.family_number).padStart(3, '0')}
                      </span>
                    </td>

                    {/* House Name */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/families/${fam.id}`}
                        className="font-semibold text-gray-900 hover:text-emerald-700 block transition"
                      >
                        {fam.house_name}
                      </Link>
                      {fam.house_name_ml && (
                        <div className="text-xs text-emerald-800/80 font-gayathri -mt-0.5">
                          {fam.house_name_ml}
                        </div>
                      )}
                      {fam.door_number && (
                        <span className="text-[11px] text-gray-400 block">
                          Door: {fam.door_number}
                        </span>
                      )}
                    </td>

                    {/* Ward */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {fam.ward ? (
                        <div className="text-xs">
                          <span className="font-medium text-gray-800">
                            {fam.ward.ward_number ? `W${fam.ward.ward_number}: ` : ''}
                            {fam.ward.name}
                          </span>
                          {fam.ward.name_ml && (
                            <span className="block text-[11px] text-gray-500 font-gayathri">
                              {fam.ward.name_ml}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Head of Family */}
                    <td className="px-5 py-4">
                      {fam.head_member ? (
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-1.5">
                            <span>{fam.head_member.name}</span>
                            {fam.head_member.is_nri && (
                              <Badge variant="primary" size="sm">
                                NRI
                              </Badge>
                            )}
                          </div>
                          {fam.head_member.name_ml && (
                            <div className="text-xs text-gray-500 font-gayathri">
                              {fam.head_member.name_ml}
                            </div>
                          )}
                          {fam.head_member.phone && (
                            <a
                              href={`tel:${fam.head_member.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-0.5"
                            >
                              <IconPhone className="w-3 h-3" />
                              {fam.head_member.phone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not set</span>
                      )}
                    </td>

                    {/* Members Count */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                        {fam.member_count}
                      </span>
                    </td>

                    {/* Pirivu Amount */}
                    <td className="px-5 py-4 text-right whitespace-nowrap font-semibold text-gray-900">
                      ₹{parseFloat(fam.pirivu_amount || '0').toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          fam.status === 'ACTIVE'
                            ? 'success'
                            : fam.status === 'TRANSFERRED'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {fam.status}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/families/${fam.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition inline-block"
                      >
                        View Family &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && families.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 bg-gray-50/50">
            <div>
              Showing page <span className="font-semibold text-gray-900">{page}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span> ({totalCount} total)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <IconChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <IconChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Family Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Family"
        subtitle="Register a new household in the Mahal records"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateFamily} className="space-y-6">
          {createError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* Household Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1">
              1. House Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  House Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baitul Noor"
                  value={formData.house_name}
                  onChange={(e) => setFormData({ ...formData, house_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Regional House Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Baitul Noor"
                  value={formData.house_name_ml}
                  onChange={(e) => setFormData({ ...formData, house_name_ml: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Duplicate Notice */}
            {duplicateWarning && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ward
                </label>
                <select
                  value={formData.ward_id}
                  onChange={(e) => setFormData({ ...formData, ward_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="">Select Ward</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.ward_number ? `${w.ward_number} - ` : ''}
                      {w.name} {w.name_ml ? `(${w.name_ml})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Door / Building #
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14/235A"
                  value={formData.door_number}
                  onChange={(e) => setFormData({ ...formData, door_number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Monthly Pirivu (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="100"
                  value={formData.pirivu_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, pirivu_amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Address
              </label>
              <textarea
                rows={2}
                placeholder="Street name, landmark, PIN..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_nri_household"
                checked={formData.is_nri_household}
                onChange={(e) =>
                  setFormData({ ...formData, is_nri_household: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label
                htmlFor="is_nri_household"
                className="text-xs font-medium text-gray-700 cursor-pointer"
              >
                NRI Household
              </label>
            </div>
          </div>

          {/* Head Member Option */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Family Head Member
              </h4>
              <label className="flex items-center gap-2 text-xs font-medium text-emerald-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.add_head}
                  onChange={(e) => setFormData({ ...formData, add_head: e.target.checked })}
                  className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                Include Head Member Now
              </label>
            </div>

            {formData.add_head && (
              <div className="space-y-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Head Full Name (English) *
                    </label>
                    <input
                      type="text"
                      required={formData.add_head}
                      placeholder="e.g. Mohammed Ali"
                      value={formData.head_name}
                      onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Regional Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohammed Ali"
                      value={formData.head_name_ml}
                      onChange={(e) => setFormData({ ...formData, head_name_ml: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.head_gender}
                      onChange={(e) =>
                        setFormData({ ...formData, head_gender: e.target.value as 'M' | 'F' })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+919846012345"
                      value={formData.head_phone}
                      onChange={(e) => setFormData({ ...formData, head_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={formData.head_blood_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          head_blood_group: e.target.value as typeof formData.head_blood_group,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Business / Teacher"
                      value={formData.head_occupation}
                      onChange={(e) =>
                        setFormData({ ...formData, head_occupation: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.head_is_nri}
                        onChange={(e) =>
                          setFormData({ ...formData, head_is_nri: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      Is NRI Member
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition"
            >
              {creating ? 'Saving...' : 'Create Family'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
