export interface TranslationProvider {
  readonly name: string;
  translate(texts: string[], sourceLocale: string, targetLocale: string): Promise<string[]>;
}

export interface ProviderOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

function requireKey(key: string | undefined, provider: string): string {
  if (!key)
    throw new Error(`${provider} API key is missing. Set the configured environment variable.`);
  return key;
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Translation provider returned HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

export function createOpenAIProvider(options: ProviderOptions = {}): TranslationProvider {
  return {
    name: 'openai',
    async translate(texts, sourceLocale, targetLocale) {
      const key = requireKey(options.apiKey, 'OpenAI');
      const data = await requestJson<{ choices: { message: { content: string } }[] }>(
        options.endpoint ?? 'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model: options.model ?? 'gpt-4o-mini',
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `Translate each string from ${sourceLocale} to ${targetLocale}. Preserve ICU placeholders exactly. Return JSON {"translations":[...]}.`,
              },
              { role: 'user', content: JSON.stringify({ texts }) },
            ],
          }),
        },
      );
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error('OpenAI returned an empty translation response.');
      const result: unknown = JSON.parse(content).translations;
      if (!Array.isArray(result) || result.some((text) => typeof text !== 'string')) {
        throw new Error('OpenAI returned translations in an invalid format.');
      }
      return result;
    },
  };
}

export function createGoogleProvider(options: ProviderOptions = {}): TranslationProvider {
  return {
    name: 'google',
    async translate(texts, sourceLocale, targetLocale) {
      const key = requireKey(options.apiKey, 'Google Cloud Translation');
      const url = new URL(
        options.endpoint ?? 'https://translation.googleapis.com/language/translate/v2',
      );
      url.searchParams.set('key', key);
      const data = await requestJson<{ data: { translations: { translatedText: string }[] } }>(
        url.toString(),
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            q: texts,
            source: sourceLocale,
            target: targetLocale,
            format: 'text',
          }),
        },
      );
      return data.data.translations.map(
        (entry: { translatedText: string }) => entry.translatedText,
      );
    },
  };
}

export function createDeepLProvider(options: ProviderOptions = {}): TranslationProvider {
  return {
    name: 'deepl',
    async translate(texts, sourceLocale, targetLocale) {
      const key = requireKey(options.apiKey, 'DeepL');
      const endpoint =
        options.endpoint ??
        (key.endsWith(':fx')
          ? 'https://api-free.deepl.com/v2/translate'
          : 'https://api.deepl.com/v2/translate');
      const data = await requestJson<{ translations: { text: string }[] }>(endpoint, {
        method: 'POST',
        headers: { authorization: `DeepL-Auth-Key ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          text: texts,
          source_lang: sourceLocale.toUpperCase().split('-')[0]!,
          target_lang: targetLocale.toUpperCase().split('-')[0]!,
        }),
      });
      return data.translations.map((entry: { text: string }) => entry.text);
    },
  };
}
