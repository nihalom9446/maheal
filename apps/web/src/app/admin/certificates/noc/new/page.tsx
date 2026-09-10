'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { certificatesApi, familiesApi } from '@/lib/api';
import type { IssueNocCertificateDto, FamilyListItem, FamilyDetail } from '@maheall/shared';
import { IconArrowLeft, IconAlertCircle, IconCheckCircle, IconSearch } from '@/components/ui/icons';

export default function NewNocCertificatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Family Search & Selection
  const [familySearch, setFamilySearch] = useState('');
  const [searchingFamilies, setSearchingFamilies] = useState(false);
  const [searchResults, setSearchResults] = useState<FamilyListItem[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyDetail | null>(null);
  const [loadingFamilyDetail, setLoadingFamilyDetail] = useState(false);

  const [formData, setFormData] = useState<IssueNocCertificateDto>({
    family_id: '',
    member_id: null,
    target_mahal_name: '',
    target_mahal_name_ml: '',
    destination_place: '',
    destination_place_ml: '',
    reason: 'Permanent Relocation',
    reason_ml: 'Permanent Relocation',
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months
    dues_cleared: true,
    notes: '',
  });

  // Search families debounced
  useEffect(() => {
    if (!familySearch.trim() || familySearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingFamilies(true);
        const res = await familiesApi.list({ search: familySearch.trim(), limit: 8 });
        if (res.success && res.data) {
          setSearchResults(res.data.items);
        }
      } catch (err: any) {
        console.error('Failed to search families', err);
      } finally {
        setSearchingFamilies(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [familySearch]);

  const handleSelectFamily = async (fam: any) => {
    try {
      setLoadingFamilyDetail(true);
      const res = await familiesApi.get(fam.id);
      if (res.success && res.data) {
        setSelectedFamily(res.data);
        setFormData((prev) => ({
          ...prev,
          family_id: res.data!.id,
          member_id: null,
        }));
      } else {
        setSelectedFamily(fam);
        setFormData((prev) => ({
          ...prev,
          family_id: fam.id,
          member_id: null,
        }));
      }
    } catch {
      setSelectedFamily(fam);
      setFormData((prev) => ({
        ...prev,
        family_id: fam.id,
        member_id: null,
      }));
    } finally {
      setLoadingFamilyDetail(false);
      setFamilySearch('');
      setSearchResults([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.family_id) {
      setError('Please search and select a family');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await certificatesApi.issueNoc({
        ...formData,
        member_id: formData.member_id || undefined,
        target_mahal_name_ml: formData.target_mahal_name_ml || formData.target_mahal_name,
        destination_place_ml: formData.destination_place_ml || formData.destination_place,
        reason_ml: formData.reason_ml || formData.reason,
      });
      
      if (res.success && res.data) {
        router.push(`/admin/certificates/${res.data.id}`);
      } else {
        setError('Failed to issue NOC certificate');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error occurred while issuing NOC certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/certificates"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Issue NOC Certificate</h1>
            <p className="text-xs text-gray-500">
              No Objection Certificate
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FAMILY LOOKUP SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Family & Member Selection
            </h2>
          </div>

          {!selectedFamily ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Search Family by House Name or Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Type house name or family number..."
                  value={familySearch}
                  onChange={(e) => setFamilySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                />
                {searchingFamilies && (
                  <div className="absolute right-3 top-3 w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Search Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg bg-white shadow-lg divide-y divide-gray-100 max-h-60 overflow-y-auto mt-1">
                  {searchResults.map((fam) => (
                    <button
                      key={fam.id}
                      type="button"
                      onClick={() => handleSelectFamily(fam)}
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 flex items-center justify-between transition"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {fam.house_name} <span className="text-xs text-gray-400 font-normal">#{fam.family_number}</span>
                        </p>
                        {fam.head_member && (
                          <p className="text-xs text-gray-500">
                            Head: {fam.head_member.name} {fam.head_member.phone ? `(${fam.head_member.phone})` : ''}
                          </p>
                        )}
                      </div>
                      {fam.ward && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {fam.ward.name}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-950">
                    {selectedFamily.house_name}
                  </span>
                  <span className="text-xs bg-emerald-200 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded">
                    #{selectedFamily.family_number}
                  </span>
                </div>
                {selectedFamily.head_member && (
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Head of Family: {selectedFamily.head_member.name}
                  </p>
                )}
                {selectedFamily.ward && (
                  <p className="text-xs text-emerald-700">Ward: {selectedFamily.ward.name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFamily(null);
                  setFormData((prev) => ({ ...prev, family_id: '', member_id: null }));
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-2xs hover:bg-red-50 transition"
              >
                Change Family
              </button>
            </div>
          )}

          {/* Member Selector (Optional if entire family) */}
          {selectedFamily && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Certificate Subject
              </label>
              <select
                name="member_id"
                value={formData.member_id || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    member_id: e.target.value ? e.target.value : null,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">Whole Family Transfer</option>
                {selectedFamily.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship_to_head || 'Member'}) {m.phone ? `— ${m.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* NOC DETAILS SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Transfer Destination & Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Mahal Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="target_mahal_name"
                required
                value={formData.target_mahal_name}
                onChange={handleChange}
                placeholder="e.g. Manjeri Town Juma Masjid Mahal"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Mahal (Alternative / Local)
              </label>
              <input
                type="text"
                name="target_mahal_name_ml"
                value={formData.target_mahal_name_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Manjeri Town Juma Masjid"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Destination Place / District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="destination_place"
                required
                value={formData.destination_place}
                onChange={handleChange}
                placeholder="e.g. Manjeri, Malappuram"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Destination Place (Alternative / Local)
              </label>
              <input
                type="text"
                name="destination_place_ml"
                value={formData.destination_place_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Manjeri, Malappuram"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for NOC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g. Relocating family residence / Marriage"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason Details (Alternative / Local)
              </label>
              <input
                type="text"
                name="reason_ml"
                value={formData.reason_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Relocating family residence / Marriage"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Issued Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="issued_date"
                required
                value={formData.issued_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Valid Until Date
              </label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Dues Cleared Checkbox */}
            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100/70 transition">
                <input
                  type="checkbox"
                  name="dues_cleared"
                  checked={formData.dues_cleared}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Mahal Dues & Subscriptions Cleared
                  </p>
                  <p className="text-xs text-gray-500">
                    Confirm that all monthly pirivu and contributions to the Mahal have been settled.
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Additional Remarks (Optional)
              </label>
              <textarea
                rows={2}
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any committee resolutions or remarks..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/certificates"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.family_id}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
          >
            <IconCheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Issuing NOC...' : 'Issue NOC Certificate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
