import fs from 'fs'
import path from 'path'
import { readdir } from 'fs/promises'

// For ts-node-esm
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function getFileStreams(datasetDir: string) {
    const files = await readdir(datasetDir)
    console.log('Found', files.length - 1, 'files in dataset')

    const streams = files
        .filter((file) => file.endsWith('pp'))
        .map((file) =>
            fs.createReadStream(path.join(datasetDir, file), {
                highWaterMark: 128, // set this to seq length * 2 because we store uint16,
            })
        )
    return streams
}

const datasetDir = path.join(__dirname, 'datasets', 'wikitext')
console.log('Preprocessing step located at:', datasetDir)
const streams = await getFileStreams(datasetDir)

const toUInt16 = (low: number, high: number) => {
    low &= 0xff
    high &= 0xff
    return (high << 8) | low
}

const preprocessTest = async (stream: fs.ReadStream) => {
    const iter = stream.iterator()
    const { value: chunk } = await iter.next()

    const tokens = []
    for (let i = 0; i < chunk.length; i += 2) {
        const low = chunk[i]
        const high = chunk[i + 1]
        const token = toUInt16(low, high)
        tokens.push(token)
    }
    console.log(tokens)

    stream.close()
}

for await (const stream of streams) {
    await preprocessTest(stream)
    throw new Error('stop')
}
