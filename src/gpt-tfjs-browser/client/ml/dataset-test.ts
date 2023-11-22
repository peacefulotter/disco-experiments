'use client'
import { getFrontendDataset } from './dataset'
import getConfig from './config'

export default async function datasetTest() {
    const config = await getConfig()
    const dataset = await getFrontendDataset(config, 'valid')
    const iter = await dataset.iterator()
    const next = await iter.next()
    console.log(next)
    console.log(next.value)
    console.log(next.value.x.shape)
    console.log(next.value.y.shape)
}
