# Catalog CLI

Create `i18n.config.json` in the consuming app:

```json
{
  "sourceLocale": "en",
  "locales": ["en", "fr", "ru"],
  "source": ["src/**/*.{ts,tsx,js,jsx}"],
  "output": "src/locales",
  "translation": { "provider": "deepl", "apiKeyEnv": "DEEPL_API_KEY" }
}
```

Run `npx gratise-i18n extract` to discover `<T>` and `i18n.t('...')` messages. Existing catalog entries are retained, including human edits. Run `npx gratise-i18n extract --watch` during development; when catalogs are imported by the app, Rspack's HMR can reload them. Add `--translate` when you also want new untranslated entries sent to the configured translation provider automatically.

Run `npx gratise-i18n translate fr` to fill missing or still-source-text entries for one locale. Set the configured API key environment variable in your shell or CI. Provider keys are read only by the CLI and never embedded in client code.
