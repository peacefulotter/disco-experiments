import * as tf from '@tensorflow/tfjs-node-gpu'
import '@tensorflow/tfjs-backend-webgl'
import train from './train.js'
import setBackend from '../shared/backend.js'

async function main() {
    await setBackend('tensorflow')
    await train(tf, 'node-gpu')
}
main()
