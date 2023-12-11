'use client'
import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import getConfig from './config'

export default async function datasetTest() {
    await tf.ready()

    const config = await getConfig()
    const testConfig = { ...config } //,  blockSize: 8, batchSize: 4
    let { dataset, closeWS } = await getDataset(testConfig, 'train')
    dataset = dataset.batch(testConfig.batchSize)

    const iter = await dataset.iterator()

    performance.mark('iter-start')
    const iterations = 1000
    for (let i = 0; i < iterations; i++) {
        const t0 = performance.now()
        const { value } = await iter.next()
        const t1 = performance.now()
        // console.log(t1 - t0, 'time')

        const { x, y } = value

        const max = tf.argMax(y, 2)
        // console.log(i, x.shape, y.shape, max.shape)
        // console.log(await x.array())
        // console.log(await max.array())

        tf.dispose([x, y, max])
    }
    performance.mark('iter-end')
    const measure = performance.measure('iter', 'iter-start', 'iter-end')
    console.log('average', measure.duration / iterations)

    closeWS()
}
