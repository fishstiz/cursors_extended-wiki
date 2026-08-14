<template>
  <dialog
    id="download-dialog"
    ref="dialogRef"
    class="download-dialog"
    @close="closeModal"
    @keydown.esc="closeModal"
  >
    <div class="modal-container">
      <div class="modal-header">
        <img
          class="project-icon"
          width="32px"
          :src="project.icon ?? `https://placehold.co/128x128?text=${project.name}`"
          :alt="project.name"
        />
        <span class="project-name">{{ project.name }}</span>
        <button class="close-btn" commandfor="download-dialog" command="close" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
            <path
              d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <hr />

        <strong>Minecraft Version:</strong>
        <select
          v-model="selectedGameVersion"
          :disabled="loadingVersions || !gameVersions.length"
          class="btn version-selector"
          autofocus
        >
          <option value="" disabled>
            {{
              loadingVersions
                ? 'Loading versions...'
                : gameVersions.length
                  ? 'Select a version'
                  : 'No versions available'
            }}
          </option>

          <option v-for="version in gameVersions" :key="version" :value="version">
            {{ version }}
          </option>
        </select>

        <hr v-if="projectFiles.modrinth" />

        <div v-if="projectFiles.modrinth" class="provider-download">
          <strong>Modrinth Download:</strong>
          <DownloadProjectFile
            :project-file="projectFiles.modrinth"
            :preferred-game-version="selectedGameVersion"
          />
        </div>

        <hr v-if="projectFiles.curseforge" />

        <div v-if="projectFiles.curseforge" class="provider-download">
          <strong>CurseForge Download:</strong>
          <DownloadProjectFile
            :project-file="projectFiles.curseforge"
            :preferred-game-version="selectedGameVersion"
          />
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useProjectFiles } from '@/composables/project-files'
import type { Project, ProjectFile, Provider } from '@/schema/project'
import { computed, onMounted, ref } from 'vue'
import DownloadProjectFile from './DownloadProjectFile.vue'
import { compareVersions, isSnapshotVersion } from '@/utils/game-versions.js'

const { project } = defineProps<{ project: Project }>()

const emit = defineEmits(['close'])

const dialogRef = ref<HTMLDialogElement | null>(null)

const modrinthFiles = useProjectFiles('modrinth', project)
const curseforgeFiles = useProjectFiles('curseforge', project)
const selectedGameVersion = ref<string>('')

const loadingVersions = computed(() => {
  return modrinthFiles.loading.value || curseforgeFiles.loading.value
})

const gameVersions = computed<string[]>(() => {
  const versions = new Set<string>()
  modrinthFiles.files.value.forEach((file) => {
    file.gameVersions.forEach((version) => {
      if (!isSnapshotVersion(version)) {
        versions.add(version)
      }
    })
  })
  curseforgeFiles.files.value.forEach((file) => {
    file.gameVersions.forEach((version) => {
      if (!isSnapshotVersion(version)) {
        versions.add(version)
      }
    })
  })
  return Array.from(versions).sort((a, b) => compareVersions(b, a))
})

const projectFiles = computed<Record<Provider, ProjectFile | null>>(() => {
  return {
    modrinth: selectedGameVersion.value
      ? modrinthFiles.files.value
          .filter((file) => file.gameVersions.includes(selectedGameVersion.value))
          .toSorted((a, b) => b.published.getTime() - a.published.getTime())[0]
      : null,
    curseforge: selectedGameVersion.value
      ? curseforgeFiles.files.value
          .filter((file) => file.gameVersions.includes(selectedGameVersion.value))
          .toSorted((a, b) => b.published.getTime() - a.published.getTime())[0]
      : null
  }
})

function closeModal() {
  dialogRef.value?.close()
  emit('close')
}

onMounted(() => {
  dialogRef.value?.showModal()
})
</script>

<style scoped>
.download-dialog {
  width: min(90vw, 500px);
  background-color: var(--vp-c-bg-alt);
  border-radius: 8px;
  padding: 0;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  color: var(--vp-c-text-1);
}

.download-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

hr {
  margin: 0.125rem 0;
}

.modal-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.modal-header {
  font-weight: bold;
  font-size: 1.25rem;
  display: flex;
  gap: 1em;
  align-items: center;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.btn {
  height: 2.5em;
  width: 100%;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-family: inherit;
  font-size: 1em;

  transition:
    border-color 200ms,
    background-color 200ms,
    color 200ms;

  &:enabled {
    cursor: pointer;
  }
}

.close-btn {
  margin-left: auto;
  background-color: transparent;
  border: transparent;

  &:enabled {
    cursor: pointer;
  }

  & svg {
    width: 1.25em;
    height: auto;
    fill: var(--vp-button-alt-text);
    transition: filter 200ms;
  }

  &:enabled:hover > svg {
    filter: brightness(1.2);
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

.provider-download {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.provider-link {
  line-height: 2em;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  background-color: var(--vp-button-alt-bg);
  border: 1px solid var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);

  &:hover {
    &.modrinth {
      background-color: #1bd96a;
      color: black;
    }
    &.curseforge {
      background-color: #ff784d;
      color: #e5e5e5;
    }
  }
}
</style>
