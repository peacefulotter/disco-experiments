import 'module-alias/register.js'
import express from 'express'
import * as http from 'http'
import initWebsockets from './socket.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(
    express.json({
        type: ['application/json', 'text/plain'],
        limit: '200mb',
    })
)

const server = http.createServer(app)

// start our server
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
    initWebsockets(server)
})