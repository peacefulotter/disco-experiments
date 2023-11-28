'use client'
import * as tf from '@tensorflow/tfjs'

import config from '~/config'
import inference from '~/inference'
import { BrowserBackendName } from '~/tfjs-types'
import getDataset from './dataset'

export default async function inferenceTest(backendName: BrowserBackendName) {
    let { dataset, closeWS } = await getDataset(config, 'valid')
    await inference(tf, dataset, backendName)
    closeWS()
}
