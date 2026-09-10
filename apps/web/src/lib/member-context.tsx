'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  MemberProfile,
  FamilyMemberRecord,
  PirivuMonthRecord,
  MadrasaChildRecord,
  MemberCertificateRecord,
  MemberAnnouncementRecord,
  CertificateRequestPayload,
  DEFAULT_MEMBER_PROFILE,
  DEFAULT_FAMILY_MEMBERS,
  DEFAULT_PIRIVU_RECORDS,
  DEFAULT_MADRASA_CHILDREN,
  DEFAULT_CERTIFICATES,
  DEFAULT_ANNOUNCEMENTS,
} from './member-data';
import { financeApi } from './api';

interface MemberContextType {
  profile: MemberProfile | null;
  familyMembers: FamilyMemberRecord[];
  pirivuRecords: PirivuMonthRecord[];
  madrasaChildren: MadrasaChildRecord[];
  certificates: MemberCertificateRecord[];
  announcements: MemberAnnouncementRecord[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, dpdpaConsent: boolean) => Promise<boolean>;
  logout: () => void;
  payPirivuMonth: (monthIndices: number[], method: 'UPI' | 'CASH' | 'NETBANKING' | 'GATEWAY', utr?: string) => string;
  requestCertificate: (payload: CertificateRequestPayload) => MemberCertificateRecord;
  updateConsent: (consent: boolean) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'maheall_member_profile',
  MEMBERS: 'maheall_family_members',
  PIRIVU: 'maheall_pirivu_records',
  MADRASA: 'maheall_madrasa_children',
  CERTIFICATES: 'maheall_certificates',
  AUTH: 'maheall_member_auth',
  GLOBAL_CERTS_REGISTRY: 'maheall_global_verified_certificates',
};

