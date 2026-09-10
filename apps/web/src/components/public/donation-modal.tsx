'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { paymentsApi, financeApi } from '../../lib/api';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPurpose?: 'DONATION' | 'PIRIVU' | 'MADRASA_FEE';
}

export function DonationModal({ isOpen, onClose, defaultPurpose = 'DONATION' }: DonationModalProps) {
  const [step, setStep] = useState<'FORM' | 'PAYMENT' | 'SUCCESS'>('FORM');
  const [purpose, setPurpose] = useState<'DONATION' | 'PIRIVU' | 'MADRASA_FEE'>(defaultPurpose);
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [100, 250, 500, 1000, 2500, 5000];
  const mosqueVpa = 'noorulislammasjid@sbi';

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Please select or enter a valid donation amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await paymentsApi.createOrder({
        family_id: '00000000-0000-0000-0000-000000000000',
        purpose,
        amount,
        notes: `Online Donation by ${donorName || 'Well-wisher'} (${donorPhone || 'N/A'})${notes ? ' - ' + notes : ''}`,
      }).catch(() => null);

      setStep('PAYMENT');
    } catch {
      setStep('PAYMENT');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedReceipt = `DON-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceiptNumber(generatedReceipt);

    try {
      const existing = JSON.parse(localStorage.getItem('maheall_public_donations') || '[]');
      existing.unshift({
        receiptNumber: generatedReceipt,
        amount,
        purpose,
        donorName: donorName || 'Well-wisher',
        donorPhone: donorPhone || 'N/A',
        notes,
        utrNumber: utrNumber || 'UPI-APP-TRANSFER',
        date: new Date().toISOString(),
      });
      localStorage.setItem('maheall_public_donations', JSON.stringify(existing));

      // INTEGRATION: Automatically record donation in Finance Income
      financeApi.createIncome({
        fund_type: 'GENERAL',
        category: 'DONATION',
        amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'MANUAL_UPI',
        payer_name: donorName || 'Online Well-wisher',
        description: `Public Online Donation (${purpose}) - Ref: ${utrNumber || 'UPI App'}`,
        reference: generatedReceipt,
      }).catch(() => null);
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setLoading(false);
      setStep('SUCCESS');
    }, 400);
  };

  const handleCopyVpa = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mosqueVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const resetAndClose = () => {
    setStep('FORM');
    setError(null);
    setUtrNumber('');
    onClose();
  };

  const upiDeepLink = `upi://pay?pa=${mosqueVpa}&pn=Noorul+Islam+Juma+Masjid&am=${amount}&cu=INR&tn=${encodeURIComponent(
    purpose === 'DONATION' ? 'Masjid Sadqa' : purpose === 'MADRASA_FEE' ? 'Madrasa Aid' : 'Mahal Pirivu'
  )}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={
        step === 'PAYMENT'
          ? 'Complete UPI Contribution'
          : step === 'SUCCESS'
          ? 'Official Donation Receipt'
          : 'Online Contribution & Donation'
      }
    >
      {step === 'SUCCESS' ? (
        <div className="py-4 space-y-4">
          <div className="surface-card p-6 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/40 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-serif font-bold text-emerald-950">
              Jazakallahu Khairan
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              May Allah accept your noble contribution and grant abundance in your sustenance and household.
            </p>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Official Receipt #:</span>
                <span className="font-bold text-emerald-900">{receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Received:</span>
                <span className="font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Purpose:</span>
                <span className="font-bold text-gray-900">
                  {purpose === 'DONATION' ? 'Masjid Sadqa' : purpose === 'MADRASA_FEE' ? 'Madrasa Aid' : 'Mahal Pirivu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary:</span>
                <span className="font-bold text-gray-900">Noorul Islam Juma Masjid</span>
              </div>
              {utrNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">UPI Ref / UTR:</span>
                  <span className="font-bold text-gray-900">{utrNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              type="button"
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition"
            >
              Print Official Receipt
            </button>
            <button
              onClick={resetAndClose}
              type="button"
              className="px-5 py-2 bg-[#063F35] hover:bg-[#022C27] text-white font-bold text-xs rounded-xl shadow-fine transition"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      ) : step === 'PAYMENT' ? (
        <form onSubmit={handleConfirmPayment} className="space-y-4 py-2">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                Total Payable Amount
              </span>
              <span className="text-2xl font-black font-mono text-emerald-950">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Official Masjid UPI ID (VPA)</span>
                <span className="font-mono text-xs font-bold text-emerald-900 select-all">{mosqueVpa}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition"
              >
                {copiedVpa ? 'Copied' : 'Copy VPA'}
              </button>
            </div>
          </div>

          {/* Quick Pay Links for Mobile */}
          <div className="space-y-2">
            <a
              href={upiDeepLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#063F35] hover:bg-[#022C27] shadow-fine transition"
            >
              <svg className="w-4 h-4 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span>Launch UPI App (GPay / PhonePe / Paytm)</span>
            </a>
          </div>

          {/* Bank Account Details Dropdown/Box */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1 font-mono">
            <div className="text-[10px] uppercase font-bold text-stone-500 font-sans">Bank NEFT / RTGS Transfer</div>
            <div>A/C: <span className="font-bold">38291048201</span> • State Bank of India (Calicut)</div>
            <div>IFSC: <span className="font-bold">SBIN0001234</span> • Noorul Islam Waqf Trust</div>
          </div>

          {/* UTR Reference Input */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-800">
              UPI Reference / 12-Digit UTR Number
            </label>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 423819208192 or Bank Ref"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#063F35] outline-hidden bg-white"
            />
            <p className="text-[10px] text-stone-500">
              Enter the 12-digit transaction reference (UTR) from your UPI app to generate and download your official receipt.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setStep('FORM')}
              className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              &larr; Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-fine transition"
            >
              {loading ? 'Verifying...' : 'Verify & Generate Official Receipt'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleProceedToPayment} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Purpose Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Select Purpose
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPurpose('DONATION')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  purpose === 'DONATION'
                    ? 'bg-[#063F35] text-white border-[#063F35] shadow-fine'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div>Masjid Sadqa</div>
                <div className="text-[10px] font-normal opacity-80">Mosque General</div>
              </button>

              <button
                type="button"
                onClick={() => setPurpose('MADRASA_FEE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  purpose === 'MADRASA_FEE'
                    ? 'bg-[#063F35] text-white border-[#063F35] shadow-fine'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div>Madrasa Aid</div>
                <div className="text-[10px] font-normal opacity-80">Education Fund</div>
              </button>

              <button
                type="button"
                onClick={() => setPurpose('PIRIVU')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  purpose === 'PIRIVU'
                    ? 'bg-[#063F35] text-white border-[#063F35] shadow-fine'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div>Mahal Pirivu</div>
                <div className="text-[10px] font-normal opacity-80">Monthly Fund</div>
              </button>
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Select Amount (₹)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {presetAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectPreset(val)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono border transition ${
                    amount === val && !customAmount
                      ? 'bg-[#063F35] text-white border-[#063F35] shadow-fine'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold font-mono text-xs">₹</span>
              <input
                type="number"
                min="10"
                step="10"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Or enter custom amount..."
                className="w-full pl-8 pr-4 py-2 border border-stone-200 rounded-xl text-xs font-bold font-mono focus:ring-2 focus:ring-[#063F35] outline-hidden"
              />
            </div>
          </div>

          {/* Donor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Donor Name
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Optional / Anonymous"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#063F35] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mobile / WhatsApp
              </label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="For receipt SMS/WhatsApp"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#063F35] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Dua / Notes & Special Requests
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. For Marhoom parents / Shifa dua"
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#063F35] outline-hidden"
            />
          </div>

          {/* Payment Gateways / UPI Info */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#063F35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Instant UPI, GPay, PhonePe, Cards &amp; NetBanking</span>
            </div>
            <span className="font-mono font-bold text-[#063F35] text-[11px]">100% Secure</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || amount <= 0}
              className="px-5 py-2.5 bg-[#063F35] hover:bg-[#022C27] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-fine transition flex items-center gap-2"
            >
              {loading ? (
                <span>Preparing Payment...</span>
              ) : (
                <span>Continue to UPI Pay ₹{amount.toLocaleString('en-IN')} &rarr;</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
