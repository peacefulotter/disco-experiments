import * as tf from '@tensorflow/tfjs-node'
import getDataset from './dataset.js'
import config from '~/config.js'

let dataset = await getDataset(config, 'valid')
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
