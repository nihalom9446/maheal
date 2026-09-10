import React from 'react';
import { PublicNavbar } from '../../components/public/navbar';
import { PublicFooter } from '../../components/public/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      <PublicNavbar />
      <main className="grow">{children}</main>
      <PublicFooter />
    </div>
  );
}
