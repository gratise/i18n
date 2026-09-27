import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: 'docs',
  title: '@gratise/i18n',
  description: 'React internationalization with SSR and translation tooling',
  base: '/i18n/',
  themeConfig: {
    socialLinks: [{ icon: 'GitHub', mode: 'link', content: 'https://github.com/gratise/i18n' }],
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'SSR and React', link: '/guide/react' },
            { text: 'Catalog CLI', link: '/guide/cli' },
            { text: 'Translation providers', link: '/guide/providers' },
          ],
        },
      ],
      '/examples/': [{ text: 'Examples', items: [{ text: 'React SSR', link: '/examples/' }] }],
    },
  },
});
