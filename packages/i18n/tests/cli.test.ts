import { describe, expect, it } from 'vitest';
import { collectFromFile, mergeCatalog } from '../src/cli.js';

describe('catalog extraction', () => {
  it('extracts JSX text, explicit ids, and t() calls', () => {
    const source = `const a = <><T>Hello world</T><T id="welcome">Welcome back</T></>; const b = t('Save changes'); i18n.t('From instance'); t(i18n, 'From function');`;
    expect(collectFromFile('example.tsx', source)).toEqual([
      { key: 'Hello world', message: 'Hello world' },
      { key: 'welcome', message: 'Welcome back' },
      { key: 'Save changes', message: 'Save changes' },
      { key: 'From instance', message: 'From instance' },
      { key: 'From function', message: 'From function' },
    ]);
  });

  it('keeps interpolated JSX out of message discovery', () => {
    expect(collectFromFile('x.tsx', 'const x = <T>Hello {name}</T>')).toEqual([
      { key: 'Hello', message: 'Hello' },
    ]);
  });

  it('extracts ICU source text supplied as a JSX string expression', () => {
    expect(
      collectFromFile(
        'x.tsx',
        `const count = <T id="cart.items">{'{count, plural, one {# item} other {# items}}'}</T>;`,
      ),
    ).toEqual([{ key: 'cart.items', message: '{count, plural, one {# item} other {# items}}' }]);
  });

  it('adds new source entries without overwriting translations or deleting existing keys', () => {
    expect(
      mergeCatalog({ welcome: 'Bienvenue', retired: 'Retired translation' }, [
        { key: 'welcome', message: 'Welcome' },
        { key: 'new', message: 'New message' },
      ]),
    ).toEqual({ welcome: 'Bienvenue', retired: 'Retired translation', new: 'New message' });
  });
});
