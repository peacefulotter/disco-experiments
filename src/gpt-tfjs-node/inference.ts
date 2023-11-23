import * as tf from '@tensorflow/tfjs-node-gpu'
import { model } from 'gpt-tfjs'
import config from '~/config.js'
import getDataset from './dataset.js'

const { GPTLMHeadModel } = model

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
    let idxNext
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
        // TODO: topK sampling
        // apply softmax to convert logits to (normalized) probabilities
        const probs = logitsScaled.softmax(-1)
        idxNext = probs.argMax(-1)
        idxNext = idxNext.expandDims(1)
        tf.keep(idxNext)
    })
    timePerToken = performance.now() - timePerToken
    return {
        idxNext,
        timePerToken,
        timePrediction,
    }
}

async function main() {
    tf.setBackend('tensorflow')

    const dataset = await getDataset(config, 'valid')
    const gpt = GPTLMHeadModel(config)

    const maxNewTokens = 20
    const params = { maxLength: 32, temperature: 1, ...config }

    const iter = await dataset.iterator()
    for (let i = 0; i < 8; i++) {
        const { value } = await iter.next()
        const { x: tokens } = value
        const idx = prepareIdx(tokens)
        for (let step = 0; step < maxNewTokens; step++) {
            const { timePerToken, timePrediction } = generateOnce(
                gpt.model,
                idx,
                params
            )
            console.log(
                `prediction time: ${timePrediction}, time per token: ${timePerToken}`
            )
            await new Promise((r) => setTimeout(r, 1))
        }
    }
}

await main()
