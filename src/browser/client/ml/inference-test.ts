'use client'
import * as tf from '@tensorflow/tfjs'

import inference from '~/inference'
import { BrowserBackendName } from '~/tfjs-types'
import getDataset from './dataset'
import getConfig from './config'

export default async function inferenceTest(backendName: BrowserBackendName) {
    const config = await getConfig()
    let { dataset, onEnd } = await getDataset(config, 'valid')
    await inference(tf, config, dataset, backendName)
    onEnd?.()
}
