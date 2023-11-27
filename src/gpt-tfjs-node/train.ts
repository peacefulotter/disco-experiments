import { getDataset } from '~/dataset-node'
import config from '~/config'
import train from '~/train'
import { BackendName } from '~/tfjs-types'
import WandbNode from '~/wandb-node'

export default async function main(tf: any, backendName: BackendName) {
    const getDatasetRoutine = (split: string) => async () => ({
        dataset: await getDataset(config, split),
    })
    const getTrainDataset = getDatasetRoutine('train')
    const getEvalDataset = getDatasetRoutine('valid')

    const wandb = new WandbNode(config, 'node', backendName)

    await train(tf, backendName, wandb, getTrainDataset, getEvalDataset)
}
