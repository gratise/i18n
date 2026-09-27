#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import chokidar from 'chokidar';
import { parse } from '@babel/parser';
import fg from 'fast-glob';
import { createDeepLProvider, createGoogleProvider, createOpenAIProvider } from './providers.js';
import type { TranslationProvider } from './providers.js';

interface Config {
  sourceLocale: string;
  locales: string[];
  source?: string[];
  output?: string;
  translation?: {
    provider: 'openai' | 'google' | 'deepl';
    apiKeyEnv?: string;
    endpoint?: string;
    model?: string;
  };
}
interface Extracted {
  key: string;
  message: string;
}

const root = process.cwd();
const configPath = resolve(root, 'i18n.config.json');
const readConfig = async (): Promise<Config> => {
  const config = JSON.parse(await readFile(configPath, 'utf8')) as Config;
  if (!config.sourceLocale || !Array.isArray(config.locales) || config.locales.length === 0) {
    throw new Error('i18n.config.json must define sourceLocale and a non-empty locales array.');
  }
  if (!config.locales.includes(config.sourceLocale)) {
    throw new Error('The locales array must include sourceLocale.');
  }
  return config;
};
const outputRoot = (config: Config) => resolve(root, config.output ?? 'locales');
const readCatalog = async (path: string): Promise<Record<string, string>> => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
};
const writeCatalog = async (path: string, catalog: Record<string, string>) => {
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, `${JSON.stringify(catalog, null, 2)}\n`);
};

function normalizeJsxText(text: string): string {
  return text
    .split('\n')
    .map((line, index, lines) => {
      let value = line.replace(/\t/g, ' ');
      if (index !== 0) value = value.replace(/^ +/, '');
      if (index !== lines.length - 1) value = value.replace(/ +$/, '');
      return value;
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

function collectFromFile(file: string, source: string): Extracted[] {
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx'],
    sourceFilename: file,
  });
  const found = new Map<string, Extracted>();
  const record = (value: unknown): Record<string, unknown> | undefined =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;
  const literalValue = (value: unknown): string | undefined => {
    const item = record(value);
    if (item?.type === 'StringLiteral') return item.value as string;
    if (
      item?.type === 'TemplateLiteral' &&
      Array.isArray(item.expressions) &&
      item.expressions.length === 0
    ) {
      const quasi = record((item.quasis as unknown[])[0]);
      const cooked = record(quasi?.value)?.cooked;
      return typeof cooked === 'string' ? cooked : undefined;
    }
    return undefined;
  };
  const visit = (value: unknown) => {
    const node = record(value);
    if (!node) return;
    if (node.type === 'JSXElement') {
      const opening = record(node.openingElement);
      const tag = record(opening?.name);
      if (tag?.type === 'JSXIdentifier' && tag.name === 'T') {
        const children = Array.isArray(node.children) ? node.children : [];
        const message = normalizeJsxText(
          children
            .map((child) => {
              const part = record(child);
              if (part?.type === 'JSXText') return String(part.value ?? '');
              if (part?.type === 'JSXExpressionContainer')
                return literalValue(part.expression) ?? '';
              return '';
            })
            .join(''),
        );
        const attributes = Array.isArray(opening?.attributes) ? opening.attributes : [];
        const idAttribute = attributes.find((child) => {
          const attr = record(child);
          return attr?.type === 'JSXAttribute' && record(attr.name)?.name === 'id';
        });
        const id = literalValue(record(idAttribute)?.value);
        if (message) found.set(id ?? message, { key: id ?? message, message });
      }
    }
    if (node.type === 'CallExpression') {
      const callee = record(node.callee);
      const property = record(callee?.property);
      const isStandaloneTranslator = callee?.type === 'Identifier' && callee.name === 't';
      const isInstanceTranslator = callee?.type === 'MemberExpression' && property?.name === 't';
      const args = Array.isArray(node.arguments) ? node.arguments : [];
      const message =
        literalValue(args[0]) ?? (isStandaloneTranslator ? literalValue(args[1]) : undefined);
      if ((isStandaloneTranslator || isInstanceTranslator) && message !== undefined) {
        found.set(message, { key: message, message });
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'extra', 'comments'].includes(key)) continue;
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    }
  };
  visit(ast);
  return [...found.values()];
}

