'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { certificatesApi, familiesApi } from '@/lib/api';
import type { IssueMembershipCertificateDto, FamilyListItem, FamilyDetail } from '@maheall/shared';
import { IconArrowLeft, IconAlertCircle, IconCheckCircle, IconSearch } from '@/components/ui/icons';

const PURPOSES = [
  { value: 'Scholarship', label: 'Scholarship', label_ml: 'Scholarship' },
  { value: 'Haj', label: 'Haj & Umrah', label_ml: 'Haj & Umrah' },
  { value: 'College Admission', label: 'College / School Admission', label_ml: 'College / School Admission' },
  { value: 'Government Scheme', label: 'Government / Welfare Scheme', label_ml: 'Government / Welfare Scheme' },
  { value: 'Employment / Verification', label: 'Employment / Verification', label_ml: 'Employment / Verification' },
  { value: 'General', label: 'General Mahal Identification', label_ml: 'General Mahal Identification' },
  { value: 'Other', label: 'Other Purpose', label_ml: 'Other Purpose' },
];

export default function NewMembershipCertificatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Family Search & Selection
  const [familySearch, setFamilySearch] = useState('');
  const [searchingFamilies, setSearchingFamilies] = useState(false);
  const [searchResults, setSearchResults] = useState<FamilyListItem[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyDetail | null>(null);
  const [loadingFamilyDetail, setLoadingFamilyDetail] = useState(false);

  const [formData, setFormData] = useState<IssueMembershipCertificateDto>({
    family_id: '',
    member_id: null,
    purpose: 'Scholarship',
    purpose_ml: 'Scholarship',
    custom_purpose_text: '',
    custom_purpose_text_ml: '',
    issued_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
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
      } catch {
        setSearchResults([]);
      } finally {
        setSearchingFamilies(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [familySearch]);

  const handleSelectFamily = async (fam: FamilyListItem) => {
    try {
      setLoadingFamilyDetail(true);
      const res = await familiesApi.get(fam.id);
      const familyData = res.data;
      if (res.success && familyData) {
        setSelectedFamily(familyData);
        setFormData((prev) => ({
          ...prev,
          family_id: familyData.id,
          member_id: null,
        }));
        setSearchResults([]);
        setFamilySearch('');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load family members');
    } finally {
      setLoadingFamilyDetail(false);
    }
  };

  const handlePurposeChange = (purposeValue: string) => {
    const selected = PURPOSES.find((p) => p.value === purposeValue);
    setFormData((prev) => ({
      ...prev,
      purpose: purposeValue,
      purpose_ml: selected?.label_ml || purposeValue,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.family_id) {
      setError('Please select a family from the Mahal directory.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await certificatesApi.issueMembership(formData);
      if (res.success && res.data) {
        router.push(`/admin/certificates/${res.data.id}`);
      } else {
        setError('Failed to issue Membership certificate');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error occurred while issuing Membership certificate');
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
            <h1 className="text-2xl font-bold text-gray-900">Issue Membership Certificate</h1>
            <p className="text-xs text-gray-500">
              Mahal Membership & Identity Certificate
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
              Family & Beneficiary
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

          {/* Member Selector */}
          {selectedFamily && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Certificate Beneficiary
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
                <option value="">Head of Family / Whole Family</option>
                {selectedFamily.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship_to_head || 'Member'}) {m.phone ? `— ${m.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* PURPOSE SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Purpose & Validity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Certificate Purpose <span className="text-red-500">*</span>
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={(e) => handlePurposeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              >
                {PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Purpose / Details in English (Optional)
              </label>
              <input
                type="text"
                name="custom_purpose_text"
                value={formData.custom_purpose_text || ''}
                onChange={handleChange}
                placeholder="e.g. Higher Education Scholarship / Passport verification"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Purpose (Alternative / Local)
              </label>
              <input
                type="text"
                name="custom_purpose_text_ml"
                value={formData.custom_purpose_text_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Higher Education Scholarship / Passport verification"
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
                placeholder="Any specific reference number or committee notes..."
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
            <span>{submitting ? 'Generating...' : 'Issue Membership Certificate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
