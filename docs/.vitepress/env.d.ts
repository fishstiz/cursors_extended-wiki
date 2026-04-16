declare module '*.css'

declare module 'vitepress-plugin-nprogress' {
  import type { EnhanceAppContext } from 'vitepress'
  const vitepressNprogress: (ctx: EnhanceAppContext) => any
  export default vitepressNprogress
}
