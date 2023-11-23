import * as tf from '@tensorflow/tfjs-node'
import { model } from 'gpt-tfjs'
import getDataset from './dataset.js'
import config from '~/config.js'
import evaluate from '~/evaluate.js'
const { GPTLMHeadModel } = model

let dataset = await getDataset(config, 'valid')
dataset = dataset.batch(128)
const gpt = GPTLMHeadModel(config)
const res = await evaluate(tf, gpt, dataset, config)
console.log(res)
console.log(tf.memory())
