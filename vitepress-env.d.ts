import type { PageData } from 'vitepress'

declare module 'vue' {
  interface ComponentCustomProperties {
    $frontmatter: PageData['frontmatter']
    $params: PageData['params']
  }
}
