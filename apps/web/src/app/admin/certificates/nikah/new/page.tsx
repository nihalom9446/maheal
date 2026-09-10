'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { certificatesApi } from '@/lib/api';
import type { IssueNikahCertificateDto } from '@maheall/shared';
import { IconArrowLeft, IconAlertCircle, IconCheckCircle } from '@/components/ui/icons';

export default function NewNikahCertificatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<IssueNikahCertificateDto>({
    // Groom
    groom_name: '',
    groom_name_ml: '',
    groom_father: '',
    groom_father_ml: '',
    groom_house: '',
    groom_house_ml: '',
    groom_mahal: '',
    groom_mahal_ml: '',
    groom_dob: '',
    groom_phone: '',

    // Bride
    bride_name: '',
    bride_name_ml: '',
    bride_father: '',
    bride_father_ml: '',
    bride_house: '',
    bride_house_ml: '',
    bride_mahal: '',
    bride_mahal_ml: '',
    bride_dob: '',
    bride_phone: '',

    // Nikah info
    mahr_amount: '',
    mahr_description: 'Cash / Gold',
    mahr_description_ml: 'Cash / Gold',
    wali_name: '',
    wali_name_ml: '',
    wali_relation: 'Father',
    wali_relation_ml: 'Father',
    witness1_name: '',
    witness1_name_ml: '',
    witness2_name: '',
    witness2_name_ml: '',
    qazi_name: '',
    qazi_name_ml: '',
    nikah_date: new Date().toISOString().split('T')[0],
    nikah_time: '11:00 AM',
    nikah_venue: 'Juma Masjid',
    nikah_venue_ml: 'Juma Masjid',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const res = await certificatesApi.issueNikah(formData);
      if (res.success && res.data) {
        router.push(`/admin/certificates/${res.data.id}`);
      } else {
        setError('Failed to issue certificate');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error occurred while issuing Nikah certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
            <h1 className="text-2xl font-bold text-gray-900">Issue Nikah Certificate</h1>
            <p className="text-xs text-gray-500">Marriage Certificate Registration</p>
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
        {/* GROOM SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Groom Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Groom Full Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom_name"
                required
                value={formData.groom_name}
                onChange={handleChange}
                placeholder="e.g. Mohammed Farhan C.K"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Groom Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="groom_name_ml"
                value={formData.groom_name_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Mohammed Farhan"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father's Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom_father"
                required
                value={formData.groom_father}
                onChange={handleChange}
                placeholder="e.g. Abdul Rahman"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father's Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="groom_father_ml"
                value={formData.groom_father_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Abdul Rahman"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                House Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom_house"
                required
                value={formData.groom_house}
                onChange={handleChange}
                placeholder="e.g. Chaliyam House"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                House Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="groom_house_ml"
                value={formData.groom_house_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Chaliyam House"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahal / Place (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom_mahal"
                required
                value={formData.groom_mahal}
                onChange={handleChange}
                placeholder="e.g. Kozhikode Town Mahal"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahal / Place (Alternative / Local)
              </label>
              <input
                type="text"
                name="groom_mahal_ml"
                value={formData.groom_mahal_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Kozhikode Town Mahal"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="groom_dob"
                value={formData.groom_dob || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                name="groom_phone"
                value={formData.groom_phone || ''}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* BRIDE SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Bride Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bride Full Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride_name"
                required
                value={formData.bride_name}
                onChange={handleChange}
                placeholder="e.g. Fathima Raniya"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bride Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="bride_name_ml"
                value={formData.bride_name_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Fathima Raniya"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father's Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride_father"
                required
                value={formData.bride_father}
                onChange={handleChange}
                placeholder="e.g. Usman Haji"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Father's Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="bride_father_ml"
                value={formData.bride_father_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Usman Haji"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                House Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride_house"
                required
                value={formData.bride_house}
                onChange={handleChange}
                placeholder="e.g. Puthiyaveettil"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                House Name (Alternative / Local)
              </label>
              <input
                type="text"
                name="bride_house_ml"
                value={formData.bride_house_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Puthiyaveettil"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahal / Place (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride_mahal"
                required
                value={formData.bride_mahal}
                onChange={handleChange}
                placeholder="e.g. Feroke Town Juma Masjid"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahal / Place (Alternative / Local)
              </label>
              <input
                type="text"
                name="bride_mahal_ml"
                value={formData.bride_mahal_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Feroke Town Juma Masjid"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="bride_dob"
                value={formData.bride_dob || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                name="bride_phone"
                value={formData.bride_phone || ''}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* NIKAH DETAILS SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Marriage & Nikah Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nikah Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="nikah_date"
                required
                value={formData.nikah_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nikah Time</label>
              <input
                type="text"
                name="nikah_time"
                value={formData.nikah_time || ''}
                onChange={handleChange}
                placeholder="e.g. 11:30 AM / After Dhuhr"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Venue (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nikah_venue"
                required
                value={formData.nikah_venue}
                onChange={handleChange}
                placeholder="e.g. Town Juma Masjid Auditorium"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Venue (Alternative / Local)
              </label>
              <input
                type="text"
                name="nikah_venue_ml"
                value={formData.nikah_venue_ml || ''}
                onChange={handleChange}
                placeholder="e.g. Town Juma Masjid Auditorium"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahr Amount / Description
              </label>
              <input
                type="text"
                name="mahr_description"
                value={formData.mahr_description || ''}
                onChange={handleChange}
                placeholder="e.g. 10 Pavan Gold / ₹50,000 Cash"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahr Description (Additional / Notes)
              </label>
              <input
                type="text"
                name="mahr_description_ml"
                value={formData.mahr_description_ml || ''}
                onChange={handleChange}
                placeholder="e.g. 10 Pavan Gold"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Wali */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Wali / Guardian Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="wali_name"
                required
                value={formData.wali_name}
                onChange={handleChange}
                placeholder="e.g. Usman Haji"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Wali Relation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="wali_relation"
                required
                value={formData.wali_relation}
                onChange={handleChange}
                placeholder="Father / Brother / Paternal Uncle"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Witnesses */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Witness 1 Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="witness1_name"
                required
                value={formData.witness1_name}
                onChange={handleChange}
                placeholder="e.g. K.T. Abdul Salam"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Witness 2 Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="witness2_name"
                required
                value={formData.witness2_name}
                onChange={handleChange}
                placeholder="e.g. P.V. Moideen Kutty"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Qazi */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Qazi / Officiator Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="qazi_name"
                required
                value={formData.qazi_name}
                onChange={handleChange}
                placeholder="e.g. Usthad Aboobacker Musliyar (Khazi)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any special remarks or registry reference numbers..."
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
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
          >
            <IconCheckCircle className="w-4 h-4" />
            <span>{submitting ? 'Generating Certificate...' : 'Generate Official Certificate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
