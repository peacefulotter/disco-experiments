import * as tf from '@tensorflow/tfjs-node'
import * as gpt from '#/gpt-tfjs'
import { encode, decode } from 'gpt-tokenizer/esm/model/text-davinci-003'
import { Config, TokenizedDataset } from './tfjs-types'

function prepareIdx(idx: any) {
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

function generateOnce(model: any, idx: any, config: any) {
    let timePerToken = performance.now()
    let timePrediction = 0
    const token = tf.tidy(() => {
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
        const next = idxNext.arraySync() as number[][]
        tf.dispose([logits, logitsScaled, probs])
        return next[0][0]
    })
    timePerToken = performance.now() - timePerToken
    return {
        token,
        timePerToken,
        timePrediction,
    }
}

type InferenceConfig = {
    temperature: number
}

export async function generateFromString(
    model: any,
    input: string,
    max_new_tokens: number
) {
    const inputTokens = encode(input)
    for (let i = 0; i < max_new_tokens; i++) {
        const idx: tf.Tensor = prepareIdx(inputTokens)
        const { token } = generateOnce(model, idx, { temperature: 1 })
        inputTokens.push(token)
        tf.dispose([idx])
    }
    const output = decode(inputTokens)
    console.log('decoded:', output.replaceAll('\n', ''))
}

export default async function inference(
    tf: any,
    config: Config,
    dataset: TokenizedDataset
) {
    const inferenceIterations = 100
    const model = gpt.GPT(config)
    const params: InferenceConfig = {
        temperature: 1,
    }
    const stats: [number, number] = [0, 0]

    const iter = await dataset.iterator()
    for (let i = 0; i < inferenceIterations; i++) {
        const { value } = await iter.next()
        const { xs: tokens, ys } = value
        const idx = prepareIdx(tokens)
        const { timePerToken, timePrediction } = generateOnce(
            model,
            idx,
            params
        )
        stats[0] += timePrediction
        stats[1] += timePerToken
        tf.dispose([idx, tokens, ys])
    }

    console.log(
        'Over',
        inferenceIterations,
        'iterations:\nAvg prediction time:',
        stats[0] / inferenceIterations,
        'ms\nTime per token:',
        stats[1] / inferenceIterations,
        'ms'
    )
}
