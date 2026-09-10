'use client';

import React, { useState, useEffect } from 'react';
import { useMember } from '../../../lib/member-context';
import { FamilyMemberRecord } from '../../../lib/member-data';
import {
  IconFamily,
  IconUser,
  IconPhone,
  IconWhatsApp,
  IconPlus,
  IconCheck,
  IconAlertCircle,
  IconMapPin,
  IconCheckCircle,
  IconClock,
} from '../../../components/ui/icons';

interface CorrectionRequest {
  id: string;
  category: string;
  notes: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export default function MyFamilyPage() {
  const { profile, familyMembers } = useMember();
  const [selectedMember, setSelectedMember] = useState<FamilyMemberRecord | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState('UPDATE_DETAILS');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maheall_family_corrections');
      if (stored) {
        setCorrectionRequests(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const getRelationshipBadge = (rel: string) => {
    switch (rel) {
      case 'HEAD':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'SPOUSE':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'SON':
      case 'DAUGHTER':
        return 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
      case 'FATHER':
      case 'MOTHER':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
    }
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: CorrectionRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      category: correctionType,
      notes: correctionNotes,
      submittedAt: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    };
    const updated = [newReq, ...correctionRequests];
    setCorrectionRequests(updated);
    try {
      localStorage.setItem('maheall_family_corrections', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmittedMessage(
      `Your request (${newReq.id}) has been recorded and submitted to the Mahal General Secretary for verification and approval.`
    );
    setTimeout(() => {
      setIsCorrectionModalOpen(false);
      setSubmittedMessage(null);
      setCorrectionNotes('');
    }, 3000);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#102522] tracking-tight">
              My Family &amp; Household
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Complete details of family members registered in the Mahal official records
          </p>
        </div>

        <button
          onClick={() => setIsCorrectionModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#063F35] hover:bg-[#022C27] shadow-fine hover:shadow-elevated transition-all"
        >
          <IconPlus className="w-4 h-4" />
          <span>Request Record Update / Correction</span>
        </button>
      </div>

      {/* 2. HOUSEHOLD PROFILE SUMMARY CARD */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#063F35]/10 text-[#063F35] border border-[#063F35]/20">
                FAMILY #{profile?.family_number || 104}
              </span>
              {profile?.is_nri_household && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F7F1DE] text-[#785E19] border border-[#E8DCB8] flex items-center gap-1">
                  <span>UAE</span>
                  <span>•</span>
                  <span>NRI Household</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#102522] pt-1">
              {profile?.house_name || 'Baitul Noor'}
            </h2>

            <p className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
              <IconMapPin className="w-3.5 h-3.5 text-[#063F35]" />
              <span>
                Door No: <strong className="text-stone-900 font-mono">{profile?.door_number || '14/280-B'}</strong>, {profile?.ward_name || 'Ward 3 - Valiya Parambu'}
              </span>
            </p>
          </div>

          <div className="bg-stone-50/90 p-5 rounded-xl border border-stone-200 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Head of Household
            </div>
            <div className="text-sm font-bold text-stone-900">
              {profile?.head_name || 'Abdurahiman Musliyar'}
            </div>
            <div className="text-xs text-stone-600 font-mono pt-1">
              {profile?.phone || '+91 98460 12345'}
            </div>
          </div>

          <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Registry Status
            </div>
            <div className="text-base font-bold text-emerald-950 font-mono">
              {familyMembers.length} Members Registered
            </div>
            <div className="text-xs text-emerald-800">
              Pirivu Rate: <strong className="font-mono">₹{profile?.monthly_pirivu || 200} / Month</strong>
            </div>
            <div className="text-[10px] text-emerald-700 pt-1 font-semibold flex items-center gap-1">
              <IconCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified by General Secretary</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL FAMILY MEMBERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#102522] flex items-center gap-2">
            <span>Registered Family Members</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#063F35]/10 text-[#063F35] font-bold">
              {familyMembers.length}
            </span>
          </h3>
          <span className="text-xs text-stone-500">
            Click member card for full details
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#063F35]/10 text-[#063F35] flex items-center justify-center font-bold text-base border border-[#063F35]/15 group-hover:bg-[#063F35] group-hover:text-white transition-colors">
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#102522] group-hover:text-[#063F35] transition-colors leading-tight">
                        {member.name}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {member.id}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] border uppercase ${getRelationshipBadge(
                      member.relationship
                    )}`}
                  >
                    {member.relationship}
                  </span>
                </div>

                {/* Member Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1 bg-stone-50/90 p-3.5 rounded-xl border border-stone-200/70">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block font-bold">
                      Age &amp; Gender
                    </span>
                    <span className="font-semibold text-stone-800">
                      {member.age} Yrs &bull; {member.gender === 'M' ? 'Male' : 'Female'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block font-bold">
                      Blood Group
                    </span>
                    <span className="inline-block font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-xs">
                      {member.blood_group || 'N/A'}
                    </span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-stone-200/60">
                    <span className="text-[10px] text-stone-400 uppercase block font-bold">
                      Occupation
                    </span>
                    <span className="font-medium text-stone-800 truncate block">
                      {member.occupation || 'Not Specified'}
                    </span>
                  </div>

                  {member.is_nri && (
                    <div className="col-span-2 pt-1 border-t border-stone-200/60">
                      <span className="text-[10px] text-amber-800 uppercase block font-bold">
                        NRI Status
                      </span>
                      <span className="text-xs font-bold text-amber-950">
                        {member.nri_country || 'United Arab Emirates'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Connect */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                {member.phone ? (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#063F35] transition font-medium"
                  >
                    <IconPhone className="w-3.5 h-3.5 text-[#063F35]" />
                    <span className="font-mono text-[11px]">{member.phone}</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-stone-400">Dependent Member</span>
                )}

                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Active Member
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3b. RECENT CORRECTION REQUESTS (IF ANY) */}
      {correctionRequests.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102522] flex items-center gap-2">
              <IconClock className="w-5 h-5 text-amber-600" />
              <span>Pending Correction &amp; Update Requests</span>
            </h2>
          </div>

          <div className="space-y-3">
            {correctionRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-amber-200 rounded-xl p-4 shadow-fine flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {req.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(req.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700">{req.notes}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Under Mahal Verification</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL: MEMBER DETAILS DRAWER / MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-modal border border-stone-200 space-y-5">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#063F35] text-white flex items-center justify-center font-serif font-bold text-lg shadow-fine">
                  {selectedMember.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#102522]">
                    {selectedMember.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] border uppercase ${getRelationshipBadge(
                        selectedMember.relationship
                      )}`}
                    >
                      {selectedMember.relationship}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      ID: {selectedMember.id}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Comprehensive Detail Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-stone-50/80 p-4 rounded-xl border border-stone-200/70">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">
                    Age &amp; Gender
                  </span>
                  <span className="font-semibold text-stone-900 mt-0.5 block">
                    {selectedMember.age} Years &bull; {selectedMember.gender === 'M' ? 'Male' : 'Female'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">
                    Blood Group
                  </span>
                  <span className="font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                    {selectedMember.blood_group || 'Not recorded'}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-stone-200/60">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">
                    Occupation
                  </span>
                  <span className="font-medium text-stone-900 mt-0.5 block">
                    {selectedMember.occupation || 'Not Specified'}
                  </span>
                </div>
                {selectedMember.is_nri && (
                  <div className="col-span-2 pt-2 border-t border-stone-200/60">
                    <span className="text-[10px] text-amber-800 uppercase font-bold block">
                      Expatriate / NRI Status
                    </span>
                    <span className="font-bold text-amber-950 mt-0.5 block">
                      {selectedMember.nri_country || 'United Arab Emirates'}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              {selectedMember.phone ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Direct Contact
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedMember.phone.replace(/\s+/g, '')}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-emerald-50 text-stone-800 rounded-lg border border-emerald-200 font-mono text-xs font-semibold shadow-2xs transition"
                    >
                      <IconPhone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{selectedMember.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                    >
                      <IconWhatsApp className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-center">
                  No individual phone registered. Household phone is used for notices.
                </div>
              )}

              {/* DPDPA & Mahal Official Record Verification */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2">
                <IconCheckCircle className="w-4 h-4 text-[#063F35] shrink-0 mt-0.5" />
                <span>
                  Official registered member of Noorul Islam Juma Masjid Mahal Registry in compliance with DPDPA 2023 privacy safeguards.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setCorrectionNotes(`Update record for member: ${selectedMember.name} (${selectedMember.id}) - `);
                  setIsCorrectionModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#063F35] hover:bg-[#022C27] transition shadow-fine"
              >
                Request Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: MEMBER CORRECTION REQUEST */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-modal border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#102522]">
                  Request Record Correction
                </h3>
                <p className="text-xs text-stone-500">
                  Application to update family and household details
                </p>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <IconCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <p>{submittedMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Correction Category
                  </label>
                  <select
                    value={correctionType}
                    onChange={(e) => setCorrectionType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#063F35] focus:bg-white transition"
                  >
                    <option value="UPDATE_DETAILS">Update Existing Member Details (Phone/Job/Blood Group)</option>
                    <option value="ADD_NEW_BORN">Add Newborn Child / New Family Member</option>
                    <option value="MARRIAGE_TRANSFER">Marriage Transfer In / Out</option>
                    <option value="NRI_STATUS">Update NRI Status (Going Abroad / Returned)</option>
                    <option value="DECEASED_REPORT">Report Demise of Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Details of Correction &amp; Supporting Info
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={correctionNotes}
                    onChange={(e) => setCorrectionNotes(e.target.value)}
                    placeholder="Enter details (e.g. New mobile number for Mohammed Bilal, or newborn child name & date of birth)..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#063F35] focus:bg-white transition leading-relaxed"
                  />
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Note: Corrections are reviewed and authenticated by the Mahal Committee in accordance with DPDPA 2023 guidelines before permanent updating.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsCorrectionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#063F35] hover:bg-[#022C27] shadow-fine hover:shadow-elevated transition"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
