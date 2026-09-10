import { TextStyle } from 'react-native';

export const typography = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  // Special labels
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } as TextStyle,
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  arabic: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  } as TextStyle,
} as const;
