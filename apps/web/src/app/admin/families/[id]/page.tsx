'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { familiesApi, membersApi, wardsApi } from '../../../../lib/api';
import type {
  FamilyDetail,
  FamilyMember,
  WardWithCounts,
  CreateMemberDto,
  UpdateMemberDto,
  UpdateFamilyDto,
} from '@maheall/shared';
import {
  IconArrowLeft,
  IconFamily,
  IconUser,
  IconCrown,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhone,
  IconAlertCircle,
  IconRefresh,
  IconCheck,
} from '../../../../components/ui/icons';
import { Badge } from '../../../../components/ui/badge';
import { Modal } from '../../../../components/ui/modal';

export default function FamilyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [wards, setWards] = useState<WardWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditFamilyOpen, setIsEditFamilyOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [isDeleteFamilyOpen, setIsDeleteFamilyOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Edit Family Form State
  const [familyForm, setFamilyForm] = useState<{
    house_name: string;
    house_name_ml: string;
    door_number: string;
    address: string;
    ward_id: string;
    pirivu_amount: number;
    is_nri_household: boolean;
    notes: string;
    status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  }>({
    house_name: '',
    house_name_ml: '',
    door_number: '',
    address: '',
    ward_id: '',
    pirivu_amount: 0,
    is_nri_household: false,
    notes: '',
    status: 'ACTIVE',
  });

  // Member Form State
  const [memberForm, setMemberForm] = useState<{
    name: string;
    name_ml: string;
    gender: 'M' | 'F';
    date_of_birth: string;
    relationship_to_head:
      | 'HEAD'
      | 'SPOUSE'
      | 'SON'
      | 'DAUGHTER'
      | 'FATHER'
      | 'MOTHER'
      | 'SIBLING'
      | 'OTHER';
    phone: string;
    blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
    occupation: string;
    is_nri: boolean;
    nri_country: string;
    notes: string;
  }>({
    name: '',
    name_ml: '',
    gender: 'M',
    date_of_birth: '',
    relationship_to_head: 'OTHER',
    phone: '',
    blood_group: '',
    occupation: '',
    is_nri: false,
    nri_country: '',
    notes: '',
  });

  // Delete Member Form State
  const [deleteMemberStatus, setDeleteMemberStatus] = useState<
    'INACTIVE' | 'TRANSFERRED' | 'DECEASED'
  >('INACTIVE');

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadFamily = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await familiesApi.get(id);
      if (res.data) {
        setFamily(res.data);
        setFamilyForm({
          house_name: res.data.house_name,
          house_name_ml: res.data.house_name_ml ?? '',
          door_number: res.data.door_number ?? '',
          address: res.data.address ?? '',
          ward_id: res.data.ward_id ?? '',
          pirivu_amount: parseFloat(res.data.pirivu_amount || '0'),
          is_nri_household: res.data.is_nri_household ?? false,
          notes: res.data.notes ?? '',
          status: res.data.status,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load family');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadFamily();
    wardsApi.list().then((res) => {
      if (res.data) setWards(res.data);
    });
  }, [loadFamily]);

  // Handle Edit Family
  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setActionError(null);
    try {
      const dto: UpdateFamilyDto = {
        house_name: familyForm.house_name.trim(),
        house_name_ml: familyForm.house_name_ml.trim() || null,
        door_number: familyForm.door_number.trim() || null,
        address: familyForm.address.trim() || null,
        ward_id: familyForm.ward_id || null,
        pirivu_amount: Number(familyForm.pirivu_amount) || 0,
        is_nri_household: familyForm.is_nri_household,
        notes: familyForm.notes.trim() || null,
        status: familyForm.status,
      };

      await familiesApi.update(id, dto);
      setIsEditFamilyOpen(false);
      loadFamily();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update family');
    } finally {
      setSaving(false);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !memberForm.name.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      const dto: CreateMemberDto = {
        family_id: id,
        name: memberForm.name.trim(),
        name_ml: memberForm.name_ml.trim() || null,
        gender: memberForm.gender,
        date_of_birth: memberForm.date_of_birth || null,
        relationship_to_head: memberForm.relationship_to_head,
        phone: memberForm.phone.trim() || null,
        blood_group: memberForm.blood_group || null,
        occupation: memberForm.occupation.trim() || null,
        is_nri: memberForm.is_nri,
        nri_country: memberForm.nri_country.trim() || null,
        notes: memberForm.notes.trim() || null,
      };

      await membersApi.create(dto);
      setIsAddMemberOpen(false);
      resetMemberForm();
      loadFamily();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  // Handle Update Member
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSaving(true);
    setActionError(null);
    try {
      const dto: UpdateMemberDto = {
        name: memberForm.name.trim(),
        name_ml: memberForm.name_ml.trim() || null,
        gender: memberForm.gender,
        date_of_birth: memberForm.date_of_birth || null,
        relationship_to_head: memberForm.relationship_to_head,
        phone: memberForm.phone.trim() || null,
        blood_group: memberForm.blood_group || null,
        occupation: memberForm.occupation.trim() || null,
        is_nri: memberForm.is_nri,
        nri_country: memberForm.nri_country.trim() || null,
        notes: memberForm.notes.trim() || null,
      };

      await membersApi.update(selectedMember.id, dto);
      setIsEditMemberOpen(false);
      setSelectedMember(null);
      resetMemberForm();
      loadFamily();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setSaving(false);
    }
  };

  // Handle Set Head
  const handleSetHead = async (memberId: string) => {
    try {
      await membersApi.setHead(memberId);
      loadFamily();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to set head');
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setSaving(true);
    try {
      await membersApi.delete(selectedMember.id, { status: deleteMemberStatus });
      setIsDeleteMemberOpen(false);
      setSelectedMember(null);
      loadFamily();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to change member status');
    } finally {
      setSaving(false);
    }
  };

  // Handle Deactivate Family
  const handleDeleteFamily = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await familiesApi.delete(id);
      setIsDeleteFamilyOpen(false);
      router.push('/admin/families');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate family');
    } finally {
      setSaving(false);
    }
  };

  const openEditMemberModal = (m: FamilyMember) => {
    setSelectedMember(m);
    setMemberForm({
      name: m.name,
      name_ml: m.name_ml ?? '',
      gender: m.gender ?? 'M',
      date_of_birth: m.date_of_birth ? String(m.date_of_birth).substring(0, 10) : '',
      relationship_to_head: (m.relationship_to_head as typeof memberForm.relationship_to_head) || 'OTHER',
      phone: m.phone ?? '',
      blood_group: (m.blood_group as typeof memberForm.blood_group) || '',
      occupation: m.occupation ?? '',
      is_nri: m.is_nri ?? false,
      nri_country: m.nri_country ?? '',
      notes: m.notes ?? '',
    });
    setActionError(null);
    setIsEditMemberOpen(true);
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      name_ml: '',
      gender: 'M',
      date_of_birth: '',
      relationship_to_head: 'OTHER',
      phone: '',
      blood_group: '',
      occupation: '',
      is_nri: false,
      nri_country: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-gray-500">
        <IconRefresh className="w-7 h-7 animate-spin mx-auto text-emerald-600 mb-3" />
        Loading family details...
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="py-20 text-center text-sm text-red-600">
        <IconAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-base">{error || 'Family not found'}</p>
        <Link
          href="/admin/families"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 bg-emerald-600 text-white rounded-lg"
        >
          <IconArrowLeft className="w-4 h-4" /> Back to Families
        </Link>
      </div>
    );
  }

  const activeMembers = family.members.filter((m) => m.status === 'ACTIVE');
  const nriMembers = family.members.filter((m) => m.is_nri);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/families"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 transition"
        >
          <IconArrowLeft className="w-4 h-4" />
          <span>Back to Families Registry</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActionError(null);
              setIsEditFamilyOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <IconEdit className="w-3.5 h-3.5 text-gray-500" />
            Edit Family
          </button>
          <button
            onClick={() => setIsDeleteFamilyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg transition"
          >
            <IconTrash className="w-3.5 h-3.5" />
            Deactivate
          </button>
        </div>
      </div>

      {/* Main Family Banner Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl border border-emerald-200 flex-shrink-0">
              #{family.family_number}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{family.house_name}</h1>
                <Badge
                  variant={
                    family.status === 'ACTIVE'
                      ? 'success'
                      : family.status === 'TRANSFERRED'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {family.status}
                </Badge>
                {family.is_nri_household && (
                  <Badge variant="primary">NRI Household</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                {family.ward && (
                  <span>
                    <strong className="text-gray-700">Ward:</strong>{' '}
                    {family.ward.ward_number ? `${family.ward.ward_number} - ` : ''}
                    {family.ward.name}
                  </span>
                )}
                {family.door_number && (
                  <span>
                    <strong className="text-gray-700">Door #:</strong> {family.door_number}
                  </span>
                )}
                {family.address && (
                  <span>
                    <strong className="text-gray-700">Address:</strong> {family.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pirivu Quota Badge */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-5 py-3 text-right">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Monthly Pirivu Quota
            </span>
            <span className="text-2xl font-black text-emerald-950">
              ₹{parseFloat(family.pirivu_amount || '0').toLocaleString('en-IN')}
            </span>
            <span className="block text-[10px] text-emerald-600 font-medium">
              Monthly Quota
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-gray-500">Total Members</span>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{family.members.length}</p>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <span className="text-xs text-emerald-700">Active in Mahal</span>
            <p className="text-xl font-bold text-emerald-950 mt-0.5">{activeMembers.length}</p>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-700">NRI Members</span>
            <p className="text-xl font-bold text-blue-950 mt-0.5">{nriMembers.length}</p>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-700">Family Head</span>
            <p className="text-sm font-bold text-amber-950 mt-1 truncate">
              {family.head_member?.name ?? 'Not Set'}
            </p>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Family Members</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {family.members.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">List of registered family members</p>
          </div>

          <button
            onClick={() => {
              resetMemberForm();
              setActionError(null);
              setIsAddMemberOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        {family.members.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <IconUser className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-800">No members added yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              No members added to this household yet
            </p>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
            >
              <IconPlus className="w-3.5 h-3.5" /> Add First Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Member Name</th>
                  <th className="px-5 py-3">Relationship</th>
                  <th className="px-5 py-3">Gender / Age</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Blood Group</th>
                  <th className="px-5 py-3">Occupation / NRI</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {family.members.map((member) => {
                  const isHead =
                    member.id === family.head_member_id || member.relationship_to_head === 'HEAD';

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-emerald-50/30 transition ${
                        isHead ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isHead && (
                            <span
                              title="Head of Family"
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded"
                            >
                              <IconCrown className="w-3 h-3 text-amber-600" /> HEAD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Relationship */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {member.relationship_to_head ?? 'OTHER'}
                        </span>
                      </td>

                      {/* Gender / Age */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                        <span className="font-medium text-gray-800">
                          {member.gender === 'M' ? 'Male' : member.gender === 'F' ? 'Female' : '-'}
                        </span>
                        {member.date_of_birth && (
                          <span className="text-gray-400 block text-[11px]">
                            DOB: {String(member.date_of_birth).substring(0, 10)}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                        {member.phone ? (
                          <a
                            href={`tel:${member.phone}`}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                          >
                            <IconPhone className="w-3 h-3" />
                            {member.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Blood Group */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {member.blood_group ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                            {member.blood_group}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Occupation / NRI */}
                      <td className="px-5 py-3.5 text-xs">
                        <div>{member.occupation || '-'}</div>
                        {member.is_nri && (
                          <Badge variant="primary" size="sm" className="mt-0.5">
                            NRI {member.nri_country ? `(${member.nri_country})` : ''}
                          </Badge>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <Badge
                          variant={
                            member.status === 'ACTIVE'
                              ? 'success'
                              : member.status === 'DECEASED'
                              ? 'danger'
                              : member.status === 'TRANSFERRED'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {member.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isHead && member.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleSetHead(member.id)}
                              title="Set as Head of Family"
                              className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition"
                            >
                              Make Head
                            </button>
                          )}
                          <button
                            onClick={() => openEditMemberModal(member)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                            title="Edit Member"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setDeleteMemberStatus('INACTIVE');
                              setIsDeleteMemberOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Change Status / Remove"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Family Modal */}
      <Modal
        isOpen={isEditFamilyOpen}
        onClose={() => setIsEditFamilyOpen(false)}
        title="Edit Family Details"
        subtitle="Update family details and contact info"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateFamily} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                House Name (English) *
              </label>
              <input
                type="text"
                required
                value={familyForm.house_name}
                onChange={(e) => setFamilyForm({ ...familyForm, house_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Regional House Name
              </label>
              <input
                type="text"
                value={familyForm.house_name_ml}
                onChange={(e) => setFamilyForm({ ...familyForm, house_name_ml: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ward</label>
              <select
                value={familyForm.ward_id}
                onChange={(e) => setFamilyForm({ ...familyForm, ward_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="">Select Ward</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.ward_number ? `${w.ward_number} - ` : ''}
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Door / Bldg #</label>
              <input
                type="text"
                value={familyForm.door_number}
                onChange={(e) => setFamilyForm({ ...familyForm, door_number: e.target.value })}
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
                value={familyForm.pirivu_amount}
                onChange={(e) =>
                  setFamilyForm({
                    ...familyForm,
                    pirivu_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Address</label>
            <textarea
              rows={2}
              value={familyForm.address}
              onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={familyForm.status}
                onChange={(e) =>
                  setFamilyForm({
                    ...familyForm,
                    status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED',
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyForm.is_nri_household}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, is_nri_household: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                NRI Household
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={familyForm.notes}
              onChange={(e) => setFamilyForm({ ...familyForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditFamilyOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddMemberOpen || isEditMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setIsEditMemberOpen(false);
          setSelectedMember(null);
        }}
        title={isEditMemberOpen ? 'Edit Member Details' : 'Add Family Member'}
        subtitle={
          isEditMemberOpen
            ? 'Update member details'
            : 'Add a new family member'
        }
        maxWidth="lg"
      >
        <form onSubmit={isEditMemberOpen ? handleUpdateMember : handleAddMember} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fatima Zahra"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Regional Member Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mohammed Ali"
                value={memberForm.name_ml}
                onChange={(e) => setMemberForm({ ...memberForm, name_ml: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={memberForm.gender}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, gender: e.target.value as 'M' | 'F' })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship to Head *
              </label>
              <select
                value={memberForm.relationship_to_head}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    relationship_to_head: e.target
                      .value as typeof memberForm.relationship_to_head,
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="HEAD">HEAD</option>
                <option value="SPOUSE">SPOUSE</option>
                <option value="SON">SON</option>
                <option value="DAUGHTER">DAUGHTER</option>
                <option value="FATHER">FATHER</option>
                <option value="MOTHER">MOTHER</option>
                <option value="SIBLING">SIBLING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={memberForm.date_of_birth}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, date_of_birth: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+919846012345"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
              <select
                value={memberForm.blood_group}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    blood_group: e.target.value as typeof memberForm.blood_group,
                  })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                placeholder="e.g. Student / Software Engineer"
                value={memberForm.occupation}
                onChange={(e) => setMemberForm({ ...memberForm, occupation: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NRI Country</label>
              <input
                type="text"
                disabled={!memberForm.is_nri}
                placeholder="e.g. UAE / Saudi Arabia"
                value={memberForm.nri_country}
                onChange={(e) => setMemberForm({ ...memberForm, nri_country: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_nri_member"
              checked={memberForm.is_nri}
              onChange={(e) => setMemberForm({ ...memberForm, is_nri: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="is_nri_member" className="text-xs font-medium text-gray-700 cursor-pointer">
              Is NRI
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={memberForm.notes}
              onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsAddMemberOpen(false);
                setIsEditMemberOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              {saving ? 'Saving...' : isEditMemberOpen ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Change Status Member Modal */}
      <Modal
        isOpen={isDeleteMemberOpen}
        onClose={() => setIsDeleteMemberOpen(false)}
        title="Update Member Status"
        subtitle="Change member status or mark deceased / moved"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Change status for <strong className="text-gray-900">{selectedMember?.name}</strong>:
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="memberStatus"
                value="INACTIVE"
                checked={deleteMemberStatus === 'INACTIVE'}
                onChange={() => setDeleteMemberStatus('INACTIVE')}
                className="text-emerald-600"
              />
              <div>
                <span className="text-xs font-semibold text-gray-800 block">INACTIVE</span>
                <span className="text-[11px] text-gray-500">Inactive Member</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="memberStatus"
                value="TRANSFERRED"
                checked={deleteMemberStatus === 'TRANSFERRED'}
                onChange={() => setDeleteMemberStatus('TRANSFERRED')}
                className="text-emerald-600"
              />
              <div>
                <span className="text-xs font-semibold text-gray-800 block">TRANSFERRED</span>
                <span className="text-[11px] text-gray-500">Transferred to another Mahal</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-50 cursor-pointer">
              <input
                type="radio"
                name="memberStatus"
                value="DECEASED"
                checked={deleteMemberStatus === 'DECEASED'}
                onChange={() => setDeleteMemberStatus('DECEASED')}
                className="text-red-600"
              />
              <div>
                <span className="text-xs font-semibold text-red-800 block">DECEASED</span>
                <span className="text-[11px] text-red-600">Deceased Member</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsDeleteMemberOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteMember}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              {saving ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete / Deactivate Family Modal */}
      <Modal
        isOpen={isDeleteFamilyOpen}
        onClose={() => setIsDeleteFamilyOpen(false)}
        title="Deactivate Family"
        subtitle="Deactivate family and mark records as inactive"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs leading-relaxed">
            Are you sure you want to mark <strong>{family.house_name}</strong> (Family #{family.family_number}) and all active members as <strong>INACTIVE</strong>?
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsDeleteFamilyOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteFamily}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              {saving ? 'Deactivating...' : 'Confirm Deactivation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
