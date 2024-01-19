import { getInfiniteBufferIteratorFromFile } from './dataset-node'
import config from './config'
import { toUInt16 } from './dataset'

async function main() {
    const iter = await getInfiniteBufferIteratorFromFile(config, 'train')

    const sampleSize = config.blockSize + 1

    while (true) {
        const { value } = await iter.next()
        const chunk = value.toJSON().data
        if (!chunk) break

        for (let i = 0; i < config.batchSize; i++) {
            for (let j = 0; j < sampleSize; j++) {
                const idx = (i * sampleSize + j) * 2
                const low = chunk[idx]
                const high = chunk[idx + 1]
                const token = toUInt16(low, high)

                if (token < 0 || token >= config.vocabSize) {
                    throw new Error(
                        'Tokenized dataset contains a token that is higher than the vocab size'
                    )
                }
            }
        }
    }

    console.log('Test passed')
}

main()
