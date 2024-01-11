import {
    Config,
    AsyncTokenizedGenerator,
    EncodedDataset,
    TokenizedSample,
} from './tfjs-types'

const tokenizedIterator = (
    tf: any,
    gen: () => AsyncTokenizedGenerator,
    vocabSize: number
): EncodedDataset => {
    return tf.data.generator(gen as any).map((v: any & TokenizedSample) => ({
        xs: tf.tensor1d(v.xs, 'int32'),
        ys: tf.oneHot(v.ys, vocabSize),
    }))
}

export const toUInt16 = (low: number, high: number) => {
    low &= 0xff
    high &= 0xff
    return (high << 8) | low
}

export async function getDataset(
    tf: any,
    config: Config,
    requestNext: () => Promise<number[]>
) {
    const { vocabSize } = config
    const sampleSize = config.blockSize + 1

    async function* generator(): AsyncTokenizedGenerator {
        while (true) {
            const chunk = await requestNext()
            if (!chunk) break

            for (let i = 0; i < config.batchSize; i++) {
                const xs = []
                const ys = []
                for (let j = 0; j < sampleSize; j++) {
                    const idx = (i * sampleSize + j) * 2
                    const low = chunk[idx]
                    const high = chunk[idx + 1]
                    const token = toUInt16(low, high)
                    if (j < sampleSize - 1) xs.push(token)
                    if (j > 0) ys.push(token)
                }
                yield { xs, ys }
            }
        }
    }

    return tokenizedIterator(tf, generator, vocabSize)
}
