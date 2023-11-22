import * as tf from '@tensorflow/tfjs'
import trainConfig from './train-config.js'

export type Models = 'gpt-nano' | 'gpt-micro' | 'gpt-mini' //, 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']

export type EncodedDataset = tf.data.Dataset<tf.TensorContainer>
export type Dataset = tf.data.Dataset<{ text: string }>

export type Callback = (
    model: any,
    loss: number,
    iter: number
) => Promise<void> | void

export type TrainConfig = typeof trainConfig
export type Config = TrainConfig & {
    dir: string
    split: string
    files: string[]
    callbacks?: Callback[]
}
