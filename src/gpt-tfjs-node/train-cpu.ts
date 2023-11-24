import * as tf from '@tensorflow/tfjs-node'
import train from './train.js'
import setBackend from '../shared/backend.js'

async function main() {
    await setBackend('cpu')
    await train(tf, 'node-cpu')
}
main()
