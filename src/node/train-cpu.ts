import * as tf from '@tensorflow/tfjs-node'
import train from './train'

async function main() {
    await train(tf, 'cpu')
}
main()
