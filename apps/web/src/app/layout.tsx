import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Mundupara Muhiyudheen Juma Masjid',
    default: 'Mundupara Muhiyudheen Juma Masjid — Mahal Digital Platform',
  },
  description: 'Official Digital Operating System for Mundupara Muhiyudheen Juma Masjid Mahal community',
  icons: {
    icon: '/mundupara_emblem.png',
    shortcut: '/mundupara_emblem.png',
    apple: '/mundupara_emblem.png',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}