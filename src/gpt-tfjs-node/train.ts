import { getDataset } from '../shared/dataset-node.js'
import config from '~/config.js'
import train from '~/train.js'
import { BackendName } from '~/tfjs-types.js'
import WandbNode from '~/wandb-node.js'

export default async function main(tf: any, backendName: BackendName) {
    const getDatasetRoutine = (split: string) => async () => ({
        dataset: await getDataset(config, split),
    })
    const getTrainDataset = getDatasetRoutine('train')
    const getEvalDataset = getDatasetRoutine('valid')

    const wandb = new WandbNode(config, 'node', backendName)

    await train(tf, backendName, wandb, getTrainDataset, getEvalDataset)
}
