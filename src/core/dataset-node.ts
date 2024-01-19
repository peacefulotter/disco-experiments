import * as tf from '@tensorflow/tfjs-node'
import fs from 'fs'
import { readdir } from 'fs/promises'
import path from 'path'
import { getDataset as getCoreDataset } from './dataset'
import { Config } from './tfjs-types'

// For ts-node-esm
import { fileURLToPath } from 'url'
import { TOKENIZED_FILE_EXTENSION } from './preprocess'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getDatasetDir = (config: Config) =>
    path.join(__dirname, '../../', 'datasets', config.dataset)

function getFileStream(source: string, chunkSize: number) {
    return new Promise<fs.ReadStream>((resolve) => {
        const stream = fs.createReadStream(source, {
            fd: undefined,
            highWaterMark: chunkSize,
        })
        stream.on('readable', () => resolve(stream))
    })
}
async function getDatasetFile(config: Config, split: string) {
    const datasetDir = getDatasetDir(config)
    console.log('Preprocessed dataset located at:', datasetDir)

    const files = await readdir(datasetDir)
    const file = files.filter(
        (f) => f.endsWith(TOKENIZED_FILE_EXTENSION) && f.includes(split)
    )[0]
    console.log(
        'Found',
        files.length,
        'files in dataset, selected',
        file,
        'under',
        datasetDir
    )
    return path.join(datasetDir, file)
}

export const getChunkSize = (config: Config) => {
    // blockSize + 1 = input size (size of x = blockSize, size of y = blockSize shifted right by 1, thus the + 1)
    // * batchSize to retrieve a batch at once
    // * 2 because tokens are stored as uint16 and thus require 2 bytes
    return (config.blockSize + 1) * config.batchSize * 2
}

export async function getInfiniteBufferIteratorFromFile(
    config: Config,
    split: string
): Promise<AsyncIterator<Buffer, Buffer, Buffer>> {
    const chunkSize = getChunkSize(config)

    if (isNaN(chunkSize))
        throw new Error(
            'chunk size, is NaN but is supposed to be of type number'
        )

    const file = await getDatasetFile(config, split)
    const getStream = async () => await getFileStream(file, chunkSize)

    let stream = await getStream()
    return {
        next: async () => {
            let buffer = (await stream.read(chunkSize)) as Buffer | undefined
            if (!buffer) {
                stream.close()
                stream = await getStream()
                buffer = await stream.read(chunkSize)
                if (!buffer) {
                    throw new Error(
                        'Getting a sample from the file stream still fails after retrying, most likely the file at ' +
                            file +
                            ' is empty..'
                    )
                }
            }
            return { value: buffer, done: false }
        },
    }
}

export async function getDataset(config: Config, split: string) {
    const requestNext = await getInfiniteBufferIteratorFromFile(config, split)
    return getCoreDataset(tf, config, requestNext)
}
