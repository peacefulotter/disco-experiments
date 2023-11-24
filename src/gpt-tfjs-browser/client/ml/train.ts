import * as tf from '@tensorflow/tfjs'
import { model } from 'gpt-tfjs'
import getDataset from './dataset'
import * as wandb from './wandb'
import setBackend, { BackendName } from '../../../shared/backend'
import evaluate from '~/evaluate'
import config from '~/config'

const { GPTLMHeadModel } = model

export default async function main(prefix: string, backendName: BackendName) {
    await setBackend(backendName)

    const date = new Date().toISOString()
    const { dataset, closeWS } = await getDataset(config, 'train')

    console.log(config)

    const save: any = { init: undefined, logs: [] }
    await wandb.init(save, config, prefix + '_' + backendName, date)

    console.log('Running', config.modelType)
    const gpt = GPTLMHeadModel(config)

    const start = Date.now()
    let time = start
    const cb = async (model: any, loss: number, iter: number) => {
        const payload = {
            'train/loss': loss,
            iter,
            mem: tf.memory().numBytes,
            dt_ms: Date.now() - time,
            time_s: (Date.now() - start) / 1000,
        }

        if (iter % config.evalFreq == 0) {
            let { dataset: evalDataset, closeWS } = await getDataset(
                config,
                'valid'
            )
            const eval_res = await evaluate(tf, model, evalDataset, config)
            Object.assign(payload, eval_res)
            closeWS()
            // TODO: eval like in llm-baselines with table
        }

        await wandb.log(save, payload)
        time = Date.now()
    }

    await gpt.train(dataset, {
        ...config,
        shuffle: 'batch',
        callbacks: [cb],
    })

    await wandb.finish(save, config, backendName)

    closeWS()
}
