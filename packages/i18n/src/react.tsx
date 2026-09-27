import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { I18nInstance, MessageValues } from './core.js';

const I18nContext = createContext<I18nInstance | null>(null);

export interface I18nProviderProps {
  i18n: I18nInstance;
  locale?: string;
  children: ReactNode;
}

export function I18nProvider({ i18n, locale, children }: I18nProviderProps) {
  const scoped = useMemo(() => (locale ? i18n.withLocale(locale) : i18n), [i18n, locale]);
  return <I18nContext.Provider value={scoped}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nInstance {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error('useI18n must be used inside <I18nProvider>.');
  return i18n;
}

export function useTranslation() {
  const i18n = useI18n();
  return useMemo(() => ({ t: i18n.t, locale: i18n.locale, i18n }), [i18n]);
}

export interface TProps {
  id?: string;
  values?: MessageValues;
  count?: number;
  children: string;
}

/** Literal source text is the key unless a stable id is provided. */
export function T({ id, values, count, children }: TProps) {
  const i18n = useI18n();
  const messageValues = count === undefined ? values : { ...values, count };
  return <>{i18n.t(id ?? children, messageValues, { defaultMessage: children })}</>;
}
