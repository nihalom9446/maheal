'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <main className="pl-0 lg:pl-64 pt-16 min-h-screen transition-all duration-200">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
