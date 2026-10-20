import React, { useState } from 'react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { DEFAULT_OPTIONS } from '../../../src/i18n/constants.ts';
import ThemePicker from '../../../src/components/ThemePicker/ThemePicker.tsx';

export default function Appearance({ language }: { language: string }) {
  const [translations] = useState(() => {
    const instance = i18next.createInstance();
    void instance.init({
      ...DEFAULT_OPTIONS.i18nextConfig,
      lng: language,
      initAsync: false,
    });
    return instance;
  });
  return (
    <I18nextProvider i18n={translations}>
      <ThemePicker />
    </I18nextProvider>
  );
}
