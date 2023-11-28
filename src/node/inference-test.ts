import * as tf from '@tensorflow/tfjs-node-gpu'
import config from '~/config'
import { getDataset } from '~/dataset-node'
import inference from '~/inference'

async function main() {
    const backendName = 'tensorflow'
    const dataset = await getDataset(config, 'valid')
    inference(tf, dataset, backendName)
}
main()
