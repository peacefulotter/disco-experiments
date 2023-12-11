import config from './config.js'
import { getDataset } from './dataset-node.js'
import preprocess from './preprocess.js'

const dataset = await getDataset(config, 'valid')
const iter = await dataset.iterator()
const { value } = await iter.next()
const { x, y } = value
console.log(x.shape, y.shape)
console.log(await x.array())
console.log(await y.array())

let a = true
const cb = (tokens: number[]) => {
    if (a) {
        console.log(tokens)
        a = false
    }
}
await preprocess(cb)
