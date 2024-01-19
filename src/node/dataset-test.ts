import { getDataset } from '~/dataset-node.js'
import config from '~/config.js'

async function main() {
    const dataset = await getDataset(config, 'train')
    const iter = await dataset.iterator()

    const iterations = 1000
    const label = `Time for ${iterations} iterations, with ${config.blockSize} block size, ${config.batchSize} batch size, ${config.vocabSize} vocab size`
    console.time(label)
    for (let i = 0; i < iterations; i++) {
        await iter.next()
    }
    console.timeEnd(label)
}
main()
