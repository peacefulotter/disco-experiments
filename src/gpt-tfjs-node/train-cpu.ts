import * as tf from '@tensorflow/tfjs-node'
import train from './train.js'

async function main() {
    await train(tf, 'cpu')
}
main()
