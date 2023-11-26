import { model } from 'gpt-tfjs'
import { getDataset } from '../shared/dataset-node.js'
import Wandb from '../shared/wandb.js'
import config from '../shared/config.js'
import evaluate from '../shared/evaluate.js'
import { BackendName } from '~/tfjs-types.js'
import setBackend from '~/backend.js'
const { GPTLMHeadModel } = model

// TODO: move train to shared, once wandb is fixed?

export default async function train(tf: any, backendName: BackendName) {
    await setBackend(tf, backendName)
    const trainDataset = await getDataset(config, 'train')

    console.log(config)

    const wandb = new Wandb(config)
    await wandb.init('node', backendName)

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
            const evalDataset = await getDataset(config, 'valid')
            const eval_res = await evaluate(tf, model, evalDataset, config)
            Object.assign(payload, eval_res)
            // TODO: eval like in llm-baselines with table
        }

        console.log(payload)

        wandb.log(payload)
        time = Date.now()
    }
    await gpt.train(trainDataset, {
        ...config,
        callbacks: [cb],
    })

    await wandb.finish()
}
