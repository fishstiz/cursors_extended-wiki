<template>
  <div class="container">
    <div>
      <input @change="onFileChange" :accept="accept" type="file" />
    </div>
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
import { FileProcessor, FileValidationError, FileValidator } from '@/types/FileProcessor'

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

function removeOutput() {
  if (download.value) {
    URL.revokeObjectURL(download.value.url)
  }
  download.value = null
}

async function validateFile(file: File) {
  if (props.validator) {
    try {
      const result = await props.validator(file)
      if (!result.ok) {
        throw new FileValidationError(result.error ?? 'Unknown Error')
      }
    } catch (e) {
      alert(e)
      console.error('Error validating file.', e)
      return false
    }
  }

  return true
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  removeOutput()

  if (!(await validateFile(file))) {
    selectedFile.value = null
    target.value = ''
    return
  }

  selectedFile.value = file
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

async function processFile() {
  try {
    if (!selectedFile.value) return
    processing.value = true
    removeOutput()
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
  row-gap: 10px;
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  margin-bottom: 3rem;
}

input[type='file'] {
  height: 100%;
  font-size: 1rem;
  width: calc(100% - 12px);
  padding: 5px;
  border-radius: 5px;
  outline: dashed 2px var(--vp-c-gray-1);
  box-sizing: content-box;
}

input::file-selector-button {
  padding: 5px 20px;
  border-radius: 5px;
  transition: background-color 200ms;
  font-family: var(--vp-font-family-base);
  font-weight: bold;
  text-transform: uppercase;
  font-size: 14px;
  height: 100%;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: var(--vp-button-brand-border);
  cursor: pointer;
}

input::file-selector-button:hover {
  background-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-hover-text);
}

input::file-selector-button:active {
  background-color: var(--vp-button-brand-active-bg);
  color: var(--vp-button-brand-active-text);
}

.action-btn {
  margin-top: 10px;
  padding: 5px 20px;
  border-radius: 5px;
  transition: background-color 200ms;
  font-weight: bold;
  width: 100%;
  height: 100%;

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
