import fs from 'fs'
import path from 'path'
import esMain from 'es-main'
import { readdir } from 'fs/promises'
import { encode } from 'gpt-tokenizer/model/text-davinci-003'

// For ts-node-esm
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const TOKENIZED_FILE_EXTENSION = 'tokens'

async function getFileStreams(datasetDir: string) {
    const files = await readdir(datasetDir)
    const preprocessFiles = files.filter(
        (file) =>
            !file.endsWith('zip') && !file.endsWith(TOKENIZED_FILE_EXTENSION)
    )
    console.log('Found', preprocessFiles.length, 'files to preprocess')
    const streams = preprocessFiles.map((file) => ({
        file,
        stream: fs.createReadStream(path.join(datasetDir, file), {
            encoding: 'utf8',
            highWaterMark: 128,
        }),
    }))
    return streams
}

const preprocessStream = async (
    datasetDir: string,
    file: string,
    stream: fs.ReadStream,
    cb?: (tokens: number[]) => void
) =>
    new Promise((resolve) => {
        const writeFilePath = path.join(
            datasetDir,
            file + '.' + TOKENIZED_FILE_EXTENSION
        )
        console.log('Writing to', writeFilePath)
        const writeFileStream = fs.createWriteStream(writeFilePath)
        stream
            .map((chunk) => {
                const tokens = encode(chunk.toString())
                cb?.(tokens)
                const array = new Uint16Array(tokens)
                const buffer = Buffer.from(array.buffer)
                return buffer
            })
            .pipe(writeFileStream)

        stream.on('end', () => {
            writeFileStream.end()
            resolve('')
        })
    })

export default async function preprocess(cb?: (tokens: number[]) => void) {
    const datasetDir = path.join(
        __dirname,
        '..',
        '..',
        'datasets',
        'wikitext-103'
    )
    console.log('Preprocessing step located at:', datasetDir)
    const streams = await getFileStreams(datasetDir)

    for await (const { file, stream } of streams) {
        await preprocessStream(datasetDir, file, stream, cb)
    }
}

if (esMain(import.meta)) {
    await preprocess()
}
