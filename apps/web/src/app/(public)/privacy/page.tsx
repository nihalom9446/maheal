import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { IconShield, IconCheckCircle, IconBuilding } from '@/components/ui/icons';

export const metadata = {
  title: 'Privacy Policy & Data Protection | Noorul Islam Juma Masjid',
  description: 'Digital Personal Data Protection Act (DPDPA 2023) Compliance & Privacy Policy for MAHEALL Operating System.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-canvas-bg min-h-screen">
      <PageHeader
        badge="Legal & Compliance"
        title="Privacy Policy & Data Protection"
        description="Comprehensive privacy notice detailing our data protection standards under the Digital Personal Data Protection Act (DPDPA), 2023."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Privacy Policy', href: '/privacy' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs space-y-8 text-sm text-ink leading-relaxed">
          
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-masjid-deepGreen flex items-start gap-3">
            <IconShield className="w-5 h-5 text-masjid-green shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">DPDPA 2023 Compliant Platform</span>
              <span>Noorul Islam Juma Masjid is committed to safeguarding personal data in accordance with India&apos;s Digital Personal Data Protection Act, 2023 and Waqf Board institutional privacy principles.</span>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">1. Data Fiduciary & Identity</h2>
            <p className="text-masjid-muted">
              The Data Fiduciary responsible for the processing of your personal data is the <strong>Noorul Islam Juma Masjid Committee</strong>, Calicut, Kerala (Waqf Reg No: KSWB/CLT/2018/489). For any data protection inquiries, you may contact the Data Protection Officer / General Secretary at <code className="text-masjid-green bg-gray-100 px-1.5 py-0.5 rounded">privacy@noorulislammasjid.in</code>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">2. Personal Data We Collect</h2>
            <p className="text-masjid-muted">We collect and maintain records strictly necessary for community administration, family registration, and civic welfare:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-masjid-muted">
              <li><strong>Household Identification:</strong> House name, door number, ward allocation, family number, and head of household.</li>
              <li><strong>Member Particulars:</strong> Full legal name, date of birth, gender, blood group, occupation, relationship to head of household, and NRI status.</li>
              <li><strong>Contact Information:</strong> Verified Indian mobile numbers for OTP authentication and WhatsApp communications.</li>
              <li><strong>Financial & Pirivu Records:</strong> Monthly contribution records, UTR bank references, and official payment receipts.</li>
              <li><strong>Madrasa Academic Records:</strong> Student attendance records and class progress.</li>
              <li><strong>Certificates:</strong> Nikah records, family membership certificates, and NOCs issued under official authorization.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">3. Purpose of Processing</h2>
            <p className="text-masjid-muted">Personal data is processed solely for lawful purposes including:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-canvas-bg rounded-xl border border-gray-100">
                <span className="font-bold text-ink block mb-1">Mahallu Administration</span>
                <span className="text-masjid-muted">Maintaining authentic electoral and census registries for community governance.</span>
              </div>
              <div className="p-3 bg-canvas-bg rounded-xl border border-gray-100">
                <span className="font-bold text-ink block mb-1">Official Certification</span>
                <span className="text-masjid-muted">Issuing tamper-proof, QR-verified Nikah and Membership certificates.</span>
              </div>
              <div className="p-3 bg-canvas-bg rounded-xl border border-gray-100">
                <span className="font-bold text-ink block mb-1">Welfare & Zakat Allocation</span>
                <span className="text-masjid-muted">Equitable distribution of financial assistance and medical aid.</span>
              </div>
              <div className="p-3 bg-canvas-bg rounded-xl border border-gray-100">
                <span className="font-bold text-ink block mb-1">Emergency Communications</span>
                <span className="text-masjid-muted">Broadcasting demise (Janazah) alerts and important community notices.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">4. Rights of Data Principals</h2>
            <p className="text-masjid-muted">Under the DPDPA 2023, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-masjid-muted">
              <li><strong>Access & Summary:</strong> View all registered family details and financial receipts in the Member Portal.</li>
              <li><strong>Correction & Update:</strong> Submit correction requests for name changes, phone updates, or new family members.</li>
              <li><strong>Grievance Redressal:</strong> Register grievances with the Mahal Data Grievance Officer, resolved within 7 business days.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">5. Data Security & Storage</h2>
            <p className="text-masjid-muted">
              All member records and cryptographic hashes are secured with 256-bit encryption in transit and at rest. Data is strictly hosted within Indian data centers in full compliance with data localization mandates.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 text-xs text-masjid-muted flex items-center justify-between">
            <span>Last Updated: September 2026</span>
            <span>Document Ref: NIJM-DPDPA-2026-V1</span>
          </div>

        </div>
      </div>
    </div>
  );
}
