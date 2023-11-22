'use client'
import * as tf from '@tensorflow/tfjs'
import { getFrontendDataset } from './dataset'
import getConfig from './config'

export default async function datasetTest() {
    await tf.ready()
    const config = await getConfig()
    const dataset = await getFrontendDataset(config, 'valid')
    const iter = await dataset.iterator()
    const next = await iter.next()
    console.log('next', next)
    console.log(next.value.x.shape)
    console.log(next.value.y.shape)
}
