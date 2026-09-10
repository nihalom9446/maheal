export const colors = {
  // Brand Colors
  primary: '#16a34a',       // Green 600 - Main brand color
  primaryDark: '#15803d',   // Green 700
  primaryLight: '#22c55e',  // Green 500
  primaryMuted: '#dcfce7',  // Green 100
  
  // Emerald Accent
  emerald: '#059669',       // Emerald 600
  emeraldDark: '#064e3b',   // Emerald 900 - Dark Islamic green
  emeraldLight: '#10b981',  // Emerald 500
  emeraldMuted: '#d1fae5',  // Emerald 100

  // Status Colors
  paid: '#16a34a',          // Green for Paid
  paidBg: '#f0fdf4',
  paidBorder: '#bbf7d0',

  unpaid: '#ef4444',        // Red 500 for Unpaid
  unpaidBg: '#fef2f2',
  unpaidBorder: '#fecaca',

  urgent: '#dc2626',        // Red 600 for Urgent / Janazah
  urgentBg: '#fff1f2',
  urgentBorder: '#fca5a5',

  warning: '#f59e0b',       // Amber 500
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',

  info: '#3b82f6',          // Blue 500
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',

  // Neutrals
  background: '#f8fafc',    // Slate 50
  surface: '#ffffff',       // Pure white card background
  surfaceSubtle: '#f1f5f9', // Slate 100
  
  textPrimary: '#0f172a',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94a3b8',     // Slate 400
  textLight: '#ffffff',
  
  border: '#e2e8f0',        // Slate 200
  borderDark: '#cbd5e1',    // Slate 300
  
  // Specialized Islamic gold/amber accents
  gold: '#d97706',          // Amber 600
  goldMuted: '#fef3c7',     // Amber 100
  goldDark: '#92400e',      // Amber 800
} as const;

export type ColorKey = keyof typeof colors;
