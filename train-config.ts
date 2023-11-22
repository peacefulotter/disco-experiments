import { Models } from './tfjs-types.js'

const modelType: Models = 'gpt-nano'
const dataset = 'wikitext'
const batchSize = 8
const seqLength = 128
const lr = 0.001
const maxIter = 300

const baseConfig = {
    debug: false,
    verbose: false,

    modelType,
    nHead: 3,
    nLayer: 3,
    nEmbd: 48,

    dataset,
    batchSize,
    blockSize: seqLength,
    lr,
    maxIter,
    shuffle: false,
    weightDecay: false,
    weight_decay: 0.001,
    optimizer: 'adamw',
    gradClip: 1,
    scheduler: null,
    dropout: 0,
    numWorkers: 4,
    vocabSize: 50257,

    wandbProject: 'disco-gpt-benchmark',

    evalFreq: 25,
    evalSeqPrefix: 'none',
    maxEvalBatches: 24,
} as const

const trainConfig = {
    ...baseConfig,
    wandbName: `${modelType}_${dataset}_bs=${batchSize}_seq=${seqLength}_lr=${lr}_iter=${maxIter}`,
} as const

export default trainConfig
