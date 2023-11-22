import * as tf from '@tensorflow/tfjs'
import { model } from 'gpt-tfjs'
import { getPreprocessedDataset } from './dataset'
import evaluate from './evaluate'
import * as wandb from './wandb'
import setBackend, { BackendName } from './backend'
import getConfig from './config'

const { GPTLMHeadModel } = model

export default async function main(prefix: string, backendName: BackendName) {
    await setBackend(backendName)

    const date = new Date().toISOString()
    const trainConfig = await getConfig('train')
    const evalConfig = await getConfig('val')
    const dataset = await getPreprocessedDataset(trainConfig)

    console.log(trainConfig)

    const save: any = { init: undefined, logs: [] }
    await wandb.init(save, trainConfig, prefix + '_' + backendName, date)

    console.log('Running', trainConfig.modelType)
    const gpt = GPTLMHeadModel(trainConfig)

    const start = Date.now()
    let time = start
    const cb = async (model: any, loss: number, iter: number) => {
        console.log(iter)

        const payload = {
            'train/loss': loss,
            iter,
            mem: tf.memory().numBytes,
            dt_ms: Date.now() - time,
            time_s: (Date.now() - start) / 1000,
        }

        if (iter % evalConfig.evalFreq == 0) {
            const eval_res = await evaluate(tf, model, evalConfig)
            Object.assign(payload, eval_res)
            // TODO: eval like in llm-baselines with table
        }

        await wandb.log(save, payload)
        time = Date.now()
    }

    await gpt.train(dataset, {
        ...trainConfig,
        shuffle: 'batch',
        callbacks: [cb],
    })

    await wandb.finish(save, trainConfig)
}
