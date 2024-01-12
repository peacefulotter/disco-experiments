import * as tf from '@tensorflow/tfjs'
import { AdamW, clipByGlobalNormObj } from './optimizers'
import { GPTConfig } from './model'

export async function train(
    model: any,
    ds: any,
    config: GPTConfig,
    callback?: (model: any, loss: number, iter: number) => void | Promise<void>
): Promise<void> {
    console.log('Starting training on', tf.getBackend(), 'backend')

    ds = ds.batch(config.batchSize)

    if (config.weightDecay === true) {
        config.weightDecay = 1e-4
    }
    let opt: tf.Optimizer
    if (config.weightDecay) {
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
        opt = new AdamW({
            learningRate: config.lr,
            weightDecayRate: config.weightDecay,
            includeInWeightDecay,
            excludeFromWeightDecay,
        })
    } else {
        opt = tf.train.adam(config.lr)
    }

    let epoch = 1
    let iteration = 1
    let iterator = await ds.iterator()

    const start = Date.now()
    let time = start

    while (true) {
        // Get new batch of x and y
        let next = await iterator.next()
        if (next.done) {
            epoch++
            if (config.epochs && epoch > config.epochs) {
                break
            }
            iterator = await ds.iterator()
            next = await iterator.next()
        }
        const { xs, ys } = next.value

        // Calculates loss, computes gradients and applies them
        const loss = tf.tidy(() => {
            const { grads, value: loss } = opt.computeGradients(() => {
                const logits = model.apply(xs)
                const loss = tf.losses.softmaxCrossEntropy(ys, logits)
                return loss as tf.Scalar
            })
            const gradsClipped = clipByGlobalNormObj(
                grads,
                config.gradientClipNorm ?? 1
            )
            opt.applyGradients(gradsClipped)
            return loss
        })

        const lossVal = await loss.array()
        await callback?.(model, lossVal, iteration)

        if (iteration % 100 === 0) {
            console.log(iteration, Date.now() - time)
        }
        time = Date.now()

        // Dispose everything
        loss.dispose()
        xs.dispose()
        ys.dispose()

        // Check if we should stop
        iteration++
        if (config.maxIter && iteration > config.maxIter) {
            break
        }

        if (config.verbose) {
            console.log('Mem:', tf.memory())
            console.log(`Epoch: ${epoch}, Step: ${iteration}, Loss: ${lossVal}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 1))
    }
}
