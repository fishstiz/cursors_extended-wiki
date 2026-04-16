// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme, PageData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { LiteTree } from '@lite-tree/vue'
import vitepressNprogress from 'vitepress-plugin-nprogress'
import 'vitepress-plugin-nprogress/lib/css/index.css'
import 'virtual:group-icons.css'
import './style.css'
import './lite-tree.css'

declare module 'vue' {
  interface ComponentCustomProperties {
    $frontmatter: PageData['frontmatter']
    $params: PageData['params']
  }
}

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp(ctx) {
    vitepressNprogress(ctx)
    const { app } = ctx

    app.component('LiteTree', LiteTree)
  }
} satisfies Theme
