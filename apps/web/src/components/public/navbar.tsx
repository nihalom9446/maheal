'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SearchModal } from './search-modal';
import { getHijriDate } from '../../lib/hijri';

export function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hijriStr, setHijriStr] = useState<string>('1448 AH');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    try {
      const h = getHijriDate(new Date());
      setHijriStr(h.formattedEn);
    } catch {
      setHijriStr('1448 AH');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Prayer Times', href: '/prayer' },
    { name: 'Services', href: '/services' },
    { name: 'Announcements', href: '/announcements' },
    { name: 'Janazah', href: '/deaths' },
    { name: 'Events', href: '/events' },
    { name: 'Committee', href: '/committee' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 transition-all duration-200">
        {/* 1. Top Utility Bar — Subtle Forest Green */}
        <div className="bg-[#063F35] text-stone-200 text-xs py-2 px-4 sm:px-8 border-b border-[#0A5C4D]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Location & Hijri Calendar */}
            <div className="flex items-center gap-3 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 text-stone-200">
                <svg className="w-3.5 h-3.5 text-[#C9A646] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Mundupara, Kozhikode, Kerala</span>
              </div>
              <span className="text-[#0A5C4D] hidden sm:inline">•</span>
              <span className="text-[#EFE6C9] font-medium hidden sm:inline">
                {hijriStr}
              </span>
            </div>

            {/* Right: Quick Links & Search Trigger */}
            <div className="flex items-center gap-4 text-[11px] sm:text-xs text-stone-200">
              <div className="hidden md:flex items-center gap-3">
                <Link href="/prayer" className="hover:text-[#EFE6C9] transition">
                  Prayer Timings
                </Link>
                <span className="text-[#0A5C4D]">|</span>
                <Link href="/announcements" className="hover:text-[#EFE6C9] transition">
                  Circulars
                </Link>
                <span className="text-[#0A5C4D]">|</span>
                <Link href="/verify" className="hover:text-[#EFE6C9] transition">
                  Verify QR
                </Link>
                <span className="text-[#0A5C4D]">|</span>
                <Link href="/contact" className="hover:text-[#EFE6C9] transition">
                  24/7 Helpline
                </Link>
              </div>

              {/* Search Modal Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#022C27]/50 hover:bg-[#022C27] text-stone-200 text-[11px] transition"
                title="Search website (Ctrl+K)"
              >
                <svg className="w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar — Pure White Surface */}
        <nav
          className={`bg-white transition-all duration-200 border-b border-stone-200/90 ${
            isScrolled ? 'shadow-fine py-2.5' : 'py-3.5'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Brand Logo & Name */}
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/90 shadow-fine p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-150 shrink-0">
                  <Image
                    src="/mundupara_emblem.png"
                    alt="Mundupara Muhiyudheen Juma Masjid Logo"
                    width={36}
                    height={36}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-serif font-black text-[#063F35] tracking-tight leading-tight">
                    MUNDUPARA MUHIYUDHEEN JUMA MASJID
                  </span>
                  <span className="text-[11px] font-bold text-[#0A5C4D] tracking-wider uppercase leading-none mt-0.5">
                    Mundupara Mahal Portal
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'text-[#063F35] bg-stone-100 font-bold'
                          : 'text-stone-700 hover:text-[#063F35] hover:bg-stone-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Right Action: Member Portal & Admin */}
              <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                <Link
                  href="/portal"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#063F35] hover:bg-[#022C27] active:bg-[#022C27] transition shadow-fine"
                >
                  <svg className="w-3.5 h-3.5 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span>Member Portal</span>
                </Link>

                <Link
                  href="/admin"
                  className="text-xs font-semibold text-stone-500 hover:text-[#063F35] px-2 py-1 transition"
                >
                  Admin
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex xl:hidden items-center gap-2">
                <Link
                  href="/portal"
                  className="inline-flex sm:hidden items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#063F35]"
                >
                  Portal
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  type="button"
                  className="p-2 rounded-xl text-stone-700 hover:text-[#063F35] hover:bg-stone-100 transition"
                  aria-label="Toggle Navigation"
                >
                  {isMobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Drawer */}
          {isMobileMenuOpen && (
            <div className="xl:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-elevated">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-stone-100 text-[#063F35] font-bold'
                        : 'text-stone-700 hover:bg-stone-50 hover:text-[#063F35]'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-stone-100 flex flex-col gap-2.5">
                <Link
                  href="/portal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#063F35] shadow-fine transition"
                >
                  <svg className="w-4 h-4 text-[#C9A646]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span>Access Member Portal</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
                >
                  <span>Committee & Admin Console</span>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
