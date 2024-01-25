import * as tf from '@tensorflow/tfjs-node'
import * as gpt from '#/gpt-tfjs'
import config from '~/config'
import { getDataset } from '~/dataset-node'
import inference, { generateFromString } from '~/inference'

async function main() {
    const backendName = 'cpu'
    const model = gpt.GPT(config)
    generateFromString(model, 'What is GPT?', 32)
    // const dataset = await getDataset(config, 'valid')
    // inference(tf, config, dataset, backendName)
}
main()
