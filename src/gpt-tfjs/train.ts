import * as tf from '@tensorflow/tfjs'
import { AdamW, clipByGlobalNormObj } from './optimizers'
import { GPTConfig, DEFAULT_CONFIG } from './config'
import {
    Config,
    TokenizedDataset,
    TokenizedDatasetWithCallback,
} from '~/tfjs-types'
import evaluate from './evaluate'
import Wandb from './wandb'

export type WandbConfig = GPTConfig & {
    dataset: string
    platform: string
    backend: string
    gpu: string
    model: string
}

export type GPTConfigWithWandb = Required<GPTConfig> & WandbConfig

export const getConfig = (config: Config): GPTConfigWithWandb => ({
    ...DEFAULT_CONFIG,
    ...config,
    platform:
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
            ? 'browser'
            : 'node',
    gpu: 'nvidia-4070-ti',
    model: config.modelType,
    backend: tf.getBackend(),
})

const getCustomAdam = (model: any, c: Required<GPTConfig>): tf.Optimizer => {
    const includeInWeightDecay: string[] = []
    const excludeFromWeightDecay: string[] = []

    model.getNamedWeights().forEach((v: any) => {
        if (
            v.name.includes('bias') ||
            v.name.includes('normalization') ||
            v.name.includes('emb')
        ) {
            excludeFromWeightDecay.push(v.name)
        } else {
            includeInWeightDecay.push(v.name)
        }
    })
    return new AdamW({
        learningRate: c.lr,
        weightDecayRate: c.weightDecay as number,
        includeInWeightDecay,
        excludeFromWeightDecay,
    })
}

export async function train(
    model: tf.LayersModel,
    ds: TokenizedDataset,
    config: Config,
    getEvalDataset?: () => Promise<TokenizedDatasetWithCallback>
): Promise<void> {
    console.log('Starting training on', tf.getBackend(), 'backend')
    const c = getConfig(config)
    console.log(c)

    // model.compile({
    //     optimizer: tf.train.adam(c.lr),
    //     loss: tf.losses.softmaxCrossEntropy,
    //     metrics: {
    //         entropy: (y, pred) => {
    //             console.log(y.shape, pred.shape)
    //             return tf.losses.softmaxCrossEntropy(y, pred)
    //         },
    //     },
    // })

    // const history = await model.fitDataset(ds, {
    //     epochs: 1,
    //     batchesPerEpoch: 5,
    //     callbacks: {
    //         onBatchBegin(batch, logs) {
    //             console.log('onBatchBegin', batch, logs)
    //         },
    //         onBatchEnd(batch, logs) {
    //             console.log('onBatchEnd', batch, logs)
    //         },
    //     },
    // })

    // console.log(history)

    const opt = c.weightDecay ? getCustomAdam(model, c) : tf.train.adam(c.lr)

    const wandb = new Wandb(c)

    let epoch = 1
    let iteration = 1
    let iterator = await ds.iterator()

    const start = Date.now()
    let time = start

    console.warn('=== Starting training ===')

    while (true) {
        // Get new batch of x and y
        let datasetTime = Date.now()
        let next = await iterator.next()
        if (next.done) {
            epoch++
            if (c.epochs && epoch > c.epochs) {
                break
            }
            iterator = await ds.iterator()
            next = await iterator.next()
        }
        const { xs, ys } = next.value

        datasetTime = Date.now() - datasetTime

        let iterationTime = Date.now()

        // Calculates loss, computes gradients and applies them
        const loss = tf.tidy(() => {
            let { grads, value: loss } = opt.computeGradients(() => {
                const logits = model.apply(xs)
                const loss = tf.losses.softmaxCrossEntropy(ys, logits)
                return loss as tf.Scalar
            })
            let gradsClipped = clipByGlobalNormObj(grads, 1)
            opt.applyGradients(gradsClipped)
            return loss
        })

        const lossVal = await loss.array()

        // Create a WandB log payload, evaluate every
        const memory = tf.memory().numBytes * 0.000001
        const payload = {
            'train/perplexity': Math.exp(lossVal),
            'train/loss': lossVal,
            iter: iteration,
            'tf-mem': memory, // MB
            dt_ms: Date.now() - time,
            time_s: (Date.now() - start) / 1000,
        }

        if (c.evaluate && iteration % c.evaluateEvery === 0) {
            if (!getEvalDataset) {
                throw new Error(
                    'No evaluation dataset provided but config.evaluate is set'
                )
            }
            const { dataset: evalDataset, onEnd } = await getEvalDataset()
            const evalPayload = await evaluate(tf, model, evalDataset, c)
            Object.assign(payload, evalPayload)
            onEnd?.()
        }

        wandb.log(payload)
        time = Date.now()

        tf.dispose([loss, xs, ys])

        iterationTime = Date.now() - iterationTime
        console.log(
            `Epoch: ${epoch},\tStep: ${iteration} / ${
                c.maxIter
            },\tLoss: ${lossVal.toFixed(
                3
            )},\tIteration time: ${iterationTime} ms, \tDataset time: ${datasetTime} ms,\tMemory: ${memory.toFixed(
                2
            )} MB`
        )

        // Check if we should stop
        iteration++
        if (c.maxIter && iteration > c.maxIter) {
            break
        }

        if (c.verbose) {
            console.log('Mem:', tf.memory())
            console.log(`Epoch: ${epoch}, Step: ${iteration}, Loss: ${lossVal}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 1))
    }

    wandb.finish()
}
