import * as tf from '@tensorflow/tfjs'
import { model as gpt } from '#/gpt-tfjs'

export type BrowserBackendName = 'cpu' | 'webgl' | 'webgpu' | 'wasm'
export type NodeBackendName = 'cpu' | 'wasm' | 'tensorflow'
export type BackendName = BrowserBackendName | NodeBackendName

export type Model = {
    nLayer: number
    nHead: number
    nEmbd: number
    vocabSize?: number
    blockSize?: number
}

export type EncodedDataset = tf.data.Dataset<tf.TensorContainer>

export type TokenizedSample = {
    xs: number[]
    ys: number[]
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

export type BaseConfig = {
    debug: boolean
    verbose: boolean
    modelType: gpt.ModelType
    dataset: string
    batchSize: number
    blockSize: number
    lr: number
    maxIter: number
    weightDecay: number | false
    optimizer: string
    scheduler: string | null
    dropout: number
    residDrop: number
    embdDrop: number
    gradientClipNorm: number
    bias: boolean
    numWorkers: number
    vocabSize: number
    wandbProject: string
    evalFreq: number
    evalSeqPrefix: string
    maxEvalBatches: number
    shuffle: true | 'batch' | number
    gpu: string
}

export type Config = BaseConfig &
    Model & {
        platform: 'browser' | 'node'
        backend: BackendName
    }
