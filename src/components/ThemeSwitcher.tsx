import { Moon, Sun } from 'lucide-react';
import type { ThemePresetId } from '../data/themes';

interface ThemeSwitcherProps {
  activeThemeId: ThemePresetId;
  onSelectTheme: (themeId: ThemePresetId) => void;
}

export function ThemeSwitcher({
  activeThemeId,
  onSelectTheme,
}: ThemeSwitcherProps) {
  const isDark = activeThemeId === 'dark';
  const nextTheme: ThemePresetId = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      data-testid="theme-switcher-button"
      onClick={() => onSelectTheme(nextTheme)}
      aria-label={isDark ? '切换为亮色主题' : '切换为深色主题'}
      title={isDark ? '切换为亮色主题' : '切换为深色主题'}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5" aria-hidden="true" />
          <span>亮色</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>深色</span>
        </>
      )}
    </button>
  );
}
