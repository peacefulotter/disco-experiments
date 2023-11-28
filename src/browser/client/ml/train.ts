import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'
import '@tensorflow/tfjs-backend-wasm'

import getDataset from './dataset'
import train from '~/train'
import Wandb from '~/wandb'
import config from '~/config'
import { BrowserBackendName } from '~/tfjs-types'

export default async function main(backendName: BrowserBackendName) {
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

    const wandb = new Wandb(config, 'browser', backendName)

    await train(tf, backendName, wandb, getTrainDataset, getEvalDataset)
}
