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

    const requestNext = async () =>
        new Promise<number[]>((resolve) => {
            ws.onmessage = (payload) => {
                const buffer = JSON.parse(payload.data) as {
                    type: Buffer
                    data: number[]
                }
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
