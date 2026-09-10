import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#022C27] text-stone-200 border-t border-[#063F35] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#063F35]">
          {/* Column 1: Institution Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#D3E4DE]/40 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                <Image
                  src="/mundupara_emblem.png"
                  alt="Mundupara Muhiyudheen Juma Masjid Logo"
                  width={38}
                  height={38}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base leading-tight">
                  MUNDUPARA MUHIYUDHEEN JUMA MASJID
                </h3>
                <p className="text-xs text-[#C9A646] font-semibold tracking-wider uppercase">
                  Official Mahal Jama&apos;ath Committee
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              A place for prayer, education, family administration, and community welfare. Serving over 450 registered households across 6 administrative wards under the Kerala State Waqf Board.
            </p>

            <div className="pt-1 text-[11px] space-y-1 text-stone-400 font-mono">
              <div>Waqf Reg: <strong className="text-stone-200">KSWB/CLT/2018/489</strong></div>
              <div>Madrasa Reg: <strong className="text-stone-200">SKIMVB/KKD/1482</strong></div>
            </div>
          </div>

          {/* Column 2: Navigation & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#C9A646] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/prayer" className="hover:text-white transition">
                  Prayer Timetable &amp; Azan Times
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition text-[#EFE6C9] font-medium">
                  Digital Household Passport
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">
                  Nikah &amp; NOC Certificates
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white transition">
                  Circulars &amp; Announcements
                </Link>
              </li>
              <li>
                <Link href="/deaths" className="hover:text-white transition">
                  Janazah &amp; Demise Notices
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition">
                  Community Programs &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/committee" className="hover:text-white transition">
                  Mahal Office Bearers
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition">
                  Verify Certificate QR Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & 24/7 Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#C9A646] uppercase tracking-wider">
              Contact &amp; 24/7 Support
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="bg-[#063F35]/60 p-3 rounded-xl border border-[#0A5C4D]">
                <div className="text-[10px] text-[#C9A646] uppercase font-bold tracking-wider">
                  24x7 Janazah / Emergency Helpline
                </div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  +91 98470 12345
                </div>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-stone-400">Office Desk:</span>{' '}
                  <span className="font-mono font-medium text-white">0495 2721234</span>
                </div>
                <div>
                  <span className="text-stone-400">Secretary:</span>{' '}
                  <span className="font-mono font-medium text-white">+91 94471 98765</span>
                </div>
                <div>
                  <span className="text-stone-400">Email:</span>{' '}
                  <span className="text-stone-200">office@maheallmasjid.org</span>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-stone-300">Mundupara Muhiyudheen Juma Masjid Complex,</p>
                <p className="text-stone-400">Main Road, Calicut, Kerala - 673001</p>
                <a
                  href="https://maps.google.com/?q=11.2588,75.7804"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#C9A646] hover:underline text-[11px] mt-1 font-semibold"
                >
                  View on Google Maps &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Office Timings & Working Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#C9A646] uppercase tracking-wider">
              Mahal Office Hours
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="space-y-1 bg-[#063F35]/40 p-3 rounded-xl border border-[#0A5C4D]/60">
                <div className="text-white font-medium">Monday to Saturday</div>
                <div className="text-stone-300">Morning: 09:00 AM – 01:00 PM</div>
                <div className="text-stone-300">Evening: 04:30 PM – 08:30 PM</div>
              </div>

              <div className="space-y-1 bg-[#063F35]/40 p-3 rounded-xl border border-[#0A5C4D]/60">
                <div className="text-[#C9A646] font-medium">Friday (Jumu&apos;ah)</div>
                <div className="text-stone-300">After Jumu&apos;ah to 03:30 PM</div>
              </div>

              <p className="text-[11px] text-stone-400 pt-1">
                Madrasa academic sessions run daily from 06:30 AM to 08:30 AM under SKIMVB syllabus.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>
            &copy; {currentYear} Mundupara Muhiyudheen Juma Masjid Mahal Jama&apos;ath. DPDPA 2023 Compliant.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/admin" className="hover:text-stone-200 transition">
              Committee Login
            </Link>
            <span>•</span>
            <Link href="/verify" className="hover:text-stone-200 transition">
              QR Verification
            </Link>
            <span>•</span>
            <span className="text-[#C9A646] font-medium">
              MAHEALL Digital System
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
