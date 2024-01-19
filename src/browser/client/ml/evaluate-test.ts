import * as tf from '@tensorflow/tfjs'
import * as gpt from '#/gpt-tfjs'
import getDataset from './dataset'
import getConfig from './config'

export async function evaluateTest() {
    const config = await getConfig()
    const c = {
        ...gpt.DEFAULT_CONFIG,
        ...config,
        maxEvalBatches: 3,
        platform: 'browser',
        model: 'gpt-nano',
    }
    const model = gpt.GPT(c)
    for (let i = 0; i < 3; i++) {
        const { dataset, onEnd } = await getDataset(config, 'train')
        const res = await gpt.evaluate(tf, model, dataset, c)
        console.log(res)
        onEnd?.()
    }
}
