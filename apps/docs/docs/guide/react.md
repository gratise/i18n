# React and SSR

Create a translator for each request and pass it through `I18nProvider`. This keeps locale state isolated during concurrent server renders.

```tsx
import { createI18n, I18nProvider, T, useTranslation } from '@gratise/i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';

const i18n = createI18n({
  locale: requestLocale,
  fallbackLocale: 'en',
  messages: { en, fr },
});

<I18nProvider i18n={i18n}>
  <T>Welcome back</T>
  <T id="cart.items" count={itemCount}>
    {`{count, plural, =0 {No items} one {# item} other {# items}}`}
  </T>
</I18nProvider>;
```

Use `useTranslation()` in components. Outside React, call `i18n.t('message.key', { name: 'Ada' })` or the exported `t(i18n, key, values)` helper. For browser hydration, initialize the client with the same locale and catalog snapshot used for server output.
