import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Cursors Extended',
  description: 'Creator Wiki',
  cleanUrls: true,
  base: '/cursors_extended-wiki',
  head: [['link', { rel: 'icon', href: '/cursors_extended-wiki/favicon.ico' }]],
  appearance: 'force-dark',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/resource-pack/getting-started' },
      { text: 'Tools', link: '/tools' }
    ],
    sidebar: [
      {
        text: 'Resource Pack',
        items: [
          {
            text: 'Getting Started',
            link: '/resource-pack/getting-started',
            items: [
              { text: 'Standard Cursors', link: '/resource-pack/getting-started#standard-cursors' },
              { text: 'Extra Cursors', link: '/resource-pack/getting-started#extra-cursors' }
            ]
          },
          {
            text: 'Creating Cursor Textures',
            link: '/resource-pack/creating-cursor-textures',
            items: [
              {
                text: 'Animated Textures',
                link: '/resource-pack/creating-cursor-textures#animated-textures'
              },
              {
                text: 'Cursor Settings',
                link: '/resource-pack/creating-cursor-textures#cursor-settings'
              }
            ]
          }
        ]
      },
      {
        text: 'Java API',
        items: [{ text: 'Ensuring Compatibility', link: '/java-api/ensuring-compatibility' }]
      },
      {
        text: 'Tools',
        link: '/tools',
        items: [{ text: 'V3 Converter', link: '/tools#v3-converter' }]
      }
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    socialLinks: [{ icon: 'github', link: 'https://github.com/fishstiz/cursors_extended-wiki' }],
    footer: {
      message:
        'Licensed under the <a href="https://github.com/fishstiz/cursors_extended-wiki/blob/master/LICENSE" target="_blank">MIT License.</a>',
      copyright:
        'NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.'
    }
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    }
  },
  vite: {
    plugins: [groupIconVitePlugin()]
  },
  vue: {
    template: {
      compilerOptions: {
        whitespace: 'preserve'
      }
    }
  }
})
