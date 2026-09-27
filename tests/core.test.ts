import { describe, expect, it, vi } from 'vitest';
import { createI18n, t } from '../src/core.js';

describe('translator', () => {
  const messages = {
    en: { greeting: 'Hello, {name}!', items: '{count, plural, one {# item} other {# items}}' },
    fr: { greeting: 'Bonjour, {name}!' },
  };

  it('uses locale messages and ICU parameters', () => {
    const i18n = createI18n({ locale: 'en', messages });
    expect(i18n.t('greeting', { name: 'Ada' })).toBe('Hello, Ada!');
    expect(i18n.t('items', { count: 2 })).toBe('2 items');
    expect(t(i18n, 'greeting', { name: 'Lin' })).toBe('Hello, Lin!');
  });

  it('falls back without sharing locale state between instances', () => {
    const base = createI18n({ locale: 'en', fallbackLocale: 'en', messages });
    const french = base.withLocale('fr');
    expect(french.t('greeting', { name: 'Ada' })).toBe('Bonjour, Ada!');
    expect(french.t('items', { count: 1 })).toBe('1 item');
    expect(base.locale).toBe('en');
  });

  it('returns source text and reports missing keys', () => {
    const onMissingKey = vi.fn();
    const i18n = createI18n({ locale: 'en', messages: {}, onMissingKey });
    expect(i18n.t('Save changes')).toBe('Save changes');
    expect(onMissingKey).toHaveBeenCalledWith('Save changes', 'en');
  });
});
