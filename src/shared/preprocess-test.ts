import config from './config'
import { getDataset } from './dataset-node'
import preprocess from './preprocess'

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
