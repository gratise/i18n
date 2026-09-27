import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createI18n, I18nProvider, T } from '@gratise/i18n';

const messages = {
  en: {
    'home.title': 'Welcome back',
    cart: '{count, plural, =0 {Your cart is empty} one {# item in your cart} other {# items in your cart}}',
  },
  fr: {
    'home.title': 'Bon retour',
    cart: '{count, plural, =0 {Votre panier est vide} one {# article dans votre panier} other {# articles dans votre panier}}',
  },
};

function Page({ locale, count }) {
  const i18n = createI18n({ locale, fallbackLocale: 'en', messages });
  return createElement(
    I18nProvider,
    { i18n },
    createElement(
      'main',
      null,
      createElement('h1', null, createElement(T, { id: 'home.title' }, 'Welcome back')),
      createElement(
        'p',
        null,
        createElement(
          T,
          { id: 'cart', count },
          '{count, plural, =0 {Your cart is empty} one {# item in your cart} other {# items in your cart}}',
        ),
      ),
    ),
  );
}

for (const locale of ['en', 'fr']) {
  console.log(`${locale}: ${renderToString(createElement(Page, { locale, count: 2 }))}`);
}
