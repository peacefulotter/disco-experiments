import * as tf from '@tensorflow/tfjs'
import * as gpt from '#/gpt-tfjs'

import setBackend from './backend'
import { BackendName, Config, TokenizedDatasetWithCallback } from './tfjs-types'

export default async function train(
    tf: any,
    config: Config,
    backendName: BackendName,
    getTrainDataset: () => Promise<TokenizedDatasetWithCallback>,
    getEvalDataset: () => Promise<TokenizedDatasetWithCallback>,
    callback?: (model: tf.LayersModel) => Promise<void>
) {
    await setBackend(tf, backendName)

    const { dataset: trainDataset, onEnd: onTrainEnd } = await getTrainDataset()

    config.backend = backendName
    console.log(config)

    const model = gpt.GPT(config)

    await gpt.train(model, trainDataset, config, getEvalDataset, callback)

    await onTrainEnd?.()
}
