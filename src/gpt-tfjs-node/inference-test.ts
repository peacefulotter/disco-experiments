import * as tf from '@tensorflow/tfjs-node-gpu'
import config from '../shared/config.js'
import getDataset from './dataset.js'
import inference from '../shared/inference.js'

async function main() {
    const backendName = 'tensorflow'
    const dataset = await getDataset(config, 'valid')
    inference(tf, dataset, backendName)
}
main()
