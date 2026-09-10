'use client';

import React, { useEffect, useState } from 'react';
import { eventsApi } from '../../../lib/api';
import type {
  EventListItem,
  CreateEventDto,
  UpdateEventDto,
  EventFilterDto,
} from '@maheall/shared';
import {
  IconCalendar,
  IconPlus,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconWhatsApp,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconMapPin,
  IconClock,
} from '../../../components/ui/icons';

export default function EventsAdminPage() {
  const [items, setItems] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventListItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    title_ml: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location: '',
    status: 'ACTIVE',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const filters: EventFilterDto = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: (statusFilter as any) || undefined,
      };

      const res = await eventsApi.list(filters);
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

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(21, 30, 0, 0);

    setFormData({
      title: '',
      title_ml: '',
      description: '',
      starts_at: tomorrow.toISOString().slice(0, 16),
      ends_at: tomorrowEnd.toISOString().slice(0, 16),
      location: 'Mahal Community Hall',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EventListItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      title_ml: item.title_ml || '',
      description: item.description || '',
      starts_at: item.starts_at ? new Date(item.starts_at).toISOString().slice(0, 16) : '',
      ends_at: item.ends_at ? new Date(item.ends_at).toISOString().slice(0, 16) : '',
      location: item.location || '',
      status: item.status as any,
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
        await eventsApi.update(editingItem.id, formData as UpdateEventDto);
      } else {
        await eventsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsApi.delete(id);
      fetchEvents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleShareWhatsApp = (item: EventListItem) => {
    const startStr = item.starts_at
      ? new Date(item.starts_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';

    const text = `*${item.title}*\n*Time:* ${startStr}\n*Venue:* ${item.location || 'Mahal Community Hall'}\n\n${
      item.description || ''
    }\n\nAll are cordially welcome.\n_— MAHEALL_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Mahal Events & Programs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mahal events, meetings, and gatherings
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-sm shadow-sm transition"
        >
          <IconPlus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search events by title, description, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Upcoming / Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
                setStatusFilter('');
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

      {/* Events Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            Total Events: <span className="text-indigo-700 font-mono">{totalCount}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <IconRefresh className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <span>Loading events...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <IconCalendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">No events found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &apos;Create Event&apos; to schedule a program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Event</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Event Title & Desc */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-bold text-slate-900 leading-snug">
                        {item.title}
                      </div>
                      {item.title_ml && item.title_ml !== item.title && (
                        <div className="text-xs text-indigo-900 font-gayathri mt-0.5">
                          {item.title_ml}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700 font-mono">
                      {item.starts_at ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <IconCalendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              {new Date(item.starts_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <IconClock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(item.starts_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                              {item.ends_at &&
                                ` - ${new Date(item.ends_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Date TBA</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-xs text-slate-700 max-w-xs">
                      {item.location ? (
                        <div className="flex items-center gap-1.5">
                          <IconMapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Active / Upcoming
                        </span>
                      ) : item.status === 'COMPLETED' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(item)}
                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition"
                        title="Share Event on WhatsApp"
                      >
                        <IconWhatsApp className="w-4 h-4 text-green-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Edit Event"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Event"
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

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'Edit Event' : 'Schedule New Event'}
                </h2>
                <p className="text-xs text-indigo-900">
                  Add or update Mahal event details
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
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual General Body Meeting"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternative / Local Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual General Body Meeting & Family Meet"
                  value={formData.title_ml || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title_ml: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Start & End DateTime */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.starts_at || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, starts_at: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ends At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ends_at || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, ends_at: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahal Auditorium"
                    value={formData.location || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="ACTIVE">Active / Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Event details, agenda, and schedule..."
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs shadow transition disabled:opacity-60"
                >
                  {formLoading ? (
                    <IconRefresh className="w-4 h-4 animate-spin" />
                  ) : (
                    <IconCheck className="w-4 h-4" />
                  )}
                  <span>{editingItem ? 'Update Event' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
