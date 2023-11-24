import * as tf from '@tensorflow/tfjs-node'
import { getDataset } from '../shared/dataset-node.js'
import config from '../shared/config.js'

async function main() {
    const testConfig = { ...config, batchSize: 8, blockSize: 128 }
    let dataset = await getDataset(testConfig, 'valid')
    dataset = dataset.batch(testConfig.batchSize)
    const iter = await dataset.iterator()

    performance.mark('iter-start')
    const iterations = 300
    for (let i = 0; i < iterations; i++) {
        const t0 = performance.now()
        const { value } = await iter.next()
        const t1 = performance.now()
        // console.log(t1 - t0, 'milliseconds')
        const { x, y } = value

        // const max = tf.argMax(y, 2)
        // console.log(i, x.shape, y.shape, max.shape)
        // console.log(await x.array())
        // console.log(await max.array())
        // max.dispose()

        tf.dispose([x, y])
    }
    performance.mark('iter-end')
    const measure = performance.measure('iter', 'iter-start', 'iter-end')
    console.log('average:', measure.duration / iterations)
}
main()
