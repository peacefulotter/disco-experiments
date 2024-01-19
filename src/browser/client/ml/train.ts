'use client'
import * as tf from '@tensorflow/tfjs'
import getDataset from './dataset'
import train from '~/train'
import { BrowserBackendName } from '~/tfjs-types'
import getConfig from './config'

export default async function main(backendName: BrowserBackendName) {
    const config = await getConfig()
    const getTrainDataset = () => getDataset(config, 'train')
    const getEvalDataset = () => getDataset(config, 'valid')
    await train(tf, config, backendName, getTrainDataset, getEvalDataset)
}
