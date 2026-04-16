<template>
  <div class="projects-container">
    <template v-if="loading">
      <div v-for="i in data.packs.length" :key="i" class="project-card skeleton">
        <div class="project-icon skeleton-box"></div>
        <div class="project-details">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line desc"></div>
          <div class="skeleton-line desc short"></div>
          <div class="project-links">
            <div class="skeleton-line link"></div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-for="project in projects" :key="project.name" class="project-card">
        <img
          class="project-icon"
          :src="project.icon ?? `https://placehold.co/128x128?text=${project.name}`"
          :alt="project.name"
        />
        <div class="project-details">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <div class="project-links">
            <span>{{ project.author }}</span>
            <a v-if="project.modrinthUrl" :href="project.modrinthUrl">Modrinth</a>
            <a v-if="project.curseforgeUrl" :href="project.curseforgeUrl">Curseforge</a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { data } from '@/data/showcase.data'
import { useShowcaseProjects } from '@/composables/showcase-projects'

const { projects, loading } = useShowcaseProjects()
</script>

<style scoped>
.projects-container {
  display: grid;
  margin: 2rem 0 2rem 0;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
  --card-size: 128px;
}

.project-card {
  display: grid;
  grid-template-columns: var(--card-size) 1fr;
  gap: 1.5rem;
  padding: 1rem;
  background-color: var(--vp-c-bg-alt);
  border-radius: 0.33em;
}

.project-icon {
  width: var(--card-size);
  height: var(--card-size);
  border-radius: 0.33em;
  object-fit: cover;
}

.project-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: var(--card-size);
}

h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

p {
  margin: 0;
  color: var(--vp-c-text-2);
  flex-grow: 1;
  overflow: hidden;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.project-links {
  display: flex;
  gap: 0.75rem;

  & a {
    font-weight: bold;
    color: var(--vp-c-brand-1);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.skeleton-box {
  background-color: var(--vp-c-bg-soft);
  border-radius: 0.33em;
}

.skeleton-line {
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
  height: 1rem;
  margin-bottom: 0.5rem;

  &.title {
    width: 60%;
    height: 1.25rem;
    margin-bottom: 1rem;
  }

  &.desc {
    width: 90%;

    &.short {
      width: 40%;
    }
  }

  &.link {
    width: 30%;
    margin-top: auto;
    margin-bottom: 0;
  }
}

.skeleton .skeleton-box,
.skeleton .skeleton-line {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.skeleton .project-details {
  justify-content: flex-start;
}
</style>
