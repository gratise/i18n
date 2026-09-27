# Translation providers

The CLI includes OpenAI, Google Cloud Translation, and DeepL adapters. Configure one in `i18n.config.json`, then provide the corresponding API key through an environment variable:

```json
{ "translation": { "provider": "openai", "apiKeyEnv": "OPENAI_API_KEY", "model": "gpt-4o-mini" } }
```

For a custom provider, implement the public `TranslationProvider` contract from `@gratise/i18n/providers` and call its `translate(texts, sourceLocale, targetLocale)` method from your own tooling. Review generated text in the JSON catalogs before release.
