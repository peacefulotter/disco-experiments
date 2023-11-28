import * as tf from '@tensorflow/tfjs-node-gpu'
import '@tensorflow/tfjs-backend-webgl'
import train from './train'

async function main() {
    await train(tf, 'tensorflow')
}
main()