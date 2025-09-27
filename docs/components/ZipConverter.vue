<template>
  <div class="container">
    <div>
      <input @change="onFileChange" type="file" accept=".zip" />
    </div>
    <button :disabled="!selectedFile || processing" @click="processFile" class="action-btn">
      CONVERT
    </button>
    <a :href="downloadUrl ?? undefined" :download="'v4_' + selectedFile?.name">
      <button :disabled="!downloadUrl || processing" class="action-btn alt">
        <span v-if="processing">PROCESSING...</span>
        <span v-else>DOWNLOAD</span>
      </button>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import JSZip from 'jszip'
import { Asset, assetMap } from '../utils/assetMap'

const selectedFile = ref<File | null>(null)
const downloadUrl = ref<string | null>(null)
const processing = ref<boolean>(false)

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedFile.value = file
  revokeDownloadUrl()
}

function revokeDownloadUrl() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value)
  }
  downloadUrl.value = null
}

async function processFile() {
  try {
    if (!selectedFile.value) return
    processing.value = true

    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    const assetBuckets: Record<string, Asset[]> = {}

    const promises: Promise<void>[] = []
    zip.forEach((relativePath, zipEntry) => {
      const mappedAsset = assetMap[relativePath]
      if (!mappedAsset || !zipEntry) return

      const promise = mappedAsset.map(zipEntry).then((assets) => {
        for (const asset of assets) {
          if (!assetBuckets[asset.path]) assetBuckets[asset.path] = []
          assetBuckets[asset.path].push(asset)
        }
      })
      promises.push(promise)
    })
    await Promise.all(promises)

    const newZip = new JSZip()
    for (const [path, assets] of Object.entries(assetBuckets)) {
      let merged = assets[0]
      for (let i = 1; i < assets.length; i++) {
        const asset = assets[i]
        if (asset) {
          merged = merged.mergeStrategy.apply(merged, asset)
        }
      }

      newZip.file(path, merged.data, { binary: true, createFolders: false })
    }

    const newZipBlob = await newZip.generateAsync({ type: 'blob' })
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
    downloadUrl.value = URL.createObjectURL(newZipBlob)
    processing.value = false
  } catch (e) {
    alert('Error processing file:' + e)
    console.error('Error processing file', e)
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
