'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconFinance,
  IconReceipt,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
} from '../../../components/ui/icons';

interface TabItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  {
    name: 'Overview',
    href: '/admin/finance',
    icon: IconFinance,
  },
  {
    name: 'Collection Registry',
    href: '/admin/finance/pirivu',
    icon: IconReceipt,
  },
  {
    name: 'Arrears Audit',
    href: '/admin/finance/arrears',
    icon: IconAlertCircle,
  },
  {
    name: 'Income Records',
    href: '/admin/finance/income',
    icon: IconTrendingUp,
  },
  {
    name: 'Expense Records',
    href: '/admin/finance/expense',
    icon: IconTrendingDown,
  },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <IconFinance className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>Finance & Operating Accounts</span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mahal financial management, monthly subscription collections, and ledger records
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/admin/finance/pirivu"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <IconReceipt className="w-4 h-4" />
              <span>Record Collection</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-t border-gray-100 mt-6 pt-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/admin/finance'
                ? pathname === '/admin/finance'
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}
                />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div>{children}</div>
    </div>
  );
}
