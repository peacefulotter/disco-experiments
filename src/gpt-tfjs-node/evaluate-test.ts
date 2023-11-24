import * as tf from '@tensorflow/tfjs-node'
import { model } from 'gpt-tfjs'
import getDataset from './dataset.js'
import config from '../shared/config.js'
import evaluate from '../shared/evaluate.js'
const { GPTLMHeadModel } = model

async function main() {
    const gpt = GPTLMHeadModel(config)
    const dataset = await getDataset(config, 'valid')
    const res = await evaluate(tf, gpt, dataset, config)
    console.log(res)
    console.log(tf.memory())
}
main()
