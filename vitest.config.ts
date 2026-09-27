import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/i18n/tests/**/*.test.ts', 'packages/i18n/tests/**/*.test.tsx'],
  },
});
