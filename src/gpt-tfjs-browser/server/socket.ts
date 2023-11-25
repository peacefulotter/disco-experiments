import { WebSocketServer } from 'ws'
import { Server } from './types.js'
import {
    getDatasetFile,
    getIteratorDatasetFromFile,
} from '../../shared/dataset-node.js'
import config from '../../shared/config.js'
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
        const file = await getDatasetFile(config, split)
        const dataset = getIteratorDatasetFromFile(config, file)

        ws.on('message', async (data) => {
            const { value } = await dataset.next()
            ws.send(JSON.stringify(value))
        })
    })
}

export default initWebsockets
