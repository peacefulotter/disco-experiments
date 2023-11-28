'use client'
import * as tf from '@tensorflow/tfjs'

import config from '~/config'
import inference from '~/inference'
import { BackendName } from '~/tfjs-types'
import getDataset from './dataset'

export default async function inferenceTest(backendName: BackendName) {
    let { dataset, closeWS } = await getDataset(config, 'valid')
    inference(tf, dataset, backendName)
    closeWS()
}
