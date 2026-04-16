import { defineLoader } from 'vitepress'
import path from 'path'
import fs from 'fs'

export type Pack = {
  name: string
  modrinthId?: string
  curseforgeId?: string
}

export type Data = {
  packs: Pack[]
}

declare const data: Data
export { data }

export default defineLoader({
  watch: ['../../../showcase.json'],
  load(): Data {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../../showcase.json'), 'utf-8')
    )
    return data
  }
})
