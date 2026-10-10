import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isThemePreference,
  readThemePreference,
  type ThemePreference,
} from '../../theme/preference.ts';

export default function ThemePicker() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    setPreference(readThemePreference());
    const synchronize = (event: StorageEvent) => {
      if (event.key === 'color-theme' || event.key === null)
        setPreference(readThemePreference());
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);

  useEffect(() => {
    if (preference === null) return;
    const system = matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      const dark =
        preference === 'dark' || (preference === 'system' && system.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    update();
    system.addEventListener('change', update);
    return () => system.removeEventListener('change', update);
  }, [preference]);

  function choose(value: string) {
    if (!isThemePreference(value)) return;
    setPreference(value);
    try {
      localStorage.setItem('color-theme', value);
    } catch {
      // The current page still changes theme when persistence is blocked.
    }
  }

  return (
    <div className="mt-gutter flex flex-wrap items-center justify-center gap-2 text-caption text-muted">
      <label htmlFor="color-theme">{t('appearance.label')}</label>
      <select
        id="color-theme"
        value={preference ?? 'system'}
        disabled={preference === null}
        onChange={(event) => choose(event.target.value)}
        className="min-h-11 w-[9em] rounded-panel border border-solid border-line bg-page px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <option value="system">{t('appearance.system')}</option>
        <option value="light">{t('appearance.light')}</option>
        <option value="dark">{t('appearance.dark')}</option>
      </select>
    </div>
  );
}
