import {
    Config,
    AsyncTokenizedGenerator,
    CoreIterator,
    TokenizedDataset,
} from './tfjs-types'

export const toUInt16 = (low: number, high: number) => {
    low &= 0xff
    high &= 0xff
    return (high << 8) | low
}

export async function getDataset(
    tf: any,
    config: Config,
    iterator: CoreIterator
): Promise<TokenizedDataset> {
    const { vocabSize, blockSize } = config
    const batchSize = config.batchSize
    const sampleSize = blockSize + 1

    async function* generator(): AsyncTokenizedGenerator {
        let next = iterator.next()
        while (true) {
            const { value: chunk } = await next
            if (!chunk) break

            // pre-fetch the next chunk even before actually requesting it
            next = iterator.next()

            const xs = tf.buffer([batchSize, blockSize], 'int32')
            const ys = tf.buffer([batchSize, blockSize, vocabSize], 'int32')

            for (let i = 0; i < batchSize; i++) {
                for (let j = 0; j < sampleSize; j++) {
                    const idx = (i * sampleSize + j) * 2
                    const low = chunk[idx]
                    const high = chunk[idx + 1]
                    const token = toUInt16(low, high)
                    if (j < sampleSize - 1) xs.set(token, i, j)
                    if (j > 0) ys.set(1, i, j - 1, token)
                }
            }

            const x = xs.toTensor()
            const y = ys.toTensor()
            yield {
                xs: x, //  as tf.Tensor2D,
                ys: y, // as tf.Tensor3D,
            }
        }
    }

    // cast as any because tf.data.generator does not take a type AsyncGenerator (but it works)
    return tf.data.generator(generator as any)
}
