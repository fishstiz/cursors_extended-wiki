<template>
  <a
    :href="projectFile.downloadUrl"
    :class="{
      modrinth: projectFile.provider === 'modrinth',
      curseforge: projectFile.provider === 'curseforge'
    }"
    class="btn provider-link"
    target="_blank"
  >
    <span class="provider-filename">
      {{ projectFile.fileName }}
    </span>
    <DownloadIcon class="provider-download-icon" />
  </a>
  <div class="convert">
    <span> Convert: </span>

    <select v-model="conversionTarget" class="btn version-selector">
      <option value="" disabled>Select a version</option>
      <option
        v-for="version in gameVersions"
        :value="version"
        :disabled="projectFile.gameVersions.includes(version)"
      >
        {{ version }}
      </option>
    </select>
    <button :disabled="!convertible" @click="convertFile" class="btn convert-btn">
      {{
        converting ? 'Converting...' : convertDirection === 'downgrade' ? 'Downgrade' : 'Upgrade'
      }}
    </button>
    <a
      :href="convertedDownload?.url"
      :download="convertedDownload?.fileName"
      class="btn convert-download-link"
    >
      <button :disabled="!convertedDownload" class="btn convert-btn">
        <DownloadIcon class="convert-download-icon" />
      </button>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useSupportedGameVersions } from '@/composables/supported-versions'
import type { ProjectFile } from '@/schema/project'
import { MapDirection, processArrayBuffer } from '@/tools/v3-mapper'
import { compareVersions } from '@/utils/game-versions'
import { proxy, req } from '@/utils/request'
import { computed, onUnmounted, ref } from 'vue'
import DownloadIcon from './DownloadIcon.vue'

type ConvertedDownload = {
  id: string
  version: string
  url: string
  fileName: string
}

const { projectFile, preferredGameVersion } = defineProps<{
  projectFile: ProjectFile
  preferredGameVersion?: string
}>()

const { gameVersions } = useSupportedGameVersions()

const convertedDownload = ref<ConvertedDownload | null>(null)
const converting = ref<boolean>(false)
const conversionTarget = ref<string>(gameVersions.value[0] || '')
const convertDirection = computed<MapDirection | null>(() => {
  if (!conversionTarget.value) return null
  return compareVersions(
    conversionTarget.value,
    preferredGameVersion ?? projectFile.gameVersions[0]
  ) >= 0
    ? 'upgrade'
    : 'downgrade'
})
const convertible = computed<boolean>(
  () =>
    !!convertDirection.value &&
    !converting.value &&
    (convertedDownload.value?.id !== projectFile.id ||
      convertedDownload.value?.version !== conversionTarget.value)
)

let controller: AbortController | null = null

function removeDownload() {
  if (controller != null) {
    controller.abort()
  }
  if (convertedDownload.value) {
    URL.revokeObjectURL(convertedDownload.value.url)
  }
  convertedDownload.value = null
}

async function convertFile() {
  if (!convertible.value || !convertDirection.value) {
    return
  }

  converting.value = true

  removeDownload()

  try {
    controller = new AbortController()
    const response = await proxy(projectFile.downloadUrl, {
      signal: controller.signal
    })
    const buffer = await response.arrayBuffer()
    const converted = await processArrayBuffer(convertDirection.value)(buffer)

    convertedDownload.value = {
      id: projectFile.id,
      version: conversionTarget.value,
      fileName: projectFile.fileName.replace(/\.(?!.*\.)/, '-converted.'),
      url: URL.createObjectURL(converted)
    }

    converting.value = false
  } catch (e) {
    converting.value = false
    alert(e)
    console.error('An error occurred while processing file.', e)
  }
}

onUnmounted(removeDownload)
</script>

<style scoped>
.btn {
  height: 2.5em;
  width: 100%;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-family: inherit;
  font-size: 1rem;

  transition:
    border-color 200ms,
    background-color 200ms,
    color 200ms;

  &:enabled {
    cursor: pointer;
  }
}

.version-selector {
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);

  &:disabled {
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
  }

  &:enabled:hover {
    border-color: var(--vp-c-brand-1);
  }
}

.provider-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  background-color: var(--vp-button-alt-bg);
  border: 1px solid var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  fill: var(--vp-button-alt-text);

  &:hover {
    &.modrinth {
      background-color: #1bd96a;
      color: black;
      fill: black;
    }
    &.curseforge {
      background-color: #ff784d;
      color: #e5e5e5;
      color: #e5e5e5;
    }
  }

  & .provider-filename {
    display: inline-block;
    flex: 1;
    line-height: 2em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  & .provider-download-icon {
    width: 20px;
    height: 20px;
    display: inline-block;
    margin-left: auto;
  }
}

.convert {
  display: flex;
  align-items: center;
  gap: 1em;
}

.convert-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  &:enabled {
    background-color: var(--vp-button-brand-bg);
    fill: var(--vp-button-brand-text);
    color: var(--vp-button-brand-text);
    cursor: pointer;
  }

  &:enabled:hover {
    background-color: var(--vp-button-brand-hover-bg);
    fill: var(--vp-button-brand-hover-text);
    color: var(--vp-button-brand-hover-text);
  }

  &:disabled {
    background-color: var(--vp-c-gray-3);
    fill: var(--vp-c-gray-1);
    color: var(--vp-c-gray-1);
    cursor: not-allowed;
  }
}

.convert-download-link {
  width: fit-content;
  padding: 0;
}

.convert-download-icon {
  width: 20px;
  height: 20px;
}
</style>
