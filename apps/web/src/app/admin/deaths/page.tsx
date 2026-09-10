'use client';

import React, { useEffect, useState } from 'react';
import { deathRecordsApi, familiesApi } from '../../../lib/api';
import type {
  DeathRecordItem,
  CreateDeathRecordDto,
  UpdateDeathRecordDto,
  DeathRecordFilterDto,
  FamilyListItem,
} from '@maheall/shared';
import {
  IconPlus,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconWhatsApp,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconUser,
  IconBuilding,
  IconMapPin,
  IconCalendar,
} from '../../../components/ui/icons';

export default function DeathRecordsAdminPage() {
  const [items, setItems] = useState<DeathRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [publicFilter, setPublicFilter] = useState<string>('');

  // Families for dropdown selection
  const [familiesList, setFamiliesList] = useState<FamilyListItem[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeathRecordItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState<CreateDeathRecordDto>({
    name: '',
    name_ml: '',
    photo_key: '',
    date_of_death: new Date().toISOString().slice(0, 10),
    burial_location: 'Mahal Juma Masjid Qabarstan',
    family_id: '',
    notes: '',
    is_details_public: true,
    create_announcement: true,
  });

  const fetchDeathRecords = async () => {
    setLoading(true);
    try {
      const filters: DeathRecordFilterDto = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        is_details_public:
          publicFilter === 'true'
            ? true
            : publicFilter === 'false'
            ? false
            : undefined,
      };

      const res = await deathRecordsApi.list(filters);
      if (res.data) {
        setItems(res.data.items);
        setTotalCount(res.data.meta.total);
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const res = await familiesApi.list({ limit: 100 });
      if (res.data) {
        setFamiliesList(res.data.items);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeathRecords();
    fetchFamilies();
  }, [page, publicFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeathRecords();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      name_ml: '',
      photo_key: '',
      date_of_death: new Date().toISOString().slice(0, 10),
      burial_location: 'Mahal Juma Masjid Qabarstan',
      family_id: '',
      notes: '',
      is_details_public: true,
      create_announcement: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DeathRecordItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      name_ml: item.name_ml || '',
      photo_key: item.photo_key || '',
      date_of_death: item.date_of_death
        ? new Date(item.date_of_death).toISOString().slice(0, 10)
        : '',
      burial_location: item.burial_location || '',
      family_id: item.family_id || '',
      notes: item.notes || '',
      is_details_public: item.is_details_public ?? true,
      create_announcement: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingItem) {
        await deathRecordsApi.update(
          editingItem.id,
          formData as UpdateDeathRecordDto
        );
      } else {
        await deathRecordsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchDeathRecords();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleVisibility = async (item: DeathRecordItem) => {
    try {
      const newStatus = !item.is_details_public;
      await deathRecordsApi.toggleVisibility(item.id, newStatus);
      setItems((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, is_details_public: newStatus } : r,
        ),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deathRecordsApi.delete(id);
      fetchDeathRecords();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleShareWhatsApp = (item: DeathRecordItem) => {
    const text = `*Inna Lillahi wa Inna Ilayhi Raji'un*\n(Indeed we belong to Allah, and indeed to Him we will return)\n\n*Janazah Announcement*\n\n*Name:* ${
      item.name
    }\n${
      item.house_name ? `*House:* ${item.house_name}\n` : ''
    }${
      item.date_of_death ? `*Date:* ${item.date_of_death}\n` : ''
    }${
      item.burial_location ? `*Burial:* ${item.burial_location}\n` : ''
    }${item.notes ? `\n*Details:* ${item.notes}\n` : ''}\nMay Allah grant maghfirah and elevate their ranks in Jannah. Ameen.\n\n_— MAHEALL_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Janazah & Death Register
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Death registry & Janazah notices
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-semibold text-sm shadow-sm transition"
        >
          <IconPlus className="w-4 h-4" />
          <span>Record Janazah</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by deceased name, local name, burial location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={publicFilter}
              onChange={(e) => {
                setPublicFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="">All Visibility</option>
              <option value="true">Public Details</option>
              <option value="false">Private / Restricted</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPublicFilter('');
                setPage(1);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Reset Filters"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Death Records Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            Total Records: <span className="text-purple-800 font-mono">{totalCount}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <IconRefresh className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-700" />
            <span>Loading death register...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <IconUser className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">No death records found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &apos;Record Janazah&apos; to register a new demise.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Deceased</th>
                  <th className="py-3.5 px-4">House</th>
                  <th className="py-3.5 px-4">Date of Demise</th>
                  <th className="py-3.5 px-4">Burial Ground</th>
                  <th className="py-3.5 px-4">Privacy Setting</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-purple-200">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">
                            {item.name}
                          </div>
                          {item.name_ml && (
                            <div className="text-xs text-purple-900 font-gayathri mt-0.5">
                              {item.name_ml}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* House Name */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700">
                      {item.house_name ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <IconBuilding className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.house_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Linked</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700 font-mono">
                      {item.date_of_death ? (
                        <div className="flex items-center gap-1.5">
                          <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date_of_death}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Burial Ground */}
                    <td className="py-4 px-4 text-xs text-slate-700 max-w-xs truncate">
                      {item.burial_location ? (
                        <div className="flex items-center gap-1.5">
                          <IconMapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="truncate">{item.burial_location}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Privacy Toggle Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          item.is_details_public
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to toggle public visibility"
                      >
                        {item.is_details_public ? (
                          <>
                            <IconEye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Public Details</span>
                          </>
                        ) : (
                          <>
                            <IconEyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Private Details</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 whitespace-nowrap text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition"
                        title="Share Janazah Notice on WhatsApp"
                      >
                        <IconWhatsApp className="w-4 h-4 text-green-600" />
                        <span className="hidden sm:inline">Share Obituary</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Edit Record"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Record"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECORD JANAZAH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'Edit Death Record' : 'Record Janazah / Demise'}
                </h2>
                <p className="text-xs text-purple-900">
                  Record demise details and issue notices
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deceased Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aboobacker Musliyar"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alternative / Local Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aboobacker Musliyar"
                    value={formData.name_ml || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name_ml: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Family Selection & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Family (Optional)
                  </label>
                  <select
                    value={formData.family_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, family_id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="">-- Select Family / None --</option>
                    {familiesList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.house_name} - #{f.family_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Demise
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_death || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, date_of_death: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Burial Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Burial Location & Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Town Juma Masjid Qabarstan (After Dhuhr prayer)"
                  value={formData.burial_location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, burial_location: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Family members, surviving relatives, notes..."
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Toggles */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_details_public}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_details_public: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Make death details public on member portal
                  </span>
                </label>

                {!editingItem && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.create_announcement}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          create_announcement: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-purple-950">
                      Auto-publish Urgent Janazah Announcement to all members
                    </span>
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-semibold text-xs shadow transition disabled:opacity-60"
                >
                  {formLoading ? (
                    <IconRefresh className="w-4 h-4 animate-spin" />
                  ) : (
                    <IconCheck className="w-4 h-4" />
                  )}
                  <span>{editingItem ? 'Update Record' : 'Save & Publish Janazah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
