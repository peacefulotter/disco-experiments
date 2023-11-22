import * as tf from '@tensorflow/tfjs-node'
import { getPreprocessedDataset } from './dataset.js'
import { config, datasetDir } from './config.js'

let dataset = await getPreprocessedDataset(tf, datasetDir, 'val', config)
// TODO: dataset = dataset.batch(4)

const iter = await dataset.iterator()
let i = 0
while (i++ < 3) {
    const { value } = await iter.next()
    const { x, y } = value
    console.log(i, x, y)
    tf.dispose([x, y])
}
console.log('after')