export function mergeCatalog(
  existing: Record<string, string>,
  discovered: Extracted[],
): Record<string, string> {
  const merged = { ...existing };
  for (const item of discovered) merged[item.key] ??= item.message;
  return merged;
}

async function sourceFiles(config: Config): Promise<string[]> {
  return fg(config.source ?? ['src/**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}'], {
    cwd: root,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  });
}

async function extract(): Promise<Extracted[]> {
  const config = await readConfig();
  const files = await sourceFiles(config);
  const messages = new Map<string, Extracted>();
  for (const file of files)
    for (const item of collectFromFile(file, await readFile(file, 'utf8')))
      messages.set(item.key, item);
  const list = [...messages.values()].sort((a, b) => a.key.localeCompare(b.key));
  const folder = outputRoot(config);
  for (const locale of config.locales) {
    const path = resolve(folder, `${locale}.json`);
    await writeCatalog(path, mergeCatalog(await readCatalog(path), list));
  }
  console.log(
    `Extracted ${list.length} messages from ${files.length} files into ${config.locales.length} catalogs.`,
  );
  return list;
}

function providerFromConfig(config: Config): TranslationProvider {
  const translation = config.translation;
  if (!translation)
    throw new Error('Add a translation section to i18n.config.json before translating.');
  const key = process.env[translation.apiKeyEnv ?? 'TRANSLATION_API_KEY'];
  const options = { apiKey: key, endpoint: translation.endpoint, model: translation.model };
  if (translation.provider === 'openai') return createOpenAIProvider(options);
  if (translation.provider === 'google') return createGoogleProvider(options);
  return createDeepLProvider(options);
}

async function translate(targetLocale: string) {
  const config = await readConfig();
  if (!config.locales.includes(targetLocale))
    throw new Error(`Locale ${targetLocale} is not listed in i18n.config.json.`);
  if (targetLocale === config.sourceLocale)
    throw new Error('The target locale must differ from sourceLocale.');
  const dir = outputRoot(config);
  const source = await readCatalog(resolve(dir, `${config.sourceLocale}.json`));
  const targetPath = resolve(dir, `${targetLocale}.json`);
  const target = await readCatalog(targetPath);
  const pending = Object.entries(source).filter(
    ([key, value]) => target[key] === undefined || target[key] === value,
  );
  if (!pending.length) {
    console.log(`No untranslated messages for ${targetLocale}.`);
    return;
  }
  const provider = providerFromConfig(config);
  const translated: string[] = [];
  for (let index = 0; index < pending.length; index += 20) {
    translated.push(
      ...(await provider.translate(
        pending.slice(index, index + 20).map(([, value]) => value),
        config.sourceLocale,
        targetLocale,
      )),
    );
  }
  if (translated.length !== pending.length)
    throw new Error(
      `${provider.name} returned ${translated.length} results for ${pending.length} messages.`,
    );
  pending.forEach(([key], index) => {
    const value = translated[index];
    if (typeof value === 'string' && value.trim()) target[key] = value;
  });
  await writeCatalog(targetPath, target);
  console.log(`Translated ${pending.length} messages for ${targetLocale} with ${provider.name}.`);
}

async function translateAllLocales() {
  const config = await readConfig();
  for (const locale of config.locales) {
    if (locale !== config.sourceLocale) await translate(locale);
  }
}

export async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'extract') {
    await extract();
    const shouldTranslate = args.includes('--translate');
    if (shouldTranslate) await translateAllLocales();
    if (args.includes('--watch')) {
      const config = await readConfig();
      let writeQueue = Promise.resolve();
      chokidar
        .watch(config.source ?? ['src/**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}'], {
          cwd: root,
          ignoreInitial: true,
        })
        .on('all', () => {
          writeQueue = writeQueue
            .then(extract)
            .then(() => (shouldTranslate ? translateAllLocales() : undefined))
            .then(() => undefined)
            .catch((error: unknown) => {
              console.error(error instanceof Error ? error.message : error);
            });
        });
      console.log('Watching source files. Your bundler can hot-reload imported locale JSON files.');
    }
    return;
  }
  if (command === 'translate') {
    const locale = args[0];
    if (!locale) throw new Error('Usage: gratise-i18n translate <locale>');
    await translate(locale);
    return;
  }
  console.log('Usage: gratise-i18n <extract [--watch] [--translate] | translate <locale>>');
}

export { collectFromFile, normalizeJsxText };
