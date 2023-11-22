import fs from 'fs'
import { readdir } from 'fs/promises'
import * as tf from '@tensorflow/tfjs'
import path from 'path'
import { Config, EncodedDataset } from '~/tfjs-types'

type TokenizedIterator = AsyncIterator<
    {
        // x: number[]
        // y: number[]
        working: string
    },
    void,
    unknown
>

async function sleep(t: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

const tokenizedIterator = (
    generator: TokenizedIterator,
    vocabSize: number
): EncodedDataset => {
    return tf.data
        .generator(generator as any)
        .map((v: any & { x: number[]; y: number[] }) => ({
            x: tf.tensor1d(v.x, 'int32'),
            y: tf.oneHot(v.y, vocabSize),
        }))
}

function getFileStream(config: Config, datasetDir: string, file: string) {
    // blockSize to get an initial full x
    // + batchSize to retrieve a batch from it (each element of the batch is a shift by << n for the nth elt in batch)
    // + 1 for the last y of the batch
    const highWaterMark = (config.blockSize + config.batchSize + 1) * 2
    console.log('HighWaterMark:', highWaterMark)

    return fs.createReadStream(path.join(datasetDir, file), {
        highWaterMark, // set this to seq length * 2 because we store uint16,
    })
}

const toUInt16 = (low: number, high: number) => {
    low &= 0xff
    high &= 0xff
    return (high << 8) | low
}

const getDatasetFile = async (datasetDir: string, split: string) => {
    const files = await readdir(datasetDir)
    const file = files.filter((f) => f.includes(split))[0]
    console.log('Found', files.length, 'files in dataset under', datasetDir)
    console.log('File corresponding to split', split, 'is', file)
    return file
}

// call from server
export async function getPreprocessedDataset(config: Config, split: string) {
    const { dataset } = config
    const datasetDir = path.join(process.cwd(), '..', 'datasets', dataset)
    console.log('Preprocessed dataset located at:', datasetDir)

    const file = await getDatasetFile(datasetDir, split)
    const stream = getFileStream(config, datasetDir, file)

    const generator = async function* () {
        const iter = stream.iterator()
        while (true) {
            const { value: chunk } = await iter.next()
            if (!chunk) break

            const tokens = []
            for (let i = 0; i < chunk.length; i += 2) {
                const low = chunk[i]
                const high = chunk[i + 1]
                const token = toUInt16(low, high)
                tokens.push(token)
            }

            for (let i = 0; i < config.batchSize; i++) {
                console.log(i)
                const x = tokens.slice(i, i + config.blockSize)
                const y = tokens.slice(i + 1, i + config.blockSize + 1)
                yield { x, y }
                await sleep(1)
            }
        }
        stream.close()
    }
    return generator()
}

// call from client
export async function getFrontendDataset(config: Config, split: string) {
    const { vocabSize } = config

    const brokerURL = 'ws://localhost:3001/ws'

    const ws = new WebSocket(brokerURL)
    ws.onopen = () => {
        console.log('websocket open')
    }

    type Res = { working: string }
    const iterator: AsyncIterator<Res> = {
        next: () =>
            new Promise<{ done: boolean; value: Res }>((resolve) => {
                ws.onmessage = (payload) => {
                    console.log('payload', payload.data)
                    const res = { working: 'yes' }
                    resolve({ done: payload.data !== null, value: res })
                }
                ws.send(JSON.stringify({ split }))
            }),
    }

    // const res = await fetch('/api/dataset/read', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         split,
    //     }),
    // })
    // console.log('RESPONSE', res)
    // const { content } = await res.json()
    // console.log('RESPONSE', content)
    // const generator = undefined as any
    //JSON.parse(content) as number[][]
    return tokenizedIterator(iterator, vocabSize)
}
