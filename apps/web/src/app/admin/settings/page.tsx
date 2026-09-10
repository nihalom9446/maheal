'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconSettings,
  IconBuilding,
  IconReceipt,
  IconShield,
  IconBell,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from '@/components/ui/icons';

interface MahalSettings {
  masjid_name: string;
  masjid_name_ml: string;
  waqf_reg_no: string;
  madrasa_reg_no: string;
  address: string;
  district: string;
  helpline_phone: string;
  janazah_helpline: string;
  upi_vpa: string;
  default_pirivu: number;
  receipt_prefix: string;
  dpo_email: string;
  require_dpdpa: boolean;
  sms_sender_id: string;
  whatsapp_enabled: boolean;
}

const DEFAULT_SETTINGS: MahalSettings = {
  masjid_name: 'Noorul Islam Juma Masjid',
  masjid_name_ml: 'Noorul Islam Juma Masjid',
  waqf_reg_no: 'KSWB/CLT/2018/489',
  madrasa_reg_no: 'SKIMVB/KKD/1482',
  address: 'Town Juma Masjid Road, Kozhikode, Kerala 673001',
  district: 'Kozhikode',
  helpline_phone: '+91 495 244 0123',
  janazah_helpline: '+91 98470 12345',
  upi_vpa: 'noorulislammasjid@sbi',
  default_pirivu: 200,
  receipt_prefix: 'PRV-2026-',
  dpo_email: 'privacy@noorulislammasjid.in',
  require_dpdpa: true,
  sms_sender_id: 'MAHEAL',
  whatsapp_enabled: true,
};

const STORAGE_KEY = 'maheall_admin_settings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FINANCE' | 'PRIVACY' | 'NOTIFICATIONS'>('GENERAL');
  const [settings, setSettings] = useState<MahalSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const handleChange = <K extends keyof MahalSettings>(field: K, val: MahalSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSuccessMessage('Mahal administrative settings updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset settings to Waqf default configuration?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      setSuccessMessage('Default settings restored.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <IconSettings className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings & Configuration</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Mahal configuration &bull; Waqf registration, UPI payment accounts, and privacy policy
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'GENERAL'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <IconBuilding className="w-4 h-4" />
          <span>General &amp; Waqf</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FINANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'FINANCE'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <IconReceipt className="w-4 h-4" />
          <span>Finance &amp; UPI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PRIVACY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'PRIVACY'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <IconShield className="w-4 h-4" />
          <span>DPDPA &amp; Privacy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <IconBell className="w-4 h-4" />
          <span>Gateways &amp; Alerts</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'GENERAL' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Institutional & Waqf Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Masjid Name (English)
                </label>
                <input
                  type="text"
                  value={settings.masjid_name}
                  onChange={(e) => handleChange('masjid_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Regional Reference Name
                </label>
                <input
                  type="text"
                  value={settings.masjid_name_ml}
                  onChange={(e) => handleChange('masjid_name_ml', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Waqf Board Registration #
                </label>
                <input
                  type="text"
                  value={settings.waqf_reg_no}
                  onChange={(e) => handleChange('waqf_reg_no', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  SKIMVB Madrasa Board Code
                </label>
                <input
                  type="text"
                  value={settings.madrasa_reg_no}
                  onChange={(e) => handleChange('madrasa_reg_no', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Postal Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Office Helpline Phone
                </label>
                <input
                  type="text"
                  value={settings.helpline_phone}
                  onChange={(e) => handleChange('helpline_phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  24/7 Janazah Demise Helpline
                </label>
                <input
                  type="text"
                  value={settings.janazah_helpline}
                  onChange={(e) => handleChange('janazah_helpline', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              UPI Collection & Accounting Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Masjid Official UPI VPA / QR ID
                </label>
                <input
                  type="text"
                  value={settings.upi_vpa}
                  onChange={(e) => handleChange('upi_vpa', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">Used for instant UPI intent and donation QR codes.</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Monthly Pirivu Rate (₹)
                </label>
                <input
                  type="number"
                  value={settings.default_pirivu}
                  onChange={(e) => handleChange('default_pirivu', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Receipt Series Prefix
                </label>
                <input
                  type="text"
                  value={settings.receipt_prefix}
                  onChange={(e) => handleChange('receipt_prefix', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PRIVACY' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              DPDPA 2023 Compliance & Data Governance
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Data Protection Officer (DPO) Contact Email
                </label>
                <input
                  type="email"
                  value={settings.dpo_email}
                  onChange={(e) => handleChange('dpo_email', e.target.value)}
                  className="w-full max-w-md px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.require_dpdpa}
                    onChange={(e) => handleChange('require_dpdpa', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Enforce Explicit DPDPA Consent on Login</span>
                    <span className="text-gray-500">
                      Mandate acceptance of household data processing policy prior to viewing the member passport.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'NOTIFICATIONS' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Automated Messaging Gateways
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  MSG91 SMS Sender ID
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={settings.sms_sender_id}
                  onChange={(e) => handleChange('sms_sender_id', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_enabled}
                    onChange={(e) => handleChange('whatsapp_enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-gray-900">Enable WhatsApp Cloud Messaging</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            className="px-6 py-2.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
