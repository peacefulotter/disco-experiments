import * as gpt from '#/gpt-tfjs'
import { BackendName, Config, TokenizedDataset } from './tfjs-types'
import setBackend from './backend'

function prepareIdx(tf: any, idx: any) {
    tf.tidy(() => {
        // Check if idx is a tensor or an array
        if (idx instanceof tf.Tensor) {
            idx = idx.clone()
        } else {
            idx = tf.tensor(idx)
        }
        // Check data type
        if (idx.dtype !== 'int32') {
            idx = idx.toInt()
        }
        // If the shape of idx is 1D, we need to add a dimension
        if (idx.shape.length === 1) {
            idx = idx.expandDims(0)
        }
        tf.keep(idx)
        // keep idx from deletion
    })
    return idx
}

function generateOnce(tf: any, model: any, idx: any, config: any) {
    let timePerToken = performance.now()
    let timePrediction = 0
    tf.tidy(() => {
        const block_size = model.inputs[0].shape[1]
        const idxCond =
            idx.shape[1] <= block_size
                ? idx
                : idx.slice([0, -block_size], [-1, -1])
        // Forward the model to get the logits for the index in the sequence
        timePrediction = performance.now()
        const logits = model.predict(idxCond)
        timePrediction = performance.now() - timePrediction
        // pluck the logits at the final step and scale by desired temperature
        const logitsScaled = logits
            .slice([0, idx.shape[1] - 1, 0])
            .reshape([logits.shape[0], logits.shape[2]])
            .div(tf.scalar(config.temperature))
        // apply softmax to convert logits to (normalized) probabilities
        const probs = logitsScaled.softmax(-1)
        const idxNext = probs.argMax(-1).expandDims(1)
        tf.dispose([logits, logitsScaled, probs, idxNext])
    })
    timePerToken = performance.now() - timePerToken
    return {
        timePerToken,
        timePrediction,
    }
}

type InferenceConfig = Config & {
    maxLength: number
    temperature: number
}

export default async function inference(
    tf: any,
    config: Config,
    dataset: TokenizedDataset,
    backendName: BackendName
) {
    await setBackend(tf, backendName)

    const inferenceIterations = 200
    const model = gpt.GPT(config)
    const params: InferenceConfig = {
        maxLength: 32,
        temperature: 1,
        ...config,
        batchSize: 16,
    }
    const stats: [number, number, number] = [0, 0, 0]

    const iter = await dataset.iterator()
    for (let i = 0; i < inferenceIterations; i++) {
        const { value } = await iter.next()
        const { xs: tokens, ys } = value
        const idx = prepareIdx(tf, tokens)
        const { timePerToken, timePrediction } = generateOnce(
            tf,
            model,
            idx,
            params
        )
        stats[0] += timePrediction
        stats[1] += timePerToken
        stats[2] += 1
        await new Promise((r) => setTimeout(r, 1))
        tf.dispose([idx, tokens, ys])
    }

    console.log(
        'Over',
        inferenceIterations,
        'iterations:\nAvg prediction time:',
        stats[0] / stats[2],
        'ms\nTime per token:',
        stats[1] / stats[2],
        'ms'
    )
}
