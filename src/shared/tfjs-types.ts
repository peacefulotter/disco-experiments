import * as tf from '@tensorflow/tfjs'
import config, { configModels } from './config.js'

export type Models = keyof typeof configModels //, 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']

export type EncodedDataset = tf.data.Dataset<tf.TensorContainer>
// export type Dataset = tf.data.Dataset<{ text: string }>

export type TokenizedSample = {
    x: number[]
    y: number[]
}

export type AsyncTokenizedGenerator = AsyncGenerator<
    TokenizedSample,
    void,
    unknown
>

export type Callback = (
    model: any,
    loss: number,
    iter: number
) => Promise<void> | void

export type Config = typeof config
