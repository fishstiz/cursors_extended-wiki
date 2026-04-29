<template>
  <div class="container">
    <div class="list-header">
      <div class="list-controls">
        <div class="sort-group">
          <label for="sort">Sort by:</label>
          <select
            id="sort"
            v-model="sortKey"
            :disabled="projects.length === 0"
            class="sort-selection list-control-btn"
          >
            <option value="none">None</option>
            <option value="downloads">Downloads</option>
            <option value="published">Date Published</option>
            <option value="modified">Date Modified</option>
          </select>
          <button
            @click="toggleOrder"
            :disabled="projects.length === 0"
            class="sort-order list-control-btn"
          >
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
      <span v-show="!loading" class="project-count">
        {{ projects.length > 0 ? `${projects.length} projects` : 'No projects found' }}
      </span>
    </div>

    <div class="project-container">
      <div v-if="loading" v-for="i in showcaseData.packs.length" :key="i" class="project skeleton">
        <div class="project-icon skeleton-box"></div>
        <div class="project-content">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line desc"></div>
          <div class="skeleton-line desc short"></div>
        </div>
        <div class="project-footer">
          <div class="skeleton-line footer"></div>
        </div>
      </div>
      <div v-else v-for="project in projects" :key="project.name" class="project">
        <img
          class="project-icon"
          width="128px"
          :src="project.icon ?? `https://placehold.co/128x128?text=${project.name}`"
          :alt="project.name"
        />
        <div class="project-content">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
        </div>
        <div class="project-footer">
          <span class="project-author">{{ project.author }}</span>
          <div class="project-links">
            <a v-if="project.modrinthUrl" :href="project.modrinthUrl" target="_blank">Modrinth</a>
            <a v-if="project.curseforgeUrl" :href="project.curseforgeUrl" target="_blank">Curseforge</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as showcaseData } from '@/data/showcase.data'
import { useShowcaseProjects } from '@/composables/showcase-projects'

const { loading, projects: fetchedProjects } = useShowcaseProjects()

type SortKey = 'none' | 'downloads' | 'published' | 'modified'
const sortKey = ref<SortKey>('none')
const sortOrder = ref<'asc' | 'desc'>('desc')

const projects = computed(() => {
  if (sortKey.value === 'none') {
    return sortOrder.value === 'desc' ? fetchedProjects.value : fetchedProjects.value.toReversed()
  }

  return [...fetchedProjects.value].sort((a, b) => {
    if (sortKey.value === 'none') return 0

    let modifier = sortOrder.value === 'asc' ? 1 : -1
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]

    if (valA instanceof Date && valB instanceof Date) {
      return (valA.getTime() - valB.getTime()) * modifier
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * modifier
    }

    return 0
  })
})

const toggleOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}
</script>

<style scoped>
.container {
  margin: 2em 0 2em 0;
}

/** list header */

.list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 2em;
  row-gap: 1em;
  margin-bottom: 1em;
}

.list-controls {
  margin-right: auto;
}

.sort-group {
  display: flex;
  align-items: center;
  column-gap: 0.5em;
}

.list-control-btn {
  font-family: inherit;
  font-size: 1em;
  transition:
    border-color 200ms,
    background-color 200ms,
    color 200ms;

  &:enabled {
    cursor: pointer;
  }

  &:disabled {
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-default-soft);
  }

  &:enabled:hover {
    border-color: var(--vp-c-brand-1);
  }
}

.sort-selection {
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  color: var(--vp-c-text-1);
}

.sort-order {
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
}

.project-count {
  font-size: 1em;
}

/** project */

.project-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
  gap: 1rem;
}

.project {
  --icon-size: clamp(72px, 128px, 20svw);
  container-type: inline-size;
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  column-gap: 1.5em;
  row-gap: 1em;
  padding: 1em;
  background-color: var(--vp-c-bg-alt);
  border-radius: 0.33em;
}

.project-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.project-icon {
  grid-column: 1;
  grid-row: 1 / 3;
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 0.33em;
  object-fit: cover;
  margin: auto;
}

.project-content {
  grid-column: 2;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  row-gap: 0.25em;
}

.project-description {
  margin: 0;
  overflow: hidden;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.project-footer {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  max-width: fit-content;
  align-items: end;
  gap: 0.5em 0.75em;
}

.project-author {
  font-weight: bold;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.75em;

  & a {
    text-decoration: none;
  }
}

@container (width < 480px) {
  .project {
    & .project-name {
      font-size: 1.15em;
    }

    & .project-content {
      grid-row: 1 / 3;
    }

    & .project-footer {
      grid-column: 1 / -1;
    }
  }
}

@container (width < 360px) {
  .project {
    & .project-description {
      line-clamp: 2;
      -webkit-line-clamp: 2;
    }
  }
}

/** skeleton */

.skeleton-box {
  background-color: var(--vp-c-bg-soft);
  border-radius: 0.33em;
}

.skeleton-line {
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  height: 1rem;
}

.skeleton-line.title {
  width: 60%;
  height: 1.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-line.desc {
  width: 100%;
  margin-bottom: 0.4rem;
}

.skeleton-line.desc.short {
  width: 40%;
}

.skeleton-line.footer {
  width: 120px;
  height: 0.85rem;
}

.skeleton .skeleton-box,
.skeleton .skeleton-line {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.skeleton .project-content {
  justify-content: flex-start;
}
</style>
