import * as tf from '@tensorflow/tfjs-node'
import { Config, ParsedWSSearchParams, WSSearchParams } from '~/tfjs-types'
import { getInfiniteBufferIteratorFromFile } from '~/dataset-node'

const getParams = (searchParams: URLSearchParams) => {
    const obj = Object.fromEntries(searchParams) as WSSearchParams
    const params: ParsedWSSearchParams = {
        id: obj.id,
        config: JSON.parse(obj.config) as Config,
        split: obj.split,
    }
    return params
}

type WebsocketStatus = {
    iterator: AsyncIterator<Buffer, Buffer, Buffer>
    next: Promise<IteratorResult<Buffer, Buffer>>
}

const database: Record<string, WebsocketStatus> = {}

// The websocket server only serves the dataset, no need for any GPU backend
const done = await tf.setBackend('cpu')
console.log(
    'Backend set?',
    done,
    'to',
    tf.engine().backendName,
    tf.getBackend()
)

Bun.serve({
    async fetch(req, server) {
        const url = new URL(req.url)
        const { id, config, split } = getParams(url.searchParams)
        console.log(config)
        const iterator = await getInfiniteBufferIteratorFromFile(config, split)
        const next = iterator.next()
        database[id] = { iterator, next }
        server.upgrade(req)
    },
    websocket: {
        async message(ws, payload) {
            const { id } = JSON.parse(payload as string) as {
                id: string
            }
            const status = database[id]
            const data = await status.next
            ws.send(data.value)

            // same as in core text-loader, we pre-fetch the next chunk even before actually requesting it
            status.next = status.iterator.next()
        },
        async open(ws) {
            console.log('[WebSocketServer] Connection with client established')
        },
        async close(ws) {
            // TODO: on websocket close, remove from database
            console.log('[WebSocketServer] Bye')
        },
    },
    // TODO: store this and URL in .env to share URL between web/ and server/
    port: process.env.PORT || 3001,
})
