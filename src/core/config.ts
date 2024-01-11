import fs from 'fs/promises'
import path from 'path'
import { BaseConfig, Config, Model } from './tfjs-types'

// For ts-node-esm
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const readJson = async (filename: string) => {
    const p = path.join(__dirname, filename)
    const f = await fs.readFile(p, 'utf-8')
    return JSON.parse(f)
}

const configModels = await readJson('models.json')
const baseConfig = (await readJson('config.json')) as BaseConfig
const { modelType } = baseConfig
const model = configModels[modelType] as Model

const config: Config = {
    ...baseConfig,
    ...model,
    platform:
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
            ? 'browser'
            : 'node',
} as const

export { configModels }
export default config
