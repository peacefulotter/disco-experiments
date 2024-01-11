import fs from 'fs/promises'

import config from './config.js'
import { getDataset, getFileStream } from './dataset-node.js'
import { getDatasetDir } from './dataset-node.js'
import path from 'path'
import { encode, decode } from 'gpt-tokenizer/esm/model/text-davinci-003'
import { toUInt16 } from './dataset.js'

const split = 'test'

const dir = getDatasetDir(config)
const filePath = path.join(dir, split)
const file = await fs.readFile(filePath, 'utf-8')

const sampleSize = config.blockSize + 1
const stream = getFileStream(config, split)
const iter2 = stream.iterator() as AsyncIterator<Buffer, Buffer>

// const checkOverflow = (x: number[]) => {
//     for (let i = 0; i < x.length; i++) {
//         const token = x[i]
//         if (token > 50256) {
//             console.log(idx, x, token)
//             console.log(decode(x))
//             return
//         }
//     }
// }

const collectTokens = async () => {
    const x = []
    while (true) {
        const { value } = await iter2.next()
        if (!value) break
        const chunk = value.toJSON().data
        for (let i = 0; i < config.batchSize; i++) {
            for (let j = 0; j < sampleSize; j++) {
                const idx = (i * sampleSize + j) * 2
                const low = chunk[idx]
                const high = chunk[idx + 1]
                const token = toUInt16(low, high)
                x.push(token)
            }
        }
    }
    return x
}

const x = await collectTokens()
const tokens = encode(file)
console.log(x.length, tokens.length)
for (let i = 0; i < x.length; i++) {
    console.log(x[i], tokens[i])
}
console.log('done')

//

//

// let idx = 0

// for (let i = 0; i < 10; i++) {
//     const { value } = await iter.next()
//     const { xs } = value
//     const x = await xs.array()
//     const text = decode(x)

//     const original = file.slice(idx, idx + text.length)

//     console.log('==== ORIGINAL:', original)
//     console.log('====     TEXT:', text)
//     console.log('---------------------')
//     idx += original.length
// }
