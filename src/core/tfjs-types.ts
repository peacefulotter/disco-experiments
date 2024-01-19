import * as tf from '@tensorflow/tfjs'
import { GPTConfig, type ModelType } from '#/gpt-tfjs'

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

export type TokenizedDataset = tf.data.Dataset<BatchedTokenizedTensorSample>

export type AsyncTokenizedGenerator = AsyncGenerator<
    BatchedTokenizedTensorSample,
    void,
    unknown
>

export type BatchedTokenizedTensorSample = {
    xs: tf.Tensor2D // tokens of size (B, blockSize)
    ys: tf.Tensor3D // one hot encoded vector of size (B, blockSize, vocabSize)
}

export type TokenizedDatasetWithCallback = {
    dataset: TokenizedDataset
    onEnd?: () => void | Promise<void>
}

export type CoreElement = number[] | Buffer | Uint8Array
export type CoreIterator = AsyncIterator<CoreElement, CoreElement, CoreElement>

export type Callback = (
    model: any,
    loss: number,
    iter: number
) => Promise<void> | void

export type BaseConfig = GPTConfig & {
    dataset: string
    optimizer: string
    scheduler: string | null
    gradientClipNorm: number
    vocabSize: number
    wandbProject: string
    evalFreq: number
    evalSeqPrefix: string
    maxEvalBatches: number
    gpu: string
}

export type Config = BaseConfig &
    Model & {
        platform: 'browser' | 'node'
        backend: BackendName
    }

export type ParsedWSSearchParams = {
    id: string
    config: Config
    split: string
}
export type WSSearchParams = Record<keyof ParsedWSSearchParams, string>
