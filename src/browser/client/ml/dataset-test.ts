'use client'
import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import getConfig from './config'

export async function datasetTest() {
    console.log('dataset test')
    await tf.ready()
    const config = await getConfig()
    const testConfig = { ...config }
    const { dataset, onEnd } = await getDataset(testConfig, 'train')
    const iter = await dataset.iterator()
    const { value } = await iter.next()
    const { xs, ys } = value
    console.log(xs.shape, ys.shape)
    onEnd?.()
}

export async function datasetBenchmark() {
    await tf.ready()

    const config = await getConfig()
    const testConfig = { ...config }
    const { dataset, onEnd } = await getDataset(testConfig, 'train')
    const iter = await dataset.iterator()

    const iterations = 1000
    const label = `Benchmark ${iterations} iterations`
    const { blockSize, batchSize, vocabSize } = config
    console.log(label, 'starts', { blockSize, batchSize, vocabSize })
    console.time(label)
    for (let i = 0; i < iterations; i++) {
        await iter.next()
    }
    console.timeEnd(label)

    onEnd?.()
}
