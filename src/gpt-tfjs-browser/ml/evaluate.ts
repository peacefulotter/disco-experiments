import { Config } from '~/tfjs-types.js'
import { getFrontendDataset } from './dataset'

export default async function evaluate(tf: any, model: any, config: Config) {
    let evalDataset = await getFrontendDataset(config, 'valid')
    evalDataset = evalDataset.batch(config.batchSize)
    console.log('Evaluating..')

    const iter = await evalDataset.iterator()
    let losses = []
    const acc: [number, number] = [0, 0]

    let iteration = 0
    while (iteration < config.maxEvalBatches) {
        const next = await iter.next()
        if (next == null) break
        const { x, y } = next.value
        const logits = model.apply(x)
        // Loss
        const loss = tf.losses.softmaxCrossEntropy(y, logits)
        const lossVal = await loss.array()
        losses.push(lossVal)
        // Accuracy
        const acc_tensor = tf.metrics.categoricalAccuracy(y, logits)
        const acc_sum = acc_tensor.sum()
        acc[0] += await acc_sum.array()
        acc[1] += acc_tensor.shape[0] * acc_tensor.shape[1]

        acc_tensor.dispose()
        acc_sum.dispose()
        loss.dispose()
        logits.dispose()
        x.dispose()
        y.dispose()

        console.log(tf.memory())
        iteration++
    }

    const loss_tensor = await tf.tensor(losses).mean()
    const loss = await loss_tensor.array()
    const pp = 2.71828 ** loss

    loss_tensor.dispose()

    return {
        'val/loss': loss,
        'val/perplexity': pp,
        'val/acc': acc[0] / acc[1],
    }
}
