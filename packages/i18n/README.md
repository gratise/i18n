# @gratise/i18n

React internationalization with SSR, ICU MessageFormat, JSON catalogs, and an extraction/translation CLI.

## Install

```sh
pnpm add @gratise/i18n
```

React and React DOM 19 or newer are peer dependencies. Node.js 24 or newer is required for the CLI.

## React and SSR

```tsx
import { createI18n, I18nProvider, T } from '@gratise/i18n';

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: { welcome: 'Welcome back' }, fr: { welcome: 'Bon retour' } },
});

<I18nProvider i18n={i18n}>
  <T id="welcome">Welcome back</T>
  <T count={3}>{'{count, plural, one {# item} other {# items}}'}</T>
</I18nProvider>;
```

Create a translator for every incoming server request and use that same locale/catalog snapshot when hydrating in the browser. `i18n.t(key, values)` and `t(i18n, key, values)` are available outside React.

## Extract and translate catalogs

Create `i18n.config.json`:

```json
{
  "sourceLocale": "en",
  "locales": ["en", "fr"],
  "source": ["src/**/*.{ts,tsx}"],
  "output": "src/locales",
  "translation": { "provider": "deepl", "apiKeyEnv": "DEEPL_API_KEY" }
}
```

```sh
npx gratise-i18n extract
npx gratise-i18n extract --watch
npx gratise-i18n extract --watch --translate
npx gratise-i18n translate fr
```

Extraction recognizes `<T>literal source text</T>`, `<T id="stable.key">literal source text</T>`, `i18n.t('literal key')`, and `t(i18n, 'literal key')`. Catalog entries are added without removing hand-maintained strings. The translator command fills untranslated values and leaves edited target messages in place. Supported providers: OpenAI, Google Cloud Translation, and DeepL. API keys are read from the configured environment variable by the CLI.

`extract --watch` updates source catalogs; add `--translate` to also send newly untranslated messages to the configured provider whenever source files change.

## Development

```sh
corepack pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

The Rspack build emits ESM and CommonJS bundles plus TypeScript declarations. Documentation lives in `apps/docs`, and a runnable SSR example lives in `examples/ssr`. GitHub Actions publishes the docs to GitHub Pages and manages package releases through Changesets.

See [Contributing](CONTRIBUTING.md) for commit and test conventions, and [Publishing setup](PUBLISHING.md) for the one-time npm/GitHub configuration required from the repository owner.

## License

MIT
