import { ref, onMounted, onUnmounted } from 'vue'

interface HighlightedNode {
  node: string,
  regex: RegExp
}

export const commonNodes: Record<string, HighlightedNode> = {
  CURSOR_NAME: {
    node: '&lt;&#8203;cursor-name&#8203;&gt;',
    regex: /(&lt;.cursor-name.&gt;)(?!<)/g
  }
}

export function useLiteTreeHighlighter(regex: RegExp) {
  const tree = ref<Element | null>()

  const updateNodes = () => {
    tree.value?.querySelectorAll('.lite-tree-node > .title')?.forEach((tree) => {
      tree.innerHTML = tree.innerHTML.replace(
        regex,
        '<span style="color: var(--vp-code-color);">$1</span>'
      )
    })
  }

  onMounted(() => {
    tree.value = document.querySelector('.lite-tree')
    tree.value?.addEventListener('click', updateNodes)
    updateNodes()
  })

  onUnmounted(() => {
    tree.value?.removeEventListener('click', updateNodes)
  })

  return { updateNodes }
}
