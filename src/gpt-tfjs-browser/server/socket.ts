import { WebSocketServer } from 'ws'
import { Server } from './types.js'

const initWebsockets = async (server: Server) => {
    const wss = new WebSocketServer({ server })

    wss.on('connection', async (ws) => {
        console.log('ON CONNECTION')

        ws.on('message', (data) => {
            console.log('received: ', data)
            const payload = JSON.stringify({
                type: 'CONNECTED',
                data: "I'm connected!",
            })
            ws.send(payload)
        })
    })
}

export default initWebsockets
