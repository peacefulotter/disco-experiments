'use client'
import { v4 as randomUUID } from 'uuid'
import * as tf from '@tensorflow/tfjs'
import {
    Config,
    TokenizedDatasetWithCallback,
    WSSearchParams,
} from '~/tfjs-types'
import { getDataset as getCoreDataset } from '~/dataset'

class Deferred<T> {
    promise: Promise<T> = new Promise<T>(() => {})
    resolve: (value: T | PromiseLike<T>) => void = () => {}
    reject: (reason?: any) => void = () => {}

    constructor() {
        this.reset()
    }

    reset() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }
}

const getWebSocket = (config: Config, split: string) => {
    const BROKER_URL = 'ws://localhost:3001/ws'
    const url = new URL(BROKER_URL)

    const id = randomUUID()
    const searchParams: WSSearchParams = {
        id,
        config: JSON.stringify(config),
        split,
    }
    for (const [k, v] of Object.entries(searchParams))
        url.searchParams.append(k, v)

    const ws = new WebSocket(url)

    ws.onerror = (err) => {
        console.error(err)
    }

    return new Promise<{ ws: WebSocket; id: string }>((resolve) => {
        ws.onopen = () => {
            resolve({ ws, id })
        }
    })
}

export default async function getDataset(
    config: Config,
    split: string
): Promise<TokenizedDatasetWithCallback> {
    const { ws, id } = await getWebSocket(config, split)

    const cache = new Deferred<{ value: Buffer; done: boolean }>()

    ws.onmessage = async (payload: globalThis.MessageEvent<Blob>) => {
        const arrayBuffer = await payload.data.arrayBuffer()
        const value = Buffer.from(arrayBuffer)
        cache.resolve({ value: value, done: false })
    }

    const iterator = {
        next: async () => {
            ws.send(JSON.stringify({ id }))
            const sample = await cache.promise
            cache.reset()
            return sample
        },
    }

    const dataset = await getCoreDataset(tf, config, iterator)

    return {
        dataset,
        onEnd: () => ws.close(),
    }
}
