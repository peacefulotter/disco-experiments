import * as tf from '@tensorflow/tfjs-node'

import { getDataset } from '~/dataset-node.js'
import config from '~/config.js'

// Test for performance
async function main() {
    const testConfig = { ...config, batchSize: 8, blockSize: 128 }
    const dataset = await getDataset(testConfig, 'train')
    const iter = await dataset.iterator()

    console.time('time')
    performance.mark('iter-start')
    const iterations = 1000
    for (let i = 0; i < iterations; i++) {
        const { value } = await iter.next()
        const { xs, ys } = value
        tf.dispose([xs, ys])
    }
    performance.mark('iter-end')
    console.timeEnd('time')
    const measure = performance.measure('iter', 'iter-start', 'iter-end')
    console.log('average:', measure.duration / iterations, 'ms')
}
main()
