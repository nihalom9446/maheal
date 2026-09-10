'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconFamily,
  IconWard,
  IconFinance,
  IconPrayers,
  IconAnnouncements,
  IconUser,
  IconCalendar,
  IconMadrasa,
  IconCertificates,
  IconSettings,
} from '../ui/icons';

interface NavItem {
  name: string;
  name_ml?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: IconDashboard },
  { name: 'Families', href: '/admin/families', icon: IconFamily },
  { name: 'Wards', href: '/admin/wards', icon: IconWard },
  { name: 'Finance', href: '/admin/finance', icon: IconFinance },
  { name: 'Prayers', href: '/admin/prayers', icon: IconPrayers },
  { name: 'Announcements', href: '/admin/announcements', icon: IconAnnouncements },
  { name: 'Janazah / Deaths', href: '/admin/deaths', icon: IconUser },
  { name: 'Events', href: '/admin/events', icon: IconCalendar },
  { name: 'Madrasa', href: '/admin/madrasa', icon: IconMadrasa },
  { name: 'Certificates', href: '/admin/certificates', icon: IconCertificates },
  { name: 'Settings', href: '/admin/settings', icon: IconSettings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 text-emerald-100 flex flex-col h-screen fixed left-0 top-0 border-r border-emerald-900/80 z-40 select-none shadow-2xl transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo with Gold Trim */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-900/80 bg-emerald-950/80 backdrop-blur-md">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-amber-300/60 group-hover:scale-105 transition duration-200 shrink-0">
              <Image
                src="/mundupara_emblem.png"
                alt="Mundupara Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>MAHEALL</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black px-1.5 py-0.2 rounded-md">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 -mt-0.5 font-semibold">
                Mahal Operating System
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-black text-amber-400/80 uppercase tracking-widest">
          Administration
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMadrasa = item.href === '/admin/madrasa';
          const isMadrasaActive = pathname.startsWith('/admin/madrasa');
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <div key={item.href} className="space-y-1">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive && !isMadrasaActive
                    ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md border border-amber-400/30'
                    : isMadrasaActive && isMadrasa
                    ? 'bg-emerald-800/80 text-white shadow-md border border-amber-400/30'
                    : 'text-emerald-200/80 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-amber-300' : 'text-emerald-400 group-hover:text-emerald-200'
                  }`}
                />
                <div className="flex flex-col flex-1">
                  <span className="leading-tight">{item.name}</span>
                </div>
              </Link>

              {/* Madrasa Sub-items */}
              {isMadrasa && isMadrasaActive && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-amber-400/40 ml-5 my-1">
                  <Link
                    href="/admin/madrasa"
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname === '/admin/madrasa'
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/admin/madrasa/students"
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname.startsWith('/admin/madrasa/students')
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    Students
                  </Link>
                  <Link
                    href="/admin/madrasa/attendance"
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname.startsWith('/admin/madrasa/attendance')
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    Attendance
                  </Link>
                  <Link
                    href="/admin/madrasa/fees"
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname.startsWith('/admin/madrasa/fees')
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    Fee Collection
                  </Link>
                  <Link
                    href="/admin/madrasa/teachers"
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname.startsWith('/admin/madrasa/teachers')
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-emerald-300/80 hover:bg-emerald-900/40 hover:text-white'
                    }`}
                  >
                    Teachers &amp; Muallims
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Info / Help */}
      <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/80">
        <div className="rounded-2xl bg-emerald-900/40 p-3.5 border border-emerald-800/60 text-xs text-emerald-300 space-y-0.5">
          <p className="font-black text-white">Mundupara Muhiyudheen Juma Masjid</p>
          <p className="text-[11px] text-amber-300 font-medium">Mundupara Mahal Jama&apos;ath</p>
        </div>
      </div>
    </aside>
  </>
  );
}
