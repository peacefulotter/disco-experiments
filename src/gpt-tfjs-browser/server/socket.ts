import { WebSocketServer } from 'ws'
import { Server } from './types.js'
import { getPreprocessedDataset } from './dataset.js'
import config from '../../config.js'
import { IncomingMessage } from 'http'

const dummyUrl = 'http://localhost:3001' // can be anything as long as it's a valid URL

const getSplit = (req: IncomingMessage) => {
    const url = new URL(`${dummyUrl}${req.url}`)
    const split = url.searchParams.get('split') as string
    console.log('Requested split:', split)
    return split
}

const initWebsockets = async (server: Server) => {
    const wss = new WebSocketServer({ server })

    wss.on('connection', async (ws, req) => {
        console.log('Connection with client established')

        const split = getSplit(req)
        const dataset = await getPreprocessedDataset(config, split)

        ws.on('message', async (data) => {
            const { value } = await dataset.next()
            console.log('received: ', data)
            console.log('sending: ', value)
            ws.send(JSON.stringify(value))
        })
    })
}

export default initWebsockets
