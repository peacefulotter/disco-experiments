import * as tf from '@tensorflow/tfjs'

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

export type BaseConfig = {
    debug: boolean
    verbose: boolean
    modelType: string
    dataset: string
    batchSize: number
    blockSize: number
    lr: number
    maxIter: number
    weightDecay: number | false
    optimizer: string
    gradClip: number
    scheduler: string | null
    embdDrop: number
    bias: boolean
    numWorkers: number
    vocabSize: number
    wandbProject: string
    evalFreq: number
    evalSeqPrefix: string
    maxEvalBatches: number
}

export type Config = BaseConfig &
    Model & {
        shuffle: true | 'batch' | number // only NaN works in our case
        residDrop: number
        wandbName: string
    }
