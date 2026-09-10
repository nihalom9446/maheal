'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { madrasaApi, membersApi } from '@/lib/api';
import type {
  MadrasaStudentItem,
  MadrasaStudentDetail,
  MadrasaFeeCategory,
  MadrasaStudentStatus,
  StudentFilterDto,
  EnrollStudentDto,
  UpdateStudentDto,
  MemberListItem,
} from '@maheall/shared';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  IconSearch,
  IconPlus,
  IconUser,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconEye,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCash,
  IconCheckCircle,
} from '@/components/ui/icons';

const CLASS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function MadrasaStudentsContent() {
  const searchParams = useSearchParams();
  const initialClass = searchParams.get('class') ? parseInt(searchParams.get('class')!, 10) : undefined;
  const initialAction = searchParams.get('action');

  const [students, setStudents] = useState<MadrasaStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>(initialClass || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<MadrasaStudentStatus | 'ALL'>('ACTIVE');
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<MadrasaFeeCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Enroll Modal
  const [showEnrollModal, setShowEnrollModal] = useState(initialAction === 'enroll');
  const [enrollMemberSearch, setEnrollMemberSearch] = useState('');
  const [searchedMembers, setSearchedMembers] = useState<MemberListItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null);
  const [enrollClassLevel, setEnrollClassLevel] = useState<number>(1);
  const [enrollBoardAdmission, setEnrollBoardAdmission] = useState('');
  const [enrollEnrollmentDate, setEnrollEnrollmentDate] = useState(new Date().toISOString().substring(0, 10));
  const [enrollFeeCategory, setEnrollFeeCategory] = useState<MadrasaFeeCategory>('FULL');
  const [enrollMonthlyFee, setEnrollMonthlyFee] = useState<number>(250);
  const [enrollParentConsent, setEnrollParentConsent] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // View Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<MadrasaStudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit Modal
  const [editingStudent, setEditingStudent] = useState<MadrasaStudentItem | null>(null);
  const [editClassLevel, setEditClassLevel] = useState<number>(1);
  const [editBoardAdmission, setEditBoardAdmission] = useState('');
  const [editFeeCategory, setEditFeeCategory] = useState<MadrasaFeeCategory>('FULL');
  const [editMonthlyFee, setEditMonthlyFee] = useState<number>(250);
  const [editStatus, setEditStatus] = useState<MadrasaStudentStatus>('ACTIVE');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Inactivate Modal
  const [deletingStudent, setDeletingStudent] = useState<MadrasaStudentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: StudentFilterDto = {
        page,
        limit: 15,
        ...(selectedClass !== 'ALL' ? { class_level: selectedClass } : {}),
        ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
        ...(selectedFeeCategory !== 'ALL' ? { fee_category: selectedFeeCategory } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await madrasaApi.listStudents(params);
      if (res.success && res.data) {
        setStudents(res.data.items);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      } else {
        setStudents([]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedClass, selectedStatus, selectedFeeCategory, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Search Members for Enrollment
  useEffect(() => {
    if (!enrollMemberSearch.trim() || enrollMemberSearch.length < 2) {
      setSearchedMembers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await membersApi.list({ search: enrollMemberSearch.trim(), limit: 8 });
        if (res.success && res.data) {
          setSearchedMembers(res.data.items || []);
        }
      } catch {
        // silent search error
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [enrollMemberSearch]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setEnrollError('Please select a family member to enroll.');
      return;
    }
    if (!enrollParentConsent) {
      setEnrollError('Parental consent must be explicitly confirmed under DPDPA 2023 compliance.');
      return;
    }

    try {
      setEnrollLoading(true);
      setEnrollError(null);

      const dto: EnrollStudentDto = {
        member_id: selectedMember.id,
        board_admission_number: enrollBoardAdmission.trim() || null,
        class_level: enrollClassLevel,
        enrollment_date: enrollEnrollmentDate,
        fee_category: enrollFeeCategory,
        monthly_fee: enrollMonthlyFee,
        parent_consent_confirmed: true,
      };

      await madrasaApi.enrollStudent(dto);
      setShowEnrollModal(false);
      setSelectedMember(null);
      setEnrollMemberSearch('');
      setEnrollBoardAdmission('');
      setEnrollParentConsent(false);
      fetchStudents();
    } catch (err: unknown) {
      const e = err as Error;
      setEnrollError(e.message || 'Failed to enroll student in Madrasa.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleViewDetail = async (studentId: string) => {
    try {
      setDetailLoading(true);
      const res = await madrasaApi.getStudent(studentId);
      if (res.success && res.data) {
        setSelectedStudentDetail(res.data);
      }
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message || 'Failed to load student details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenEdit = (student: MadrasaStudentItem) => {
    setEditingStudent(student);
    setEditClassLevel(student.class_level);
    setEditBoardAdmission(student.board_admission_number || '');
    setEditFeeCategory(student.fee_category);
    setEditMonthlyFee(student.monthly_fee);
    setEditStatus(student.status);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setEditLoading(true);
      setEditError(null);

      const dto: UpdateStudentDto = {
        class_level: editClassLevel,
        board_admission_number: editBoardAdmission.trim() || null,
        fee_category: editFeeCategory,
        monthly_fee: editMonthlyFee,
        status: editStatus,
      };

      await madrasaApi.updateStudent(editingStudent.id, dto);
      setEditingStudent(null);
      fetchStudents();
    } catch (err: unknown) {
      const e = err as Error;
      setEditError(e.message || 'Failed to update student details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    try {
      setDeleting(true);
      await madrasaApi.deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
      fetchStudents();
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message || 'Failed to inactivate student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Madrasa Students Register</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {totalCount} Students
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Madrasa student register • Standards 1 through 10 admissions, fee categories, and DPDPA consent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            className="p-2 text-gray-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-gray-200 rounded-lg transition"
            title="Refresh Data"
          >
            <IconRefresh className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowEnrollModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Enroll Student</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student or admission #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Standard Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Classes (Std 1 - 10)</option>
              {CLASS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Standard {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Category */}
          <div>
            <select
              value={selectedFeeCategory}
              onChange={(e) => {
                setSelectedFeeCategory(e.target.value as MadrasaFeeCategory | 'ALL');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Fee Categories</option>
              <option value="FULL">Full Fee</option>
              <option value="CONCESSION">Concession</option>
              <option value="EXEMPT">Exempt / Free</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as MadrasaStudentStatus | 'ALL');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Student & Family</th>
                <th className="py-3.5 px-4">Admission No</th>
                <th className="py-3.5 px-4">Fee Category</th>
                <th className="py-3.5 px-4">Monthly Fee</th>
                <th className="py-3.5 px-4">DPDPA Consent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    {/* Class */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                        {student.class_level}
                      </span>
                    </td>

                    {/* Student & Family */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{student.student_name}</div>
                      {student.student_name_ml && (
                        <div className="text-xs text-gray-500 font-gayathri">{student.student_name_ml}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5">
                        {student.house_name} • Ward: {student.ward_name || 'N/A'} • Parent: {student.parent_name || 'N/A'}
                        {student.parent_phone ? ` (${student.parent_phone})` : ''}
                      </div>
                    </td>

                    {/* Admission No */}
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap font-mono text-xs">
                      {student.board_admission_number || '—'}
                    </td>

                    {/* Fee Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {student.fee_category === 'FULL' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Full Fee
                        </span>
                      )}
                      {student.fee_category === 'CONCESSION' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Concession
                        </span>
                      )}
                      {student.fee_category === 'EXEMPT' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Exempt (Free)
                        </span>
                      )}
                    </td>

                    {/* Monthly Fee */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-gray-800">
                      ₹{student.monthly_fee}
                    </td>

                    {/* DPDPA Consent */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {student.parent_consent_confirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>DPDPA Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <IconX className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {student.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                      {student.status === 'INACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                          Inactive
                        </span>
                      )}
                      {student.status === 'GRADUATED' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Graduated
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(student.id)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="View Student Detail & Attendance"
                        >
                          <IconEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Student"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        {student.status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Deactivate Student"
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
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <IconUser className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No students found</p>
                    <p className="text-xs text-gray-500 mt-0.5">Try adjusting your filters or enroll a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Enroll Student in Madrasa"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 -mt-2">
            Admit a new student into the Madrasa registry under DPDPA 2023 compliance guidelines
          </p>

          {enrollError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{enrollError}</span>
            </div>
          )}

          {/* Member lookup */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Search Family Member <span className="text-red-500">*</span>
            </label>
            {selectedMember ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">{selectedMember.name}</div>
                  <div className="text-xs text-emerald-700">
                    House: {selectedMember.family?.house_name || 'N/A'} • Gender: {selectedMember.gender || 'N/A'} • DOB:{' '}
                    {selectedMember.date_of_birth || 'N/A'}
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
                  placeholder="Type name or phone to search member..."
                  value={enrollMemberSearch}
                  onChange={(e) => setEnrollMemberSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          setEnrollMemberSearch('');
                        }}
                        className="w-full p-2.5 text-left hover:bg-emerald-50 flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{m.name}</span>
                          <span className="text-gray-500 ml-1">({m.family?.house_name || 'Family'})</span>
                        </div>
                        <span className="text-emerald-700 font-semibold">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Class Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                2. Class / Standard <span className="text-red-500">*</span>
              </label>
              <select
                value={enrollClassLevel}
                onChange={(e) => setEnrollClassLevel(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CLASS_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Standard {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Board Admission Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                3. Board Reg / Admission No
              </label>
              <input
                type="text"
                placeholder="e.g. SKIMVB-2026-0042"
                value={enrollBoardAdmission}
                onChange={(e) => setEnrollBoardAdmission(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Enrollment Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                4. Enrollment Date
              </label>
              <input
                type="date"
                value={enrollEnrollmentDate}
                onChange={(e) => setEnrollEnrollmentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Fee Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                5. Fee Category
              </label>
              <select
                value={enrollFeeCategory}
                onChange={(e) => {
                  const cat = e.target.value as MadrasaFeeCategory;
                  setEnrollFeeCategory(cat);
                  if (cat === 'EXEMPT') setEnrollMonthlyFee(0);
                  else if (cat === 'CONCESSION') setEnrollMonthlyFee(150);
                  else setEnrollMonthlyFee(250);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="FULL">Full Fee</option>
                <option value="CONCESSION">Concession</option>
                <option value="EXEMPT">Exempt (Free)</option>
              </select>
            </div>

            {/* Monthly Fee */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                6. Monthly Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={enrollMonthlyFee}
                onChange={(e) => setEnrollMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* DPDPA 2023 Parental Consent Box */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="dpdpa_consent"
                checked={enrollParentConsent}
                onChange={(e) => setEnrollParentConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                required
              />
              <label htmlFor="dpdpa_consent" className="text-xs text-gray-800 font-medium leading-relaxed">
                <span className="font-bold text-emerald-900 block">
                  DPDPA 2023 Parental Consent Confirmation
                </span>
                I confirm that the parent / guardian has granted verifiable consent for enrolling this minor student into
                the Madrasa register, processing attendance records, and collecting fees in accordance with the Digital
                Personal Data Protection Act 2023.
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowEnrollModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enrollLoading || !enrollParentConsent || !selectedMember}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {enrollLoading ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Detail Modal */}
      {selectedStudentDetail && (
        <Modal
          isOpen={Boolean(selectedStudentDetail)}
          onClose={() => setSelectedStudentDetail(null)}
          title={`Student Profile: ${selectedStudentDetail.student_name}`}
        >
          <div className="space-y-5">
            {/* Header profile card */}
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{selectedStudentDetail.student_name}</h3>
                {selectedStudentDetail.student_name_ml && (
                  <div className="text-xs text-emerald-200 font-gayathri">{selectedStudentDetail.student_name_ml}</div>
                )}
                <div className="text-xs text-emerald-100 mt-1">
                  Class Standard: <span className="font-bold text-white">{selectedStudentDetail.class_level}</span> •
                  Admission No: {selectedStudentDetail.board_admission_number || 'N/A'}
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                {selectedStudentDetail.status}
              </span>
            </div>

            {/* Attendance KPI */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Working Days</div>
                <div className="text-lg font-bold text-gray-800">
                  {selectedStudentDetail.attendance_stats.total_days}
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium">Present</div>
                <div className="text-lg font-bold text-emerald-800">
                  {selectedStudentDetail.attendance_stats.present_days}
                </div>
              </div>
              <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                <div className="text-xs text-red-700 font-medium">Absent</div>
                <div className="text-lg font-bold text-red-800">
                  {selectedStudentDetail.attendance_stats.absent_days}
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 font-medium">Attendance %</div>
                <div className="text-lg font-bold text-blue-800">
                  {selectedStudentDetail.attendance_stats.percentage}%
                </div>
              </div>
            </div>

            {/* Fee summary & Paid Months */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Fee Category:</span>
                <span className="font-semibold text-gray-900">{selectedStudentDetail.fee_category} (₹{selectedStudentDetail.monthly_fee}/mo)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Total Madrasa Fees Paid:</span>
                <span className="font-bold text-emerald-700">₹{selectedStudentDetail.fee_status.total_paid}</span>
              </div>
              <div className="text-xs pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-700 block mb-1">Paid Months:</span>
                {selectedStudentDetail.fee_status.paid_months.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedStudentDetail.fee_status.paid_months.map((m) => (
                      <span key={m} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[11px] rounded">
                        {m.substring(0, 7)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No payments recorded yet.</span>
                )}
              </div>
            </div>

            {/* Family & Contact */}
            <div className="text-xs space-y-1 text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
              <div>
                <span className="font-bold text-gray-800">House:</span> {selectedStudentDetail.house_name}
              </div>
              <div>
                <span className="font-bold text-gray-800">Parent / Head:</span> {selectedStudentDetail.parent_name || 'N/A'}{' '}
                {selectedStudentDetail.parent_phone ? `(${selectedStudentDetail.parent_phone})` : ''}
              </div>
              <div>
                <span className="font-bold text-gray-800">Ward:</span> {selectedStudentDetail.ward_name || 'N/A'}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.student_name}`}
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
                  Class / Standard
                </label>
                <select
                  value={editClassLevel}
                  onChange={(e) => setEditClassLevel(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {CLASS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Standard {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MadrasaStudentStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="GRADUATED">GRADUATED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Board Reg / Admission Number
              </label>
              <input
                type="text"
                value={editBoardAdmission}
                onChange={(e) => setEditBoardAdmission(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Fee Category
                </label>
                <select
                  value={editFeeCategory}
                  onChange={(e) => setEditFeeCategory(e.target.value as MadrasaFeeCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="FULL">FULL</option>
                  <option value="CONCESSION">CONCESSION</option>
                  <option value="EXEMPT">EXEMPT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Monthly Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editMonthlyFee}
                  onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Inactivate Confirmation Modal */}
      {deletingStudent && (
        <Modal
          isOpen={Boolean(deletingStudent)}
          onClose={() => setDeletingStudent(null)}
          title="Deactivate Student"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to mark <span className="font-bold text-gray-900">{deletingStudent.student_name}</span> as
              inactive in the Madrasa register?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function MadrasaStudentsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Students...</div>}>
      <MadrasaStudentsContent />
    </React.Suspense>
  );
}
