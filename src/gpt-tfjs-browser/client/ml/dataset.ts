import * as tf from '@tensorflow/tfjs'
import {
    AsyncTokenizedGenerator,
    Config,
    EncodedDataset,
    TokenizedSample,
} from '~/tfjs-types'

async function sleep(t: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

const getWebSocket = async (split: string) =>
    new Promise<WebSocket>((resolve) => {
        const brokerURL = `ws://localhost:3001/ws?split=${split}`
        const ws = new WebSocket(brokerURL)
        ws.onopen = () => {
            console.log('dataset websocket open')
            resolve(ws)
        }
    })

const tokenizedIterator = (
    gen: () => AsyncTokenizedGenerator,
    vocabSize: number
): EncodedDataset => {
    return tf.data.generator(gen as any).map((v: any & TokenizedSample) => ({
        x: tf.tensor1d(v.x, 'int32'),
        y: tf.oneHot(v.y, vocabSize),
    }))
}

const toUInt16 = (low: number, high: number) => {
    low &= 0xff
    high &= 0xff
    return (high << 8) | low
}

export async function getFrontendDataset(config: Config, split: string) {
    const { vocabSize } = config
    const ws = await getWebSocket(split)

    const requestNext = async () =>
        new Promise<number[]>((resolve) => {
            ws.onmessage = (payload) => {
                const buffer = JSON.parse(payload.data) as {
                    type: Buffer
                    data: number[]
                }
                resolve(buffer.data)
            }
            setTimeout(() => ws.send('req'), 1)
        })

    async function* generator(): AsyncTokenizedGenerator {
        while (true) {
            const chunk = await requestNext()
            if (!chunk) break

            const tokens = []
            for (let i = 0; i < chunk.length; i += 2) {
                const low = chunk[i]
                const high = chunk[i + 1]
                const token = toUInt16(low, high)
                tokens.push(token)
            }

            for (let i = 0; i < config.batchSize; i++) {
                const x = tokens.slice(i, i + config.blockSize)
                const y = tokens.slice(i + 1, i + config.blockSize + 1)
                yield { x, y }
                await sleep(1)
            }
        }
    }

    return tokenizedIterator(generator, vocabSize)
}
