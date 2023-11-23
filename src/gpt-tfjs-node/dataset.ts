import * as tf from '@tensorflow/tfjs'
import fs from 'fs'
import { readdir } from 'fs/promises'
import path from 'path'
import {
    AsyncTokenizedGenerator,
    Config,
    EncodedDataset,
    TokenizedSample,
} from '~/tfjs-types.js'

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

const getDatasetFile = async (datasetDir: string, split: string) => {
    const files = await readdir(datasetDir)
    const file = files.filter((f) => f.includes(split))[0]
    console.log('Found', files.length, 'files in dataset under', datasetDir)
    console.log('File corresponding to split', split, 'is', file)
    return file
}

export async function getPreprocessedDataset(config: Config, split: string) {
    const { dataset } = config
    const datasetDir = path.join(process.cwd(), '../../..', 'datasets', dataset)
    console.log('Preprocessed dataset located at:', datasetDir)

    const file = await getDatasetFile(datasetDir, split)
    const stream = getFileStream(config, datasetDir, file)
    return stream.iterator()
}

async function sleep(t: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

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

    const requestNext = async () => {
        const stream = await getPreprocessedDataset(config, split)
        const next = await stream.next()
        return next.value
    }

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
