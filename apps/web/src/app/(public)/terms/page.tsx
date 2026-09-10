import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { IconShield, IconBuilding } from '@/components/ui/icons';

export const metadata = {
  title: 'Terms of Service | Noorul Islam Juma Masjid',
  description: 'Terms of Service and Community By-laws for MAHEALL platform and Noorul Islam Juma Masjid.',
};

export default function TermsPage() {
  return (
    <div className="bg-canvas-bg min-h-screen">
      <PageHeader
        badge="Community By-laws"
        title="Terms of Service & Rules"
        description="Guidelines and terms governing membership privileges, certificate issuance, and platform usage."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Terms of Service', href: '/terms' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-card p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs space-y-8 text-sm text-ink leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">1. Membership & Mahallu Jurisdiction</h2>
            <p className="text-masjid-muted">
              Membership in Noorul Islam Juma Masjid Mahal is granted to permanent Muslim households residing within the designated 6 geographical wards (Ellaka). Each registered household receives a unique Family Number and Digital Household Passport.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">2. Monthly Contributions (Pirivu)</h2>
            <p className="text-masjid-muted">
              Monthly pirivu contributions sustain the operational maintenance of the Masjid, Imam/Muezzin honorariums, and welfare activities. Registered households are requested to remit dues regularly through the digital portal or the office clerk counter.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">3. Issuance & Validity of Certificates</h2>
            <p className="text-masjid-muted">
              All certificates (Nikah Nama, Membership, No Objection Certificates) generated through the MAHEALL platform carry cryptographic validation tokens and digital seals. Any unauthorized duplication, alteration, or fraudulent presentation constitutes a legal violation under the Kerala Waqf Regulations and Indian Penal Code.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-ink font-playfair">4. Online Communications & Conduct</h2>
            <p className="text-masjid-muted">
              Community notice boards and messaging channels are maintained solely for spiritual, administrative, and civic announcements. Any form of sectarian incitement, spam, or disinformation is strictly prohibited.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 text-xs text-masjid-muted flex items-center justify-between">
            <span>Adopted by General Body: 2024</span>
            <span>Administered by Noorul Islam Juma Masjid Committee</span>
          </div>

        </div>
      </div>
    </div>
  );
}