export function MemberProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<MemberProfile | null>(DEFAULT_MEMBER_PROFILE);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberRecord[]>(DEFAULT_FAMILY_MEMBERS);
  const [pirivuRecords, setPirivuRecords] = useState<PirivuMonthRecord[]>(DEFAULT_PIRIVU_RECORDS);
  const [madrasaChildren, setMadrasaChildren] = useState<MadrasaChildRecord[]>(DEFAULT_MADRASA_CHILDREN);
  const [certificates, setCertificates] = useState<MemberCertificateRecord[]>(DEFAULT_CERTIFICATES);
  const [announcements] = useState<MemberAnnouncementRecord[]>(DEFAULT_ANNOUNCEMENTS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      const storedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (storedMembers) {
        setFamilyMembers(JSON.parse(storedMembers));
      }

      const storedPirivu = localStorage.getItem(STORAGE_KEYS.PIRIVU);
      if (storedPirivu) {
        setPirivuRecords(JSON.parse(storedPirivu));
      }

      const storedMadrasa = localStorage.getItem(STORAGE_KEYS.MADRASA);
      if (storedMadrasa) {
        setMadrasaChildren(JSON.parse(storedMadrasa));
      }

      const storedCerts = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (storedCerts) {
        setCertificates(JSON.parse(storedCerts));
      }
    } catch {
      // Ignore error and use defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when state changes
  const saveState = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  };

  const login = async (phone: string, dpdpaConsent: boolean): Promise<boolean> => {
    const updatedProfile: MemberProfile = {
      ...DEFAULT_MEMBER_PROFILE,
      phone: phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`,
      dpdpa_consent: dpdpaConsent,
      dpdpa_consent_date: new Date().toISOString(),
    };
    setProfile(updatedProfile);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    saveState(STORAGE_KEYS.PROFILE, updatedProfile);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  };

  const payPirivuMonth = (
    monthIndices: number[],
    method: 'UPI' | 'CASH' | 'NETBANKING' | 'GATEWAY',
    utr?: string
  ): string => {
    const baseNum = Math.floor(4000 + Math.random() * 5000);
    const primaryReceiptNum = `PRV-2026-${baseNum}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const updated = pirivuRecords.map((rec) => {
      if (monthIndices.includes(rec.monthIndex)) {
        const itemReceipt = monthIndices.length > 1
          ? `PRV-2026-${baseNum}-${rec.monthIndex + 1}`
          : primaryReceiptNum;

        return {
          ...rec,
          status: 'PAID' as const,
          receiptNumber: itemReceipt,
          paidDate: todayStr,
          paymentMethod: method,
          utrReference: utr || `MEMBER-PAY-${Date.now().toString().slice(-6)}`,
        };
      }
      return rec;
    });

    setPirivuRecords(updated);
    saveState(STORAGE_KEYS.PIRIVU, updated);

    // INTEGRATION: Cross-post pirivu collection to central finance income
    const totalAmount = monthIndices.reduce((sum, idx) => {
      const rec = pirivuRecords.find((r) => r.monthIndex === idx);
      return sum + (rec?.amount || (profile?.monthly_pirivu || 200));
    }, 0);

    if (profile) {
      financeApi.createIncome({
        fund_type: 'GENERAL',
        category: 'PIRIVU',
        amount: totalAmount,
        payment_date: todayStr,
        payment_method: method === 'UPI' ? 'MANUAL_UPI' : (method === 'NETBANKING' || method === 'GATEWAY' ? 'BANK_TRANSFER' : 'CASH'),
        payer_name: `${profile.head_name} (${profile.house_name} #${profile.family_number})`,
        description: `Member Portal Pirivu payment for ${monthIndices.length} month(s)`,
        reference: primaryReceiptNum,
      }).catch(() => null);
    }

    return primaryReceiptNum;
  };

  const requestCertificate = (payload: CertificateRequestPayload): MemberCertificateRecord => {
    const certNum = `CRT-${payload.type}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newCert: MemberCertificateRecord = {
      id: `crt_${Date.now()}`,
      certificate_number: certNum,
      type: payload.type,
      title:
        payload.type === 'NIKAH'
          ? 'Nikah Marriage Certificate'
          : payload.type === 'NOC'
          ? 'Mahal Transfer / Clearance NOC'
          : 'Mahal Membership & Residence Certificate',
      title_ml:
        payload.type === 'NIKAH'
          ? 'Nikah Marriage Certificate'
          : payload.type === 'NOC'
          ? 'Mahal Transfer / Clearance NOC'
          : 'Mahal Membership & Residence Certificate',
      recipient_name: payload.member_name,
      recipient_name_ml: payload.member_name,
      purpose: payload.purpose,
      purpose_ml: payload.purpose,
      issued_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      verification_token: `vtok_${Math.random().toString(36).substring(2, 10)}`,
    };

    const updatedCerts = [newCert, ...certificates];
    setCertificates(updatedCerts);
    saveState(STORAGE_KEYS.CERTIFICATES, updatedCerts);

    // Sync to global certificate verification ledger for public QR code lookups
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.GLOBAL_CERTS_REGISTRY) || '{}');
      existing[newCert.verification_token] = {
        certificate_number: newCert.certificate_number,
        type: newCert.type,
        status: newCert.status,
        recipient_name: newCert.recipient_name,
        recipient_name_ml: newCert.recipient_name_ml,
        issued_at: newCert.issued_date,
        valid_until: newCert.valid_until,
        summary: newCert.purpose,
        summary_ml: newCert.purpose_ml,
        valid: true,
        mahal: {
          name: 'Noorul Islam Juma Masjid',
          name_ml: 'Noorul Islam Juma Masjid',
          waqf_number: 'KSWB/CLT/2018/489',
          district: 'Kozhikode',
        },
      };
      localStorage.setItem(STORAGE_KEYS.GLOBAL_CERTS_REGISTRY, JSON.stringify(existing));
    } catch {
      // Ignore
    }

    return newCert;
  };

  const updateConsent = (consent: boolean) => {
    if (!profile) return;
    const updated: MemberProfile = {
      ...profile,
      dpdpa_consent: consent,
      dpdpa_consent_date: new Date().toISOString(),
    };
    setProfile(updated);
    saveState(STORAGE_KEYS.PROFILE, updated);
  };

  return (
    <MemberContext.Provider
      value={{
        profile,
        familyMembers,
        pirivuRecords,
        madrasaChildren,
        certificates,
        announcements,
        isAuthenticated,
        isLoading,
        login,
        logout,
        payPirivuMonth,
        requestCertificate,
        updateConsent,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
}
