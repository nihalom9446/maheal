'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { madrasaApi, membersApi } from '@/lib/api';
import type {
  MadrasaTeacherItem,
  MadrasaTeacherDesignation,
  MadrasaTeacherStatus,
  TeacherFilterDto,
  CreateTeacherDto,
  UpdateTeacherDto,
  MemberListItem,
} from '@maheall/shared';
import { Modal } from '@/components/ui/modal';
import {
  IconSearch,
  IconPlus,
  IconUser,
  IconRefresh,
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconPhone,
  IconCrown,
} from '@/components/ui/icons';

const CLASS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MadrasaTeachersPage() {
  const [teachers, setTeachers] = useState<MadrasaTeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDesignation, setSelectedDesignation] = useState<MadrasaTeacherDesignation | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<MadrasaTeacherStatus | 'ALL'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add Teacher Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [searchedMembers, setSearchedMembers] = useState<MemberListItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null);
  const [addDesignation, setAddDesignation] = useState<MadrasaTeacherDesignation>('MUALLIM');
  const [addClasses, setAddClasses] = useState<number[]>([1]);
  const [addSalary, setAddSalary] = useState<number>(12000);
  const [addJoiningDate, setAddJoiningDate] = useState(new Date().toISOString().substring(0, 10));
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Teacher Modal
  const [editingTeacher, setEditingTeacher] = useState<MadrasaTeacherItem | null>(null);
  const [editDesignation, setEditDesignation] = useState<MadrasaTeacherDesignation>('MUALLIM');
  const [editClasses, setEditClasses] = useState<number[]>([]);
  const [editSalary, setEditSalary] = useState<number>(12000);
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editStatus, setEditStatus] = useState<MadrasaTeacherStatus>('ACTIVE');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Deactivate Modal
  const [deactivatingTeacher, setDeactivatingTeacher] = useState<MadrasaTeacherItem | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: TeacherFilterDto = {
        page,
        limit: 15,
        ...(selectedDesignation !== 'ALL' ? { designation: selectedDesignation } : {}),
        ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await madrasaApi.listTeachers(params);
      if (res.success && res.data) {
        setTeachers(res.data.items);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      } else {
        setTeachers([]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedDesignation, selectedStatus, search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Search Members for Teacher Creation
  useEffect(() => {
    if (!memberSearch.trim() || memberSearch.length < 2) {
      setSearchedMembers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await membersApi.list({ search: memberSearch.trim(), limit: 8 });
        if (res.success && res.data) {
          setSearchedMembers(res.data.items || []);
        }
      } catch {
        // silent error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearch]);

  const toggleAddClass = (lvl: number) => {
    setAddClasses((prev) =>
      prev.includes(lvl) ? prev.filter((c) => c !== lvl) : [...prev, lvl].sort((a, b) => a - b),
    );
  };

  const toggleEditClass = (lvl: number) => {
    setEditClasses((prev) =>
      prev.includes(lvl) ? prev.filter((c) => c !== lvl) : [...prev, lvl].sort((a, b) => a - b),
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setAddError('Please select a member to register as teacher.');
      return;
    }
    if (addClasses.length === 0) {
      setAddError('Please assign at least one class to the teacher.');
      return;
    }

    try {
      setAddLoading(true);
      setAddError(null);

      const dto: CreateTeacherDto = {
        member_id: selectedMember.id,
        designation: addDesignation,
        classes_assigned: addClasses,
        monthly_salary: addSalary,
        joining_date: addJoiningDate,
      };

      await madrasaApi.createTeacher(dto);
      setShowAddModal(false);
      setSelectedMember(null);
      setMemberSearch('');
      setAddClasses([1]);
      fetchTeachers();
    } catch (err: unknown) {
      const e = err as Error;
      setAddError(e.message || 'Failed to add Madrasa teacher.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEdit = (t: MadrasaTeacherItem) => {
    setEditingTeacher(t);
    setEditDesignation(t.designation);
    setEditClasses(t.classes_assigned || []);
    setEditSalary(t.monthly_salary);
    setEditJoiningDate(t.joining_date);
    setEditStatus(t.status);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (editClasses.length === 0) {
      setEditError('Please assign at least one class.');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);

      const dto: UpdateTeacherDto = {
        designation: editDesignation,
        classes_assigned: editClasses,
        monthly_salary: editSalary,
        joining_date: editJoiningDate,
        status: editStatus,
      };

      await madrasaApi.updateTeacher(editingTeacher.id, dto);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err: unknown) {
      const e = err as Error;
      setEditError(e.message || 'Failed to update teacher.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingTeacher) return;

    try {
      setDeactivating(true);
      await madrasaApi.deleteTeacher(deactivatingTeacher.id);
      setDeactivatingTeacher(null);
      fetchTeachers();
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message || 'Failed to deactivate teacher.');
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Muallims & Staff Directory</h1>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
              {totalCount} Muallims
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Madrasa teachers directory • Sadar Muallim, teachers, salary and assigned standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeachers}
            className="p-2 text-gray-600 hover:text-amber-700 bg-white hover:bg-amber-50 border border-gray-200 rounded-lg transition"
            title="Refresh Data"
          >
            <IconRefresh className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setAddError(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add New Muallim</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search teacher name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Designation Filter */}
            <select
              value={selectedDesignation}
              onChange={(e) => {
                setSelectedDesignation(e.target.value as MadrasaTeacherDesignation | 'ALL');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="ALL">All Designations</option>
              <option value="SADAR_MUALLIM">Sadar Muallim</option>
              <option value="MUALLIM">Muallim</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as MadrasaTeacherStatus | 'ALL');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Muallim / Teacher</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Assigned Standards</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Loading muallim staff directory...
                  </td>
                </tr>
              ) : teachers.length > 0 ? (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-amber-50/30 transition">
                    {/* Teacher Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{t.teacher_name}</div>
                      {t.teacher_name_ml && (
                        <div className="text-xs text-gray-500 font-gayathri">{t.teacher_name_ml}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5">
                        House: {t.house_name || 'N/A'} • Phone: {t.phone || 'N/A'}
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.designation === 'SADAR_MUALLIM' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Sadar Muallim
                        </span>
                      )}
                      {t.designation === 'MUALLIM' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Muallim
                        </span>
                      )}
                      {t.designation === 'ASSISTANT' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Assistant
                        </span>
                      )}
                    </td>

                    {/* Classes Assigned */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.classes_assigned && t.classes_assigned.length > 0 ? (
                          t.classes_assigned.map((cls) => (
                            <span
                              key={cls}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded"
                            >
                              Std {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">None</span>
                        )}
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-gray-800">
                      ₹{t.monthly_salary.toLocaleString('en-IN')}/mo
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-gray-600">
                      {t.joining_date}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Muallim"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        {t.status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeactivatingTeacher(t)}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Deactivate Muallim"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <IconUser className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No teachers found</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add Usthad staff to assign classes.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Muallim / Teacher"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 -mt-2">
            Register a new teacher to Madrasa staff • Class assignments and monthly salary
          </p>

          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          {/* Member lookup */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Search Family Member <span className="text-red-500">*</span>
            </label>
            {selectedMember ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900">{selectedMember.name}</div>
                  <div className="text-xs text-amber-700">
                    House: {selectedMember.family?.house_name || 'N/A'} • Phone: {selectedMember.phone || 'N/A'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-1 relative">
                <input
                  type="text"
                  placeholder="Type name or phone to search..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchedMembers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {searchedMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(m);
                          setSearchedMembers([]);
                          setMemberSearch('');
                        }}
                        className="w-full p-2.5 text-left hover:bg-amber-50 flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{m.name}</span>
                          <span className="text-gray-500 ml-1">({m.family?.house_name || 'Family'})</span>
                        </div>
                        <span className="text-amber-700 font-semibold">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              2. Designation
            </label>
            <select
              value={addDesignation}
              onChange={(e) => setAddDesignation(e.target.value as MadrasaTeacherDesignation)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="SADAR_MUALLIM">Sadar Muallim (Headmaster)</option>
              <option value="MUALLIM">Muallim (Teacher)</option>
              <option value="ASSISTANT">Assistant</option>
            </select>
          </div>

          {/* Assigned Classes Multi-check */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              3. Assign Classes (1 to 10) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CLASS_LEVELS.map((lvl) => {
                const checked = addClasses.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleAddClass(lvl)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                      checked
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                  >
                    Std {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Salary */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                4. Monthly Salary (₹)
              </label>
              <input
                type="number"
                min="1"
                value={addSalary}
                onChange={(e) => setAddSalary(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                5. Joining Date
              </label>
              <input
                type="date"
                value={addJoiningDate}
                onChange={(e) => setAddJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading || !selectedMember || addClasses.length === 0}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {addLoading ? 'Registering...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <Modal
          isOpen={Boolean(editingTeacher)}
          onClose={() => setEditingTeacher(null)}
          title={`Edit Muallim: ${editingTeacher.teacher_name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <select
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value as MadrasaTeacherDesignation)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="SADAR_MUALLIM">SADAR_MUALLIM</option>
                  <option value="MUALLIM">MUALLIM</option>
                  <option value="ASSISTANT">ASSISTANT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MadrasaTeacherStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Assigned Classes (1-10)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CLASS_LEVELS.map((lvl) => {
                  const checked = editClasses.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleEditClass(lvl)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                        checked
                          ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
                      }`}
                    >
                      Std {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editSalary}
                  onChange={(e) => setEditSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={editJoiningDate}
                  onChange={(e) => setEditJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivatingTeacher && (
        <Modal
          isOpen={Boolean(deactivatingTeacher)}
          onClose={() => setDeactivatingTeacher(null)}
          title="Deactivate Muallim"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to deactivate <span className="font-bold text-gray-900">{deactivatingTeacher.teacher_name}</span> from
              active Madrasa duties?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeactivatingTeacher(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deactivating}
                onClick={handleDeactivate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {deactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
