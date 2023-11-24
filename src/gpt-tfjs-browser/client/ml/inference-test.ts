'use client'
import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import config from '~/config'
import inference from '~/inference'
import { BackendName } from '~/tfjs-types'

export default async function inferenceTest(backendName: BackendName) {
    let { dataset, closeWS } = await getDataset(config, 'valid')
    inference(tf, dataset, backendName)
    closeWS()
}
