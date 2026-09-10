'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { wardsApi, membersApi } from '../../../lib/api';
import type {
  WardWithCounts,
  CreateWardDto,
  UpdateWardDto,
  MemberListItem,
} from '@maheall/shared';
import {
  IconWard,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhone,
  IconAlertCircle,
  IconRefresh,
  IconFamily,
  IconUser,
} from '../../../components/ui/icons';
import { Modal } from '../../../components/ui/modal';

export default function WardsPage() {
  const [wards, setWards] = useState<WardWithCounts[]>([]);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<WardWithCounts | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    name_ml: string;
    ward_number: number | '';
    convener_member_id: string;
  }>({
    name: '',
    name_ml: '',
    ward_number: '',
    convener_member_id: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadWards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await wardsApi.list();
      if (res.data) setWards(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load wards');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMembers = async () => {
    try {
      const res = await membersApi.list({ limit: 100, status: 'ACTIVE' });
      if (res.data) setMembers(res.data.items);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadWards();
    loadMembers();
  }, [loadWards]);

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Ward name is required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const dto: CreateWardDto = {
        name: formData.name.trim(),
        name_ml: formData.name_ml.trim() || null,
        ward_number: formData.ward_number ? Number(formData.ward_number) : null,
        convener_member_id: formData.convener_member_id || null,
      };

      await wardsApi.create(dto);
      setIsAddModalOpen(false);
      resetForm();
      loadWards();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create ward');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard || !formData.name.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      const dto: UpdateWardDto = {
        name: formData.name.trim(),
        name_ml: formData.name_ml.trim() || null,
        ward_number: formData.ward_number ? Number(formData.ward_number) : null,
        convener_member_id: formData.convener_member_id || null,
      };

      await wardsApi.update(selectedWard.id, dto);
      setIsEditModalOpen(false);
      setSelectedWard(null);
      resetForm();
      loadWards();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update ward');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWard = async () => {
    if (!selectedWard) return;
    setSaving(true);
    setFormError(null);
    try {
      await wardsApi.delete(selectedWard.id);
      setIsDeleteModalOpen(false);
      setSelectedWard(null);
      loadWards();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete ward');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (w: WardWithCounts) => {
    setSelectedWard(w);
    setFormData({
      name: w.name,
      name_ml: w.name_ml ?? '',
      ward_number: w.ward_number ?? '',
      convener_member_id: w.convener_member_id ?? '',
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ml: '',
      ward_number: '',
      convener_member_id: '',
    });
    setFormError(null);
  };

  const totalAssignedFamilies = wards.reduce((acc, w) => acc + (w.family_count || 0), 0);
  const totalWardPopulation = wards.reduce((acc, w) => acc + (w.member_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Wards Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
              {wards.length} Wards
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Mahal Ward Administration &amp; Governance Details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadWards()}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg shadow-xs transition"
            title="Refresh list"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Ward</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Wards
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{wards.length}</p>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Total Wards</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <IconWard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Assigned Families
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalAssignedFamilies}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Assigned Families</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IconFamily className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ward Population
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalWardPopulation}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Ward Population</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <IconUser className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Wards Grid / Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            <IconRefresh className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading wards...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">
            <IconAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => loadWards()}
              className="mt-3 text-xs text-emerald-600 underline font-medium"
            >
              Try Again
            </button>
          </div>
        ) : wards.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">
            <IconWard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-800">No wards configured yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Click Add Ward to configure a new ward area
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <IconPlus className="w-3.5 h-3.5" /> Add First Ward
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ward #</th>
                  <th className="px-5 py-3.5">Ward Name</th>
                  <th className="px-5 py-3.5">Ward Convener</th>
                  <th className="px-5 py-3.5 text-center">Assigned Families</th>
                  <th className="px-5 py-3.5 text-center">Active Members</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wards.map((ward) => (
                  <tr key={ward.id} className="hover:bg-slate-50 transition">
                    {/* Ward # */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg">
                        {ward.ward_number ? `Ward ${ward.ward_number}` : 'N/A'}
                      </span>
                    </td>

                    {/* Ward Name */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{ward.name}</div>
                      {ward.name_ml && (
                        <div className="text-xs text-purple-800 font-gayathri -mt-0.5">
                          {ward.name_ml}
                        </div>
                      )}
                    </td>

                    {/* Convener */}
                    <td className="px-5 py-4">
                      {ward.convener ? (
                        <div>
                          <div className="font-medium text-gray-900">{ward.convener.name}</div>
                          {ward.convener.name_ml && (
                            <div className="text-xs text-gray-500 font-gayathri">
                              {ward.convener.name_ml}
                            </div>
                          )}
                          {ward.convener.phone && (
                            <a
                              href={`tel:${ward.convener.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-0.5"
                            >
                              <IconPhone className="w-3 h-3" /> {ward.convener.phone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Assigned Families */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/families?ward_id=${ward.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <IconFamily className="w-3.5 h-3.5" />
                        {ward.family_count} Families
                      </Link>
                    </td>

                    {/* Active Members */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        <IconUser className="w-3.5 h-3.5" />
                        {ward.member_count} Members
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(ward)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          title="Edit Ward"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWard(ward);
                            setFormError(null);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Ward"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Ward Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedWard(null);
        }}
        title={isEditModalOpen ? 'Edit Ward' : 'Add New Ward'}
        subtitle={
          isEditModalOpen
            ? 'Update ward details and convener assignment'
            : 'Create a new administrative ward in the Mahal'
        }
        maxWidth="md"
      >
        <form onSubmit={isEditModalOpen ? handleUpdateWard : handleCreateWard} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ward Name (English) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. North Ward / Bazar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Regional / Alternate Name
            </label>
            <input
              type="text"
              placeholder="e.g. North Ward / Bazar"
              value={formData.name_ml}
              onChange={(e) => setFormData({ ...formData, name_ml: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ward Number
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={formData.ward_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ward_number: e.target.value ? parseInt(e.target.value, 10) : '',
                })
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ward Convener
            </label>
            <select
              value={formData.convener_member_id}
              onChange={(e) => setFormData({ ...formData, convener_member_id: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="">Select Convener Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.family?.house_name ? ` — ${m.family.house_name}` : ''}
                  {m.phone ? ` (${m.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              {saving ? 'Saving...' : isEditModalOpen ? 'Update Ward' : 'Create Ward'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Ward Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Ward"
        subtitle="Permanently remove this ward record"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {formError}
            </div>
          )}

          {selectedWard && (
            <p className="text-xs text-gray-700 leading-relaxed">
              Are you sure you want to delete <strong>{selectedWard.name}</strong>?
              {selectedWard.family_count > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This ward currently has {selectedWard.family_count} assigned families. You must reassign or remove them first.
                </span>
              )}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteWard}
              disabled={saving || (selectedWard?.family_count ?? 0) > 0}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg"
            >
              {saving ? 'Deleting...' : 'Delete Ward'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
