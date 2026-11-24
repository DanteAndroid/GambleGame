export type ThemePresetId = 'dark' | 'light';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  isDark: boolean;
}

export const DEFAULT_THEME_ID: ThemePresetId = 'dark';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dark',
    name: '深色',
    isDark: true,
  },
  {
    id: 'light',
    name: '亮色',
    isDark: false,
  },
];

export function isValidThemePresetId(value: unknown): value is ThemePresetId {
  return value === 'dark' || value === 'light';
}

export function normalizeThemePresetId(value: unknown): ThemePresetId {
  if (value === 'light' || value === 'archival-paper') {
    return 'light';
  }
  return 'dark';
}
