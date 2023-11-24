import { Config, EncodedDataset } from './tfjs-types.js'

export default async function evaluate(
    tf: any,
    model: any,
    dataset: EncodedDataset,
    config: Config
) {
    console.log('Evaluating..')

    dataset = dataset.batch(config.batchSize)
    const iter = await dataset.iterator()

    let total_loss = 0
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
        total_loss += lossVal

        // Accuracy
        const acc_tensor = tf.metrics.categoricalAccuracy(y, logits)
        const acc_sum = acc_tensor.sum()
        acc[0] += await acc_sum.array()
        acc[1] += acc_tensor.shape[0] * acc_tensor.shape[1]

        tf.dispose([acc_tensor, acc_sum, loss, logits, x, y])

        iteration++
    }

    const loss = total_loss / iteration
    const pp = 2.71828 ** loss

    return {
        'val/loss': loss,
        'val/perplexity': pp,
        'val/acc': acc[0] / acc[1],
    }
}
