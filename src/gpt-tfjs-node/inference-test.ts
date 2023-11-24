import * as tf from '@tensorflow/tfjs-node-gpu'
import config from '~/config.js'
import getDataset from './dataset.js'
import inference from '~/inference.js'

async function main() {
    const backendName = 'tensorflow'
    const dataset = await getDataset(config, 'valid')
    inference(tf, dataset, backendName)
}

await main()
