import { describe, expect, it } from 'vitest';
import {
  createDeepLProvider,
  createGoogleProvider,
  createOpenAIProvider,
} from '../src/providers.js';

describe('translation provider errors', () => {
  it('requires a user-provided key without displaying a key value', async () => {
    await expect(createOpenAIProvider().translate(['Hello'], 'en', 'fr')).rejects.toThrow(
      'OpenAI API key is missing',
    );
    await expect(createGoogleProvider().translate(['Hello'], 'en', 'fr')).rejects.toThrow(
      'Google Cloud Translation API key is missing',
    );
    await expect(createDeepLProvider().translate(['Hello'], 'en', 'fr')).rejects.toThrow(
      'DeepL API key is missing',
    );
  });
});
