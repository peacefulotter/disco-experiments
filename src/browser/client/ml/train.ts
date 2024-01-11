import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import train from '~/train'
import Wandb from '~/wandb'
import { BrowserBackendName } from '~/tfjs-types'
import getConfig from './config'

export default async function main(backendName: BrowserBackendName) {
    const config = await getConfig()
    const getTrainDataset = async () => {
        const { dataset, closeWS } = await getDataset(config, 'train')
        return { dataset, onEnd: closeWS }
    }
    const getEvalDataset = async () => {
        const { dataset: evalDataset, closeWS: evalCloseWs } = await getDataset(
            config,
            'valid'
        )
        return { dataset: evalDataset, onEnd: evalCloseWs }
    }

    const wandb = new Wandb(config)

    await train(tf, config, backendName, wandb, getTrainDataset, getEvalDataset)
}
