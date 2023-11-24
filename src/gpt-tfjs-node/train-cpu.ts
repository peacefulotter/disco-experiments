import * as tf from '@tensorflow/tfjs-node'
import main from './train.js'

await main(tf, 'node-cpu')
