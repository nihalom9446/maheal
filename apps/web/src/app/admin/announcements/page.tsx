'use client';

import React, { useEffect, useState } from 'react';
import { announcementsApi } from '../../../lib/api';
import type {
  AnnouncementListItem,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementFilterDto,
} from '@maheall/shared';
import {
  IconAnnouncements,
  IconPlus,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconWhatsApp,
  IconCheck,
  IconX,
  IconSend,
  IconAlertCircle,
  IconClock,
} from '../../../components/ui/icons';

const CATEGORY_STYLES: Record<string, { label: string; labelMl: string; bg: string; text: string }> = {
  GENERAL: { label: 'General', labelMl: 'General', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  EMERGENCY: { label: 'Emergency', labelMl: 'Emergency', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  JANAZAH: { label: 'Janazah', labelMl: 'Janazah', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
  FINANCE: { label: 'Finance', labelMl: 'Finance', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  MADRASA: { label: 'Madrasa', labelMl: 'Madrasa', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  EVENT: { label: 'Event', labelMl: 'Event', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  WELFARE: { label: 'Welfare', labelMl: 'Welfare', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  COMMUNITY: { label: 'Community', labelMl: 'Community', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-800' },
};

export default function AnnouncementsAdminPage() {
  const [items, setItems] = useState<AnnouncementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementListItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: '',
    title_ml: '',
    content: '',
    content_ml: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    status: 'PUBLISHED',
    audience: 'ALL',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const filters: AnnouncementFilterDto = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        category: (categoryFilter as any) || undefined,
        status: (statusFilter as any) || undefined,
        priority: (priorityFilter as any) || undefined,
      };

      const res = await announcementsApi.list(filters);
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
    fetchAnnouncements();
  }, [page, categoryFilter, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnnouncements();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      title_ml: '',
      content: '',
      content_ml: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      status: 'PUBLISHED',
      audience: 'ALL',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AnnouncementListItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      title_ml: item.title_ml || '',
      content: item.content || '',
      content_ml: item.content_ml || '',
      category: item.category as any,
      priority: item.priority as any,
      status: item.status as any,
      audience: (item.audience as any) || 'ALL',
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
        await announcementsApi.update(
          editingItem.id,
          formData as UpdateAnnouncementDto
        );
      } else {
        await announcementsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickPublish = async (id: string) => {
    try {
      await announcementsApi.publish(id);
      fetchAnnouncements();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementsApi.delete(id);
      fetchAnnouncements();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleShareWhatsApp = (item: AnnouncementListItem) => {
    const text = `*${item.title}*\n${item.content || ''}\n\n_— MAHEALL Notice_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Announcements & Notices
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mahal notices, circulars, and updates
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition"
        >
          <IconPlus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search announcements by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="">All Categories</option>
              {Object.keys(CATEGORY_STYLES).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_STYLES[cat].label}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal</option>
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
                setCategoryFilter('');
                setStatusFilter('');
                setPriorityFilter('');
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

      {/* Announcements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            Total Announcements:{' '}
            <span className="text-emerald-700 font-mono">{totalCount}</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <IconRefresh className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <span>Loading announcements...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <IconAnnouncements className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">No announcements found</p>
            <p className="text-xs text-slate-400 mt-1">
              Create a new announcement or adjust your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Announcement</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Audience</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Published / Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => {
                  const cat = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.GENERAL;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* Title & Preview */}
                      <td className="py-4 px-6 max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-900 leading-snug">
                          {item.title}
                        </div>
                        {item.title_ml && item.title_ml !== item.title && (
                          <div className="text-xs text-slate-600 font-gayathri mt-0.5">
                            {item.title_ml}
                          </div>
                        )}
                        {(item.content || item.content_ml) && (
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {item.content_ml || item.content}
                          </p>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.bg} ${cat.text}`}
                        >
                          {cat.label}
                        </span>
                      </td>

                      {/* Audience */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {item.audience}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.priority === 'URGENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Urgent
                          </span>
                        ) : item.priority === 'HIGH' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            High
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Normal</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.status === 'PUBLISHED' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            Published
                          </span>
                        ) : item.status === 'DRAFT' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            Draft
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {item.status}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                        {item.publisher_name && (
                          <div className="text-[11px] text-slate-400">
                            By {item.publisher_name}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 whitespace-nowrap text-right space-x-1.5">
                        {item.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => handleQuickPublish(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="Publish Announcement"
                          >
                            <IconCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(item)}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition"
                          title="Share on WhatsApp"
                        >
                          <IconWhatsApp className="w-4 h-4 text-green-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Edit"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <p className="text-xs text-slate-500">
                  Draft or publish Mahal notices
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
              {/* Category, Priority, Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    {Object.keys(CATEGORY_STYLES).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_STYLES[cat].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) =>
                      setFormData({ ...formData, audience: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                  >
                    <option value="ALL">All Members</option>
                    <option value="COMMITTEE">Committee Only</option>
                    <option value="MADRASA">Madrasa Parents</option>
                    <option value="WARD">Specific Ward</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Monthly Committee Meeting this Sunday"
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
                    placeholder="e.g. Monthly Committee Meeting"
                    value={formData.title_ml || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, title_ml: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Content (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Announcement details..."
                    value={formData.content || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alternative / Local Content (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Notice details..."
                    value={formData.content_ml || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, content_ml: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Status action toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Publish Status:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    <option value="PUBLISHED">Publish Immediately</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
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
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow transition disabled:opacity-60"
                  >
                    {formLoading ? (
                      <IconRefresh className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconCheck className="w-4 h-4" />
                    )}
                    <span>{editingItem ? 'Update' : 'Publish Announcement'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
