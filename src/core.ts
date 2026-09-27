import { IntlMessageFormat } from 'intl-messageformat';

export type MessageValues = Record<string, string | number | Date | boolean | null | undefined>;
export type Messages = Record<string, string>;

export interface I18nOptions {
  locale: string;
  fallbackLocale?: string;
  messages: Readonly<Record<string, Readonly<Messages>>>;
  onMissingKey?: (key: string, locale: string) => void;
}

export interface TranslateOptions {
  locale?: string;
  defaultMessage?: string;
}

export interface I18nInstance {
  readonly locale: string;
  readonly fallbackLocale: string;
  readonly messages: Readonly<Record<string, Readonly<Messages>>>;
  t(key: string, values?: MessageValues, options?: TranslateOptions): string;
  withLocale(locale: string): I18nInstance;
}

function formatMessage(
  message: string,
  locale: string,
  values: MessageValues | undefined,
  cache: Map<string, Map<string, IntlMessageFormat>>,
): string {
  try {
    let byMessage = cache.get(locale);
    if (!byMessage) {
      byMessage = new Map();
      cache.set(locale, byMessage);
    }
    let formatter = byMessage.get(message);
    if (!formatter) {
      formatter = new IntlMessageFormat(message, locale);
      byMessage.set(message, formatter);
    }
    return String(formatter.format(values as Record<string, unknown>));
  } catch {
    return message;
  }
}

/** Creates an immutable translator. Create one per incoming SSR request to isolate locale state. */
export function createI18n(options: I18nOptions): I18nInstance {
  const messages = Object.freeze(
    Object.fromEntries(
      Object.entries(options.messages).map(([language, catalog]) => [
        language,
        Object.freeze({ ...catalog }),
      ]),
    ),
  ) as Readonly<Record<string, Readonly<Messages>>>;
  const formatterCache = new Map<string, Map<string, IntlMessageFormat>>();
  const locale = options.locale;
  const fallbackLocale = options.fallbackLocale ?? options.locale;

  const instance: I18nInstance = {
    locale,
    fallbackLocale,
    messages,
    t(key, values, translateOptions) {
      const activeLocale = translateOptions?.locale ?? locale;
      const localized = messages[activeLocale]?.[key];
      const fallback = messages[fallbackLocale]?.[key];
      const template = localized ?? fallback ?? translateOptions?.defaultMessage ?? key;
      if (localized === undefined && fallback === undefined)
        options.onMissingKey?.(key, activeLocale);
      return formatMessage(template, activeLocale, values, formatterCache);
    },
    withLocale(nextLocale) {
      return createI18n({ ...options, locale: nextLocale });
    },
  };
  return Object.freeze(instance);
}

/** Stateless convenience for call sites that already hold an instance and need its translator. */
export function t(
  i18n: I18nInstance,
  key: string,
  values?: MessageValues,
  options?: TranslateOptions,
): string {
  return i18n.t(key, values, options);
}
