export type ThemePreference = 'system' | 'light' | 'dark';

export function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function readThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem('color-theme');
    if (value && isThemePreference(value)) return value;
  } catch {
    // Storage may be unavailable; the system preference still works.
  }
  return 'system';
}

// Runs in Gatsby's document head before paint. Keep this small and independent
// of React so the same initialization can be used in an Astro layout.
export const themeInitialization = `
(() => {
  let preference = 'system';
  try {
    const stored = localStorage.getItem('color-theme');
    if (stored === 'light' || stored === 'dark') preference = stored;
  } catch {}
  const dark = preference === 'dark' ||
    (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
`;
