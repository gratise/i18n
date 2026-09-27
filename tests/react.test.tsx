/** @vitest-environment jsdom */
import React, { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createI18n } from '../src/core.js';
import { I18nProvider, T } from '../src/react.js';

describe('React SSR', () => {
  it('renders translated messages and plural values', () => {
    const i18n = createI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: {
          Hello: 'Hello',
          '{count, plural, one {# item} other {# items}}':
            '{count, plural, one {# item} other {# items}}',
        },
        fr: {
          Hello: 'Bonjour',
          '{count, plural, one {# item} other {# items}}':
            'Il y a {count, plural, one {# article} other {# articles}}',
        },
      },
    });
    const html = renderToString(
      <I18nProvider i18n={i18n}>
        <>
          <T>Hello</T>
          <T count={3}>{'{count, plural, one {# item} other {# items}}'}</T>
        </>
      </I18nProvider>,
    );
    expect(html).toContain('Bonjour');
    expect(html).toContain('Il y a 3 articles');
  });

  it('keeps locale isolated for parallel request renders', () => {
    const messages = { en: { hello: 'Hello' }, fr: { hello: 'Bonjour' } };
    const render = (locale: string) =>
      renderToString(
        <I18nProvider i18n={createI18n({ locale, messages })}>
          <T id="hello">Hello</T>
        </I18nProvider>,
      );
    expect([render('en'), render('fr')]).toEqual(['Hello', 'Bonjour']);
  });

  it('hydrates markup with the same locale and message catalog used by SSR', async () => {
    const i18n = createI18n({
      locale: 'fr',
      messages: { fr: { greeting: 'Bonjour' } },
    });
    const tree = (
      <I18nProvider i18n={i18n}>
        <T id="greeting">Hello</T>
      </I18nProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    let root: ReturnType<typeof hydrateRoot> | null = null;
    await act(async () => {
      root = hydrateRoot(container, tree);
    });
    expect(container.textContent).toBe('Bonjour');
    expect(error).not.toHaveBeenCalled();
    await act(async () => root?.unmount());
    error.mockRestore();
  });
});
