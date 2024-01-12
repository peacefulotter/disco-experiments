import * as tf from '@tensorflow/tfjs-node'
import config from '~/config'
import { getDataset } from '~/dataset-node'
import inference from '~/inference'

async function main() {
    const backendName = 'cpu'
    const dataset = await getDataset(config, 'valid')
    inference(tf, config, dataset, backendName)
}
main()
