import { CurseforgeProjectFile } from '@/schema/curseforge-project'
import { ModrinthProjectVersion } from '@/schema/modrinth-project'
import { Project, ProjectFile, Provider } from '@/schema/project'
import { reqJson } from '@/utils/request'
import { onMounted, onUnmounted, ref } from 'vue'
import z from 'zod'

const projectFilesCache: Record<string, ProjectFile[]> = {}

const modrinthProjectFilesSchema = ModrinthProjectVersion.array()
  .nullish()
  .transform((val) => val ?? [])

const curseforgeProjectFilesSchema = z.object({
  data: CurseforgeProjectFile.array()
    .nullish()
    .transform((val) => val ?? [])
})

async function fetchModrinthProjectFiles(
  projectId: string,
  signal?: AbortSignal
): Promise<ProjectFile[]> {
  if (projectFilesCache[projectId]) {
    return projectFilesCache[projectId]
  }

  const versions = modrinthProjectFilesSchema.parse(
    await reqJson(`https://api.modrinth.com/v2/project/${projectId}/version`, { signal })
  )

  const files: ProjectFile[] = versions.flatMap((version) =>
    version.files
      .filter((file) => file.primary)
      .map<ProjectFile>((file) => ({
        id: file.filename,
        name: version.name,
        version: version.version_number,
        fileName: file.filename,
        downloadUrl: file.url,
        gameVersions: version.game_versions,
        published: version.date_published,
        provider: 'modrinth'
      }))
  )

  projectFilesCache[projectId] = files
  return files
}

async function fetchCurseforgeProjectFiles(
  projectId: string,
  signal?: AbortSignal
): Promise<ProjectFile[]> {
  if (projectFilesCache[projectId]) {
    return projectFilesCache[projectId]
  }
  const curseForgeFiles = curseforgeProjectFilesSchema.parse(
    await reqJson(`https://api.curseforge.com/v1/mods/${projectId}/files`, {
      signal,
      headers: {
        'x-api-key': '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm'
      }
    })
  )

  const files: ProjectFile[] = curseForgeFiles.data
    .filter((file) => file.isAvailable)
    .map((file) => ({
      id: file.id,
      name: file.displayName,
      version: file.fileName,
      fileName: file.fileName,
      downloadUrl: file.downloadUrl,
      gameVersions: file.gameVersions,
      published: file.fileDate,
      provider: 'curseforge'
    }))

  projectFilesCache[projectId] = files
  return files
}

async function fetchProjectFiles(
  provider: Provider,
  projectId: string,
  signal?: AbortSignal
): Promise<ProjectFile[]> {
  switch (provider) {
    case 'modrinth':
      return fetchModrinthProjectFiles(projectId, signal)
    case 'curseforge':
      return fetchCurseforgeProjectFiles(projectId, signal)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

function resolveId(provider: Provider, project: Project): string | null {
  if (provider === 'modrinth') {
    return project.modrinthId ?? null
  }
  if (provider === 'curseforge') {
    return project.curseforgeId ?? null
  }
  return null
}

export const useProjectFiles = (provider: Provider, project: Project) => {
  const controller = new AbortController()
  const files = ref<ProjectFile[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  onMounted(() => {
    const projectId = resolveId(provider, project)

    if (projectId) {
      loading.value = true

      fetchProjectFiles(provider, projectId, controller.signal)
        .then((fetchedFiles) => (files.value = fetchedFiles))
        .catch((err) => (error.value = err))
        .finally(() => (loading.value = false))
    }
  })

  onUnmounted(() => {
    controller.abort()
  })

  return {
    files,
    loading,
    error
  }
}
