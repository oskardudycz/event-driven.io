import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDesktop, FaMoon, FaSun } from 'react-icons/fa';
import * as styles from './ThemePicker.module.css';
import {
  isThemePreference,
  readThemePreference,
  type ThemePreference,
} from '../../theme/preference.ts';

const choices = [
  { value: 'light', Icon: FaSun },
  { value: 'dark', Icon: FaMoon },
  { value: 'system', Icon: FaDesktop },
] as const;

export default function ThemePicker() {
  const { t } = useTranslation();
  const [preference, setPreference] = useState<ThemePreference | null>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        disclosure.current &&
        !disclosure.current.contains(event.target)
      )
        disclosure.current.open = false;
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, []);

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
    close();
  }

  function close() {
    if (disclosure.current) disclosure.current.open = false;
    trigger.current?.focus();
  }

  const Icon =
    choices.find(({ value }) => value === preference)?.Icon ?? FaDesktop;

  return (
    <details
      ref={disclosure}
      className="absolute top-1/2 right-2.5 z-20 -translate-y-1/2 min-[1024px]:relative min-[1024px]:top-auto min-[1024px]:right-auto min-[1024px]:ml-2.5 min-[1024px]:shrink-0 min-[1024px]:translate-y-0"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          event.currentTarget.open = false;
      }}
    >
      <summary
        ref={trigger}
        aria-label={t('appearance.label')}
        aria-disabled={preference === null}
        title={`${t('appearance.label')}: ${t(`appearance.${preference ?? 'system'}`)}`}
        tabIndex={preference === null ? -1 : 0}
        onClick={(event) => {
          if (preference === null) event.preventDefault();
        }}
        className={`${styles.trigger} flex size-11 cursor-pointer list-none items-center justify-center rounded-panel text-[color:var(--theme-trigger-color)] hover:bg-[var(--color-brand-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        <Icon aria-hidden="true" size={20} />
      </summary>
      <fieldset
        disabled={preference === null}
        className="absolute top-full right-0 mt-1 w-40 rounded-panel border border-solid border-line bg-page p-2 text-caption text-ink shadow-lg"
      >
        <legend className="sr-only">{t('appearance.label')}</legend>
        {choices.map(({ value, Icon: ChoiceIcon }) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-panel px-2 hover:bg-[var(--color-brand-tint)]"
          >
            <input
              type="radio"
              name="color-theme"
              value={value}
              checked={preference === value}
              onChange={() => choose(value)}
              className="accent-accent"
            />
            <ChoiceIcon aria-hidden="true" />
            {t(`appearance.${value}`)}
          </label>
        ))}
      </fieldset>
    </details>
  );
}
