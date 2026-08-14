import { ModrinthProjectVersion } from '@/schema/modrinth-project'
import { reqJson } from '@/utils/request'
import { compareVersions, isSnapshotVersion } from '@/utils/game-versions'
import { onMounted, ref } from 'vue'

const CURSORS_EXTENDED_MODRINTH_ID = 'o5fhgLeQ'

let supportedGameVersionsCache: Promise<string[]> | null = null

const modrinthProjectFilesSchema = ModrinthProjectVersion.array()
  .nullish()
  .transform((val) => val ?? [])

async function fetchSupportedGameVersions(): Promise<string[]> {
  if (supportedGameVersionsCache != null) {
    return supportedGameVersionsCache
  }

  supportedGameVersionsCache = (async function () {
    const versions = modrinthProjectFilesSchema.parse(
      await reqJson(`https://api.modrinth.com/v2/project/${CURSORS_EXTENDED_MODRINTH_ID}/version`)
    )

    const gameVersions = [...new Set(versions.flatMap((version) => version.game_versions))]
      .filter((version) => !isSnapshotVersion(version))
      .toSorted((a, b) => compareVersions(b, a))

    return gameVersions
  })()

  return supportedGameVersionsCache
}

export function useSupportedGameVersions() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const gameVersions = ref<string[]>([])

  onMounted(() => {
    loading.value = true

    fetchSupportedGameVersions()
      .then((supportedGameVersions) => (gameVersions.value = supportedGameVersions))
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  })

  return {
    loading,
    error,
    gameVersions
  }
}
