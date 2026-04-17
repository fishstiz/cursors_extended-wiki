import type { Project } from '@/schema/project'
import { CurseforgeProject } from '@/schema/curseforge-project'
import { Member, ModrinthProject } from '@/schema/modrinth-project'
import { data } from '@/data/showcase.data'
import { onMounted, onUnmounted, reactive, ref, type Reactive } from 'vue'
import z from 'zod'

// https://github.com/enjarai/the-curseforge-api-key
const THE_CF_API_KEY = '$2a$10$bL4bIL5pUWqfcO7KQtnMReakwtfHbNKh6v1uTpKlzhwoueEJQnPnm'

let cache: Reactive<Project>[] | null = null

const modrinthSchema = ModrinthProject.array()
  .optional()
  .nullish()
  .transform((val) => val ?? [])

const modrinthMembersSchema = Member.array()
  .nullish()
  .transform((val) => val ?? [])

const curseforgeSchema = z.object({
  data: CurseforgeProject.array()
    .nullish()
    .transform((val) => val ?? [])
})

async function getAndLogError(res: Response): Promise<Error> {
  const message = await res
    .json()
    .then(JSON.stringify)
    .catch(() => `${res.status} - ${res.statusText}`)

  console.error(message)
  return new Error(message)
}

async function fetchModrinthAuthor(id: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`https://api.modrinth.com/v2/project/${id}/members`, { signal })

  if (!res.ok) {
    throw await getAndLogError(res)
  }

  const members = modrinthMembersSchema
    .parse(await res.json())
    .sort((a, b) => a.ordering - b.ordering)

  return members[0]?.user?.name || members[0]?.user?.username || ''
}

async function fetchModrinth(ids: string[], signal?: AbortSignal): Promise<ModrinthProject[]> {
  if (!ids.length) return []

  const res = await fetch(`https://api.modrinth.com/v2/projects?ids=${JSON.stringify(ids)}`, {
    signal
  })

  if (!res.ok) {
    throw await getAndLogError(res)
  }

  return modrinthSchema.parse(await res.json())
}

async function fetchCurseforge(ids: string[], signal?: AbortSignal): Promise<CurseforgeProject[]> {
  if (!ids.length) return []

  const res = await fetch(`https://api.curseforge.com/v1/mods`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': THE_CF_API_KEY
    },
    body: JSON.stringify({ modIds: ids, filterPcOnly: true })
  })

  if (!res.ok) {
    throw await getAndLogError(res)
  }

  return curseforgeSchema.parse(await res.json()).data
}

async function fetchProjects(signal?: AbortSignal): Promise<Reactive<Project>[]> {
  if (cache) return cache

  const { packs } = data
  const modrinthIds: string[] = []
  const curseforgeIds: string[] = []

  packs.forEach((pack) => {
    if (pack.modrinthId) modrinthIds.push(pack.modrinthId)
    if (pack.curseforgeId) curseforgeIds.push(pack.curseforgeId)
  })

  const results = await Promise.allSettled([
    fetchModrinth(modrinthIds, signal),
    fetchCurseforge(curseforgeIds, signal)
  ])

  if (signal?.aborted) {
    return []
  }

  const modrinthData = results[0].status === 'fulfilled' ? results[0].value : []
  const curseforgeData = results[1].status === 'fulfilled' ? results[1].value : []

  const modrinthMap = new Map(modrinthData.map((p) => [p.id, p] as const))
  const curseforgeMap = new Map(curseforgeData.map((p) => [String(p.id), p] as const))

  const projects = packs.reduce<Reactive<Project>[]>((acc, pack) => {
    const modrinthProject = pack.modrinthId ? modrinthMap.get(pack.modrinthId) : null
    const curseforgeProject = pack.curseforgeId ? curseforgeMap.get(pack.curseforgeId) : null
    if (!modrinthProject && !curseforgeProject) return acc

    const project: Reactive<Project> = reactive({
      name: modrinthProject?.title ?? curseforgeProject?.name ?? '',
      description: modrinthProject?.description ?? curseforgeProject?.summary ?? '',
      icon: modrinthProject?.icon_url ?? curseforgeProject?.logo?.url,
      author: '',
      modrinthUrl: modrinthProject
        ? `https://www.modrinth.com/${modrinthProject.project_type}/${modrinthProject.slug ?? modrinthProject.id}`
        : undefined,
      curseforgeUrl: curseforgeProject ? curseforgeProject.links.websiteUrl : undefined,
      downloads: (modrinthProject?.downloads ?? 0) + (curseforgeProject?.downloadCount ?? 0),
      published: new Date(
        Math.min(
          modrinthProject?.published?.getTime() ?? Infinity,
          curseforgeProject?.dateReleased?.getTime() ?? Infinity
        )
      ),
      modified: new Date(
        Math.max(
          modrinthProject?.updated?.getTime() ?? 0,
          curseforgeProject?.dateModified?.getTime() ?? 0
        )
      )
    })

    if (curseforgeProject) {
      project.author = curseforgeProject.authors?.[0]?.name ?? 'Unknown'
    } else if (pack.modrinthId) {
      fetchModrinthAuthor(pack.modrinthId, signal)
        .then((name) => (project.author = name))
        .catch(() => (project.author = 'Unknown'))
    }

    acc.push(project)
    return acc
  }, [])

  if (results.every((r) => r.status === 'fulfilled')) {
    cache = projects
  }

  return projects
}

export function useShowcaseProjects() {
  const controller = new AbortController()
  const projects = ref<Project[]>([])
  const loading = ref<boolean>(true)

  onMounted(() => {
    fetchProjects(controller.signal)
      .then((data) => (projects.value = data))
      .catch(() => (projects.value = []))
      .finally(() => (loading.value = false))
  })

  onUnmounted(() => {
    controller.abort()
  })

  return {
    projects,
    loading
  }
}
