import * as tf from '@tensorflow/tfjs-node'
import { getPreprocessedDataset } from '~/dataset-node.js'
import { getDataset as getBackboneDataset } from '~/dataset.js'
import { Config } from '~/tfjs-types.js'

export default async function getDataset(config: Config, split: string) {
    const requestNext = async () => {
        const stream = await getPreprocessedDataset(config, split)
        const next = await stream.next()
        return next.value
    }
    return getBackboneDataset(tf, config, requestNext)
}
