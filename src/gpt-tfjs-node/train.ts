import wandb from '@wandb/sdk'
import { model } from 'gpt-tfjs'
import getDataset from './dataset.js'
import config from '~/config.js'
import evaluate from '~/evaluate.js'
const { GPTLMHeadModel } = model

// TODO: move train to shared, once wandb is fixed?

export default async function main(tf: any, prefix: string) {
    const date = new Date().toISOString()
    const trainDataset = await getDataset(config, 'train')
    let evalDataset = await getDataset(config, 'valid')
    evalDataset = evalDataset.batch(config.batchSize)

    console.log(config, prefix)

    await wandb.init({
        project: config.wandbProject,
        name: `node_${prefix}_${config.wandbName}`,
        config: { ...config, date },
    })

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
            const eval_res = await evaluate(tf, model, evalDataset, config)
            Object.assign(payload, eval_res)
            // TODO: eval like in llm-baselines with table
        }

        wandb.log(payload)
        time = Date.now()
    }
    await gpt.train(trainDataset, {
        ...config,
        shuffle: 'batch',
        callbacks: [cb],
    })

    await wandb.finish()
}
