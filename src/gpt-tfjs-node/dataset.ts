import * as tf from '@tensorflow/tfjs-node'
import {
    getDatasetFile,
    getIteratorDatasetFromFile,
} from '../shared/dataset-node.js'
import { getDataset as getBackboneDataset } from '../shared/dataset.js'
import { Config } from '../shared/tfjs-types.js'

export default async function getDataset(config: Config, split: string) {
    const file = await getDatasetFile(config, split)
    let stream = getIteratorDatasetFromFile(config, file)
    const requestNext = async () => {
        const { value } = await stream.next()
        return value
    }
    return getBackboneDataset(tf, config, requestNext)
}
