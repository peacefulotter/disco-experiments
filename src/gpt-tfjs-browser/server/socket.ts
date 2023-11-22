import { WebSocketServer } from 'ws'
import { Server } from './types.js'

const initWebsockets = async (server: Server) => {
    const wss = new WebSocketServer({ server })

    wss.on('connection', async (ws) => {
        console.log('ON CONNECTION')

        ws.on('message', async (data) => {
            console.log('received: ', data)
            const payload = JSON.stringify({
                x: [1, 2, 3],
                y: [4, 5, 6],
            })
            ws.send(payload)
        })
    })
}

export default initWebsockets
