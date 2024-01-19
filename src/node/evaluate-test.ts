import * as tf from '@tensorflow/tfjs-node'
import * as gpt from '#/gpt-tfjs'
import { getDataset } from '~/dataset-node'
import config from '~/config'

async function main() {
    const c = {
        ...gpt.DEFAULT_CONFIG,
        ...config,
        maxEvalBatches: 100,
        platform: 'node',
        model: 'gpt-nano',
    }
    const model = gpt.GPT(c)
    const dataset = await getDataset(config, 'valid')
    const res = await gpt.evaluate(tf, model, dataset, c)
    console.log(res)
    console.log(tf.memory())
}
main()
