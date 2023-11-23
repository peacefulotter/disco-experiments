import fs from 'fs'
import { readdir } from 'fs/promises'
import path from 'path'
import { Config } from '../../tfjs-types.js'

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

// call from server
export async function getPreprocessedDataset(config: Config, split: string) {
    const { dataset } = config
    const datasetDir = path.join(process.cwd(), '../..', 'datasets', dataset)
    console.log('Preprocessed dataset located at:', datasetDir)

    const file = await getDatasetFile(datasetDir, split)
    const stream = getFileStream(config, datasetDir, file)
    return stream.iterator()
}
