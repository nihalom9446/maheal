'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { familiesApi, wardsApi, membersApi } from '../../lib/api';
import { IconFamily, IconWard, IconUser, IconFinance, IconPlus, IconChevronRight } from '../../components/ui/icons';

export default function AdminDashboardPage() {
  const [familyCount, setFamilyCount] = useState<number>(0);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [wardCount, setWardCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [familiesRes, membersRes, wardsRes] = await Promise.allSettled([
          familiesApi.list({ limit: 1 }),
          membersApi.list({ limit: 1 }),
          wardsApi.list(),
        ]);

        if (familiesRes.status === 'fulfilled' && familiesRes.value.data) {
          setFamilyCount(familiesRes.value.data.meta.total);
        }
        if (membersRes.status === 'fulfilled' && membersRes.value.data) {
          setMemberCount(membersRes.value.data.meta.total);
        }
        if (wardsRes.status === 'fulfilled' && wardsRes.value.data) {
          setWardCount(wardsRes.value.data.length);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Mahal Administration &amp; Operations Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/families"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Manage Families</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Families */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Families
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : familyCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Registered Households
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IconFamily className="w-6 h-6" />
          </div>
        </div>

        {/* Members */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Members
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : memberCount}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              Community Population
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <IconUser className="w-6 h-6" />
          </div>
        </div>

        {/* Wards */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Wards
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : wardCount}
            </p>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">
              Administrative Wards
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <IconWard className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Pirivu */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pirivu Module
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              Active
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Monthly Contributions
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <IconFinance className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Family &amp; Member Registry</h2>
              <p className="text-xs text-gray-500">Comprehensive Household Records</p>
            </div>
            <Link
              href="/admin/families"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Manage Mahal household records, family members, NRI tracking, and monthly pirivu quotas with auto-assigned family numbers and Malayalam support.
          </p>
          <div className="flex gap-3">
            <Link
              href="/admin/families"
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition"
            >
              Browse Families
            </Link>
            <Link
              href="/admin/wards"
              className="px-3.5 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-lg transition"
            >
              Manage Wards
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Wards Organization</h2>
              <p className="text-xs text-gray-500">Ward Governance &amp; Conveners</p>
            </div>
            <Link
              href="/admin/wards"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View Wards <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Organize the Mahal community into administrative wards, assign ward conveners, track ward population and household distributions.
          </p>
          <div className="flex gap-3">
            <Link
              href="/admin/wards"
              className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-lg transition"
            >
              Ward Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
