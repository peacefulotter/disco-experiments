import * as tf from '@tensorflow/tfjs'
import * as gpt from '#/gpt-tfjs'
import getDataset from './dataset'
import config from '~/config'

export async function evaluateTest() {
    const c = {
        ...gpt.DEFAULT_CONFIG, ...config, maxEvalBatches: 100, platform: 'browser', model: 'gpt-nano'
    }
    const model = gpt.GPT(c)
    const { dataset, onEnd } = await getDataset(config, 'train')
    const res = await gpt.evaluate(tf, model, dataset, c)
    onEnd?.()
}