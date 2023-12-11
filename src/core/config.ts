import fs from 'fs/promises'
import { BaseConfig, Config, Model } from './tfjs-types'

const readJson = async (path: string) => {
    const f = await fs.readFile(path, 'utf-8')
    return JSON.parse(f)
}

const configModels = await readJson('./models.json')
const baseConfig = (await readJson('./config.json')) as BaseConfig
const { modelType, dataset, batchSize, blockSize, lr, maxIter } = baseConfig
const model = configModels[modelType] as Model

const config: Config = {
    ...baseConfig,
    ...model,
    residDrop: baseConfig.embdDrop,
    wandbName: `${modelType}_${dataset}_bs=${batchSize}_seq=${blockSize}_lr=${lr}_iter=${maxIter}`,
} as const

export { configModels }
export default config
