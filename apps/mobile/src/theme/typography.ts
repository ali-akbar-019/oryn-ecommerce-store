import { Platform } from 'react-native';

export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  display: { fontSize: 36, lineHeight: 42, fontWeight: '600' as const, letterSpacing: -1.2 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const }
} as const;
