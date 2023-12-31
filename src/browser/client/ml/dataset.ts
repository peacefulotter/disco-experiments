import * as tf from '@tensorflow/tfjs'
import { Config } from '~/tfjs-types'
import { getDataset as getBackboneDataset } from '~/dataset'

const getWebSocket = async (split: string) =>
    new Promise<WebSocket>((resolve) => {
        const brokerURL = `ws://localhost:3001/ws?split=${split}`
        const ws = new WebSocket(brokerURL)
        ws.onopen = () => {
            console.log('Dataset websocket open for split', split)
            resolve(ws)
        }
    })

export default async function getDataset(config: Config, split: string) {
    const ws = await getWebSocket(split)
    console.log(ws)

    const requestNext = async () =>
        new Promise<number[]>((resolve) => {
            // console.time('requestNext')
            ws.onmessage = (payload) => {
                const buffer = JSON.parse(payload.data) as {
                    type: Buffer
                    data: number[]
                }
                // console.timeEnd('requestNext')
                resolve(buffer.data)
            }
            setTimeout(() => ws.send('req'), 1)
        })

    const dataset = await getBackboneDataset(tf, config, requestNext)

    return {
        dataset,
        closeWS: () => ws.close(),
    }
}
