<template>
  <div class="container">
    <FileInput
      @change="handleChange"
      :accept="accept"
      :validator="validator"
      :disabled="processing"
    />
    <button :disabled="!selectedFile || processing" @click="processFile" class="action-btn">
      {{ actionText ?? 'CONVERT' }}
    </button>
    <a :href="download?.url ?? undefined" :download="download?.fileName ?? undefined">
      <button :disabled="!download || processing" class="action-btn alt">
        {{ processing ? 'PROCESSING...' : 'DOWNLOAD' }}
      </button>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { FileProcessor, FileValidator } from '@/utils/fileValidator'
import FileInput, { ChangeEvent } from './FileInput.vue'

type Download = Readonly<{ fileName: string; url: string }> | null

const props = defineProps<{
  processor: FileProcessor
  actionText?: string
  accept?: string
  validator?: FileValidator
  downloadName?: string | ((fileName: string) => string)
}>()

const selectedFile = ref<File | null>(null)
const download = ref<Download>(null)
const processing = ref<boolean>(false)

function removeDownload() {
  if (download.value) {
    URL.revokeObjectURL(download.value.url)
  }
  download.value = null
}

function generateFilename() {
  if (!selectedFile.value) return 'undefined'

  if (props.downloadName) {
    return typeof props.downloadName === 'string'
      ? props.downloadName
      : props.downloadName(selectedFile.value.name)
  }

  return selectedFile.value.name.replace(/\.(?!.*\.)/, '-converted.')
}

function handleChange(e: ChangeEvent.Post) {
  removeDownload()
  selectedFile.value = e.file
}

async function processFile() {
  try {
    if (!selectedFile.value) return
    processing.value = true
    removeDownload()
    download.value = {
      fileName: generateFilename(),
      url: URL.createObjectURL(await props.processor(selectedFile.value))
    }
    processing.value = false
  } catch (e) {
    alert(e)
    console.error('An error occurred while processing file.', e)
    processing.value = false
  }
}
</script>

<style scoped>
.container {
  display: grid;
  row-gap: 0.67em;
  grid-template-rows: repeat(3, 2.67rem);
}

.action-btn {
  margin-top: 10px;
  padding: 0.33em 1em;
  border-radius: 0.33em;
  transition: background-color 200ms;
  font-weight: bold;
  width: 100%;
  height: 100%;
  font-size: 1rem;

  &:disabled {
    background-color: var(--vp-c-gray-3);
    color: var(--vp-c-gray-1);
    cursor: not-allowed;
  }
  &:enabled {
    background-color: var(--vp-button-brand-bg);
    color: var(--vp-button-brand-text);
    cursor: pointer;

    &:hover {
      background-color: var(--vp-button-brand-hover-bg);
      color: var(--vp-button-brand-hover-text);
    }

    &:active {
      background-color: var(--vp-button-brand-active-bg);
      color: var(--vp-button-brand-active-text);
    }
  }
}

.action-btn.alt {
  &:enabled {
    background-color: var(--vp-button-alt-bg);
    color: var(--vp-button-alt-text);

    &:hover {
      background-color: var(--vp-button-alt-hover-bg);
      color: var(--vp-button-alt-hover-text);
    }

    &:active {
      background-color: var(--vp-button-alt-active-bg);
      color: var(--vp-button-alt-active-text);
    }
  }
}
</style>
