'use client'
import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import config from '~/config'

export default async function datasetTest() {
    await tf.ready()

    let { dataset, closeWS } = await getDataset(config, 'valid')
    dataset = dataset.batch(4)

    const iter = await dataset.iterator()
    const next = await iter.next()

    console.log('next', next)
    console.log(await next.value.x.array())
    console.log(await next.value.y.array())
    console.log(next.value.x.shape)
    console.log(next.value.y.shape)

    closeWS()
}
