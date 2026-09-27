# React SSR example

`createI18n` is intentionally request-scoped. The same pattern works with React's streaming APIs or `renderToString`:

```tsx
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createI18n, I18nProvider, T } from '@gratise/i18n';

export function renderPage(locale: string) {
  const i18n = createI18n({ locale, fallbackLocale: 'en', messages: { en, fr } });
  return renderToString(createElement(I18nProvider, { i18n }, createElement(T, null, 'Welcome')));
}
```

Avoid keeping a mutable active locale in a server-wide singleton. Create one translator per request, and serialize that request's locale and catalogs for client hydration.
