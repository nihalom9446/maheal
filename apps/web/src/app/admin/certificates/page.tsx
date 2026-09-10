'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { certificatesApi } from '@/lib/api';
import type { CertificateItem, CertificateType, CertificateFilterDto } from '@maheall/shared';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  IconSearch,
  IconPlus,
  IconPrinter,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
  IconCertificates,
  IconCheck,
  IconShare,
} from '@/components/ui/icons';

export default function CertificatesPage() {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedType, setSelectedType] = useState<CertificateType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Certificate Dropdown
  const [showIssueMenu, setShowIssueMenu] = useState(false);

  // Revoke Modal State
  const [revokingCert, setRevokingCert] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Copied alert
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: CertificateFilterDto = {
        page,
        limit: 15,
        ...(selectedType !== 'ALL' ? { certificate_type: selectedType } : {}),
        ...(selectedStatus !== 'ALL' ? { status: selectedStatus } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };

      const res = await certificatesApi.list(params);
      if (res.success && res.data) {
        setItems(res.data.items);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      } else {
        setItems([]);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load certificates registry.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedType, selectedStatus, search]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingCert) return;

    if (!revokeReason.trim()) {
      setRevokeError('Please provide a reason for certificate revocation.');
      return;
    }

    try {
      setRevoking(true);
      setRevokeError(null);
      await certificatesApi.revoke(revokingCert.id, { reason: revokeReason.trim() });
      setRevokingCert(null);
      setRevokeReason('');
      fetchCertificates();
    } catch (err: unknown) {
      const e = err as Error;
      setRevokeError(e.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(false);
    }
  };

  const copyVerificationLink = (token: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/verify/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getTypeBadge = (type: CertificateType) => {
    switch (type) {
      case 'NIKAH':
        return (
          <Badge variant="gold" size="sm">
            Nikah
          </Badge>
        );
      case 'NOC':
        return (
          <Badge variant="info" size="sm">
            NOC
          </Badge>
        );
      case 'MEMBERSHIP':
        return (
          <Badge variant="primary" size="sm">
            Membership
          </Badge>
        );
      default:
        return <Badge size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Certificate Registry</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Official Mahal certificates registry — Nikah, NOC, and Membership attestations
          </p>
        </div>

        {/* Issue Certificate Button with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowIssueMenu(!showIssueMenu)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>Issue Certificate</span>
          </button>

          {showIssueMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowIssueMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Select Certificate Type
                </div>
                <Link
                  href="/admin/certificates/nikah/new"
                  onClick={() => setShowIssueMenu(false)}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 transition"
                >
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Nikah Certificate</p>
                    <p className="text-xs text-gray-500">Official Marriage Record</p>
                  </div>
                </Link>
                <Link
                  href="/admin/certificates/noc/new"
                  onClick={() => setShowIssueMenu(false)}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 transition"
                >
                  <div className="p-1.5 bg-blue-100 text-blue-800 rounded-md mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">NOC / Mahal Transfer</p>
                    <p className="text-xs text-gray-500">No Objection Certificate</p>
                  </div>
                </Link>
                <Link
                  href="/admin/certificates/membership/new"
                  onClick={() => setShowIssueMenu(false)}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 transition"
                >
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Membership Certificate</p>
                    <p className="text-xs text-gray-500">Community Membership Attestation</p>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Certificate # or Recipient name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter */}
            <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
              {(['ALL', 'NIKAH', 'NOC', 'MEMBERSHIP'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedType(t);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    selectedType === t
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t === 'ALL' ? 'All Types' : t}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as 'ALL' | 'ACTIVE' | 'REVOKED');
                setPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="REVOKED">Revoked</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchCertificates}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
              title="Refresh Registry"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Certificate #</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Issued To / Subject</th>
                <th className="px-6 py-3.5">Issue Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading certificates...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <IconCertificates className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-gray-600">No certificates found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Issue a new certificate to populate this registry.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((cert) => {
                  const isRevoked = cert.status === 'REVOKED';
                  const formattedDate = cert.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={cert.id}
                      className={`hover:bg-gray-50/60 transition ${isRevoked ? 'bg-red-50/20' : ''}`}
                    >
                      {/* Certificate Number */}
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        <Link
                          href={`/admin/certificates/${cert.id}`}
                          className="hover:text-emerald-600 hover:underline"
                        >
                          {cert.certificate_number}
                        </Link>
                      </td>

                      {/* Certificate Type */}
                      <td className="px-6 py-4">{getTypeBadge(cert.type)}</td>

                      {/* Recipient / Subject */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{cert.recipient_name}</div>
                        {cert.recipient_name_ml && (
                          <div className="text-xs text-gray-500 font-gayathri">
                            {cert.recipient_name_ml}
                          </div>
                        )}
                      </td>

                      {/* Issued Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formattedDate}</td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            <IconCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View & Print Button */}
                          <Link
                            href={`/admin/certificates/${cert.id}`}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                            title="View / Print Certificate"
                          >
                            <IconPrinter className="w-4 h-4" />
                          </Link>

                          {/* Copy Verification Link */}
                          <button
                            type="button"
                            onClick={() => copyVerificationLink(cert.verification_token, cert.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                            title="Copy Public Verification Link"
                          >
                            {copiedId === cert.id ? (
                              <IconCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <IconShare className="w-4 h-4" />
                            )}
                          </button>

                          {/* Revoke Action */}
                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokingCert(cert);
                                setRevokeReason('');
                                setRevokeError(null);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                              title="Revoke Certificate"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <div>
              Page <span className="font-semibold text-gray-800">{page}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-md bg-white disabled:opacity-40 hover:bg-gray-50 font-medium"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-md bg-white disabled:opacity-40 hover:bg-gray-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={!!revokingCert}
        onClose={() => setRevokingCert(null)}
        title="Revoke Certificate"
        subtitle={`Certificate #: ${revokingCert?.certificate_number}`}
        maxWidth="md"
      >
        <form onSubmit={handleRevoke} className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to revoke this certificate for{' '}
            <strong className="text-gray-900">{revokingCert?.recipient_name}</strong>? Once
            revoked, the public verification page will mark this certificate as invalid.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Revocation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g., Issued with incorrect bride name / Family transferred to another Mahal..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {revokeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {revokeError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRevokingCert(null)}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={revoking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {revoking ? 'Revoking...' : 'Confirm Revocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
