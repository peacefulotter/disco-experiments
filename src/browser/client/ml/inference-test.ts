'use client'
import * as tf from '@tensorflow/tfjs'

import inference from '~/inference'
import getDataset from './dataset'
import getConfig from './config'

export default async function inferenceTest() {
    const config = await getConfig()
    const { dataset, onEnd } = await getDataset(config, 'train')
    await inference(tf, config, dataset)
    onEnd?.()
}
