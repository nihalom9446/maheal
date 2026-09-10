'use client';

import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/page-header';

export default function PublicContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    ward: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ref = `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setInquiryId(ref);

    try {
      const existing = JSON.parse(localStorage.getItem('maheall_contact_inquiries') || '[]');
      existing.unshift({
        id: ref,
        ...formData,
        submitted_at: new Date().toISOString(),
        status: 'PENDING',
      });
      localStorage.setItem('maheall_contact_inquiries', JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
      ward: '',
    });
    setSubmitted(false);
    setInquiryId('');
  };

  return (
    <div className="pb-24">
      <PageHeader
        badge="Office & Helpdesk"
        title="Contact Mahal Office"
        description="Reach out to our administrative desk for certificate queries, welfare applications, madrasa admissions, or general inquiries."
        breadcrumbs={[{ label: 'Contact' }]}
        actions={
          <div className="bg-[#022C27] text-white px-4 py-2.5 rounded-xl border border-[#063F35] shadow-fine">
            <span className="text-[10px] text-[#C9A646] uppercase font-bold tracking-wider block">24/7 Janazah Helpline</span>
            <span className="font-mono text-sm font-bold text-white">+91 98470 12345</span>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-fine space-y-6">
            <div className="border-l-4 border-[#063F35] pl-3">
              <h2 className="text-xl font-serif font-bold text-[#063F35]">
                Send an Inquiry or Message
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Send your questions or feedback directly to the Mahal Office
              </p>
            </div>

            {submitted ? (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-[#063F35]/10 text-[#063F35] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-[#063F35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#102522]">
                  Message Logged Successfully!
                </h3>
                <div className="p-3 bg-white rounded-xl border border-stone-200 inline-block font-mono text-xs font-bold text-[#063F35]">
                  Inquiry Tracking #: {inquiryId}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your message has been officially recorded. Our office bearers will follow up with you if required.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-[#063F35] hover:bg-[#022C27] text-white font-bold text-xs rounded-xl shadow-fine transition"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mohammed Shareef"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 98470 12345"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com (optional)"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ward
                    </label>
                    <select
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine cursor-pointer"
                    >
                      <option value="">Select Ward / Other</option>
                      <option value="Ward 1">Ward 1 - West Zone</option>
                      <option value="Ward 2">Ward 2 - East Zone</option>
                      <option value="Ward 3">Ward 3 - North Zone</option>
                      <option value="Ward 4">Ward 4 - South Zone</option>
                      <option value="Ward 5">Ward 5 - Central Zone</option>
                      <option value="Ward 6">Ward 6 - Bazaar Zone</option>
                      <option value="Other">Non-Resident / Other Mahal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Nikah Certificate inquiry / Welfare application"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Message / Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#063F35] outline-hidden shadow-fine"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#063F35] hover:bg-[#022C27] text-white font-bold text-xs rounded-xl shadow-fine transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <span>Send Message &rarr;</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right 1 Col: Office Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-fine space-y-4">
              <h3 className="text-base font-serif font-bold text-[#063F35] border-b border-stone-100 pb-3">
                Office Details
              </h3>

              <div className="space-y-3 text-xs text-stone-600">
                <div>
                  <strong className="text-stone-900 block mb-0.5">Physical Address:</strong>
                  <p className="leading-relaxed">
                    Noorul Islam Juma Masjid Complex,<br />
                    Main Road, Near Post Office,<br />
                    Calicut District, Kerala - 673001
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <strong className="text-stone-900 block mb-0.5">Office Timings:</strong>
                  <p>Monday – Saturday: 09:00 AM – 01:00 PM</p>
                  <p>Evening Session: 04:30 PM – 08:30 PM</p>
                  <p className="text-[#063F35] font-bold mt-1">Friday: After Jumu&apos;ah to 03:30 PM</p>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <strong className="text-stone-900 block mb-0.5">Direct Contacts:</strong>
                  <p className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Desk:</span>
                    <span className="font-mono text-stone-900 font-bold">0495 2721234</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Secretary:</span>
                    <span className="font-mono text-stone-900 font-bold">+91 94471 98765</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Email:</span>
                    <span className="text-[#063F35] font-medium">office@maheallmasjid.org</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Location Map Box */}
            <div className="bg-[#022C27] text-white rounded-2xl p-6 shadow-elevated border border-[#063F35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold text-white">Mosque Location</h3>
                <span className="text-[10px] bg-[#063F35] text-[#C9A646] px-2 py-0.5 rounded font-bold">
                  Map View
                </span>
              </div>

              <div className="aspect-video w-full rounded-xl bg-[#063F35] border border-[#0A5C4D] flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                <svg className="w-7 h-7 text-[#C9A646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-xs text-stone-200 font-medium">Noorul Islam Juma Masjid, Calicut</p>
                <span className="text-[10px] text-stone-400 font-mono">11.2588° N, 75.7804° E</span>
              </div>

              <a
                href="https://maps.google.com/?q=11.2588,75.7804"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-[#C9A646] hover:bg-[#B38F34] text-[#022C27] text-xs font-bold rounded-xl shadow-fine transition"
              >
                <span>Open in Google Maps &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
