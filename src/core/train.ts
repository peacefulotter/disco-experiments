import { model as gpt, train as gptTrain } from '#/gpt-tfjs'

import Wandb from './wandb'
import setBackend from './backend'
import evaluate from './evaluate'
import { BackendName, Config, EncodedDataset } from './tfjs-types'

type DatasetWithCallback = {
    dataset: EncodedDataset
    onEnd?: () => void | Promise<void>
}

export default async function train(
    tf: any,
    config: Config,
    backendName: BackendName,
    wandb: Wandb,
    getTrainDataset: () => Promise<DatasetWithCallback>,
    getEvalDataset: () => Promise<DatasetWithCallback>
) {
    await setBackend(tf, backendName)

    const { dataset: trainDataset, onEnd: onTrainEnd } = await getTrainDataset()

    console.log(config)

    console.log('Running', config.modelType)
    const model = new gpt.GPTLMHeadModel(config)

    const start = Date.now()
    let time = start
    const cb = async (model: any, loss: number, iter: number) => {
        const payload = {
            'train/perplexity': Math.exp(loss),
            'train/loss': loss,
            iter,
            mem: tf.memory().numBytes,
            dt_ms: Date.now() - time,
            time_s: (Date.now() - start) / 1000,
        }

        if (iter % config.evalFreq == 0) {
            const { dataset: evalDataset, onEnd: onEvalEnd } =
                await getEvalDataset()
            const eval_res = await evaluate(tf, model, evalDataset, config)
            Object.assign(payload, eval_res)
            await onEvalEnd?.()
        }

        await wandb.log(payload)
        time = Date.now()
    }

    await gptTrain(model, trainDataset, config, cb)

    await wandb.finish()

    await onTrainEnd?.()
}
