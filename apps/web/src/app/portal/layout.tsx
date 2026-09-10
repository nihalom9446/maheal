'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MemberProvider, useMember } from '@/lib/member-context';
import {
  IconDashboard,
  IconFamily,
  IconReceipt,
  IconMadrasa,
  IconCertificates,
  IconAnnouncements,
  IconUser,
  IconLogOut,
  IconBuilding,
  IconCheckCircle,
} from '@/components/ui/icons';

interface MemberNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const memberNavItems: MemberNavItem[] = [
  { name: 'Household Passport', href: '/portal', icon: IconDashboard },
  { name: 'My Family', href: '/portal/family', icon: IconFamily },
  { name: 'Pirivu Dues', href: '/portal/pirivu', icon: IconReceipt },
  { name: 'Madrasa Children', href: '/portal/madrasa', icon: IconMadrasa },
  { name: 'Certificates Vault', href: '/portal/certificates', icon: IconCertificates },
  { name: 'Announcements', href: '/portal/announcements', icon: IconAnnouncements },
  { name: 'Profile & Privacy', href: '/portal/profile', icon: IconUser },
];

function MemberPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, isAuthenticated, isLoading } = useMember();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render children directly without dashboard sidebar/shell
  if (pathname === '/portal/login') {
    return <div className="min-h-screen bg-masjid-deepGreen">{children}</div>;
  }

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/portal/login') {
      router.push('/portal/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-600 font-playfair">Loading Member Passport...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/portal/login') {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-600">Redirecting to member login...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    router.push('/portal/login');
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col selection:bg-masjid-green/20 selection:text-masjid-deepGreen">
      {/* 1. TOP BRANDING BANNER (Institutional Forest Green Theme) */}
      <header className="sticky top-0 z-40 bg-masjid-deepGreen text-white shadow-md border-b border-masjid-green/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Branding & Portal Badge */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-masjid-green/50 transition"
                aria-label="Toggle Member Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link href="/portal" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-masjid-gold/40 group-hover:scale-105 transition duration-200 shrink-0">
                  <Image
                    src="/mundupara_emblem.png"
                    alt="Mundupara Logo"
                    width={36}
                    height={36}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-white text-base sm:text-lg font-playfair">
                      MAHEALL
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-masjid-gold/20 text-masjid-gold border border-masjid-gold/40">
                      Family Passport
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-300 font-medium leading-tight">
                    Mundupara Muhiyudheen Juma Masjid Mahal Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Quick Portal Switchers & Member Info */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Switch to Public Website */}
              <Link
                href="/"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-masjid-green/40 border border-white/10 transition"
              >
                <IconBuilding className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </Link>

              {/* Household Badge */}
              <div className="hidden lg:flex items-center gap-2.5 pl-3.5 border-l border-white/10">
                <div className="w-9 h-9 rounded-xl bg-masjid-green text-masjid-gold flex items-center justify-center font-mono font-bold text-xs border border-masjid-gold/30 shadow-xs">
                  {profile?.family_number ? `#${profile.family_number}` : 'FAM'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[140px]">
                    {profile?.house_name || 'Baitul Noor'}
                  </div>
                  <div className="text-[10px] text-gray-300 truncate max-w-[140px]">
                    {profile?.ward_name || 'Ward Member'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                type="button"
                className="p-2 rounded-xl text-gray-300 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition"
                title="Sign Out of Member Portal"
              >
                <IconLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Horizontal Navigation Bar */}
        <div className="hidden lg:block bg-masjid-deepGreen/95 border-t border-masjid-green/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 py-1.5 overflow-x-auto">
              {memberNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-masjid-green text-white shadow-xs border border-masjid-gold/40'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-masjid-gold' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-masjid-deepGreen text-white shadow-2xl border-r border-masjid-green/40">
            <div className="p-5 border-b border-masjid-green/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-masjid-gold text-masjid-deepGreen flex items-center justify-center font-bold">
                  M
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-playfair">Member Portal</div>
                  <div className="text-[10px] text-masjid-gold">Members Portal</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Member Household Info Card in Drawer */}
            <div className="p-4 bg-masjid-green/40 border-b border-masjid-green/30 space-y-1">
              <div className="text-xs font-mono font-bold text-masjid-gold">
                FAMILY #{profile?.family_number || 104}
              </div>
              <div className="text-sm font-bold text-white">
                {profile?.house_name || 'Baitul Noor'}
              </div>
              <div className="text-[11px] text-gray-300 pt-1 flex items-center gap-1.5">
                <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile?.ward_name || 'Ward 3 - Valiya Parambu'}</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {memberNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/portal' ? pathname === '/portal' : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-masjid-green text-white shadow-sm border-l-4 border-masjid-gold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-masjid-gold' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Switchers at bottom */}
            <div className="p-4 border-t border-masjid-green/30 bg-masjid-deepGreen space-y-2">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-masjid-green/50 text-gray-300 hover:text-white"
              >
                <span>Return to Public Website</span>
              </Link>
              <button
                onClick={handleSignOut}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 transition border border-rose-900/40"
              >
                <IconLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Member Portal Footer */}
      <footer className="bg-white border-t border-gray-200/80 py-6 text-center text-xs text-masjid-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">MAHEALL Member Operating System</span>
            <span>&bull;</span>
            <span className="text-masjid-green font-medium">Mundupara Muhiyudheen Juma Masjid Mahal Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>DPDPA 2023 Compliant</span>
            <span>&bull;</span>
            <span>256-Bit Encrypted Privacy</span>
            <span>&bull;</span>
            <Link href="/portal/profile" className="hover:text-masjid-green underline underline-offset-2">
              Privacy Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MemberPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberProvider>
      <MemberPortalShell>{children}</MemberPortalShell>
    </MemberProvider>
  );
}
