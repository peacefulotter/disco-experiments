import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
const DEFAULT_CHUNK_SIZE = 1024

function makeReadableByteFileStream(filename: string) {
    let fileHandle: fs.promises.FileHandle
    let position = 0

    return new ReadableStream({
        type: 'bytes',

        async start() {
            fileHandle = await fs.promises.open(filename, 'r')
        },

        async pull(controller: ReadableByteStreamController) {
            if (controller.byobRequest == null) {
                return
            }
            // Even when the consumer is using the default reader, the auto-allocation
            // feature allocates a buffer and passes it to us via byobRequest.
            const v = controller.byobRequest.view
            if (v === null) {
                return
            }

            const { bytesRead } = await fileHandle.read(
                v as NodeJS.ArrayBufferView,
                0,
                v.byteLength,
                position
            )
            if (bytesRead === 0) {
                await fileHandle.close()
                controller.close()
                controller.byobRequest.respond(0)
            } else {
                position += bytesRead
                controller.byobRequest.respond(bytesRead)
            }
        },

        cancel() {
            return fileHandle.close()
        },

        autoAllocateChunkSize: DEFAULT_CHUNK_SIZE,
    })
}

export async function GET(req: NextRequest, { params }: any) {
    const { file } = params
    if (file == null) {
        console.error('file is null')
        return NextResponse.error()
    }
    console.log(file)
    const p = path.resolve(
        process.cwd(),
        'node_modules',
        '@tensorflow',
        'tfjs-backend-wasm',
        'dist',
        file
    )
    console.log(p)
    // WebAssembly.instantiateStreaming()
    // WebAssembly.instantiate()
    // const wasm = fs.createReadStream(p, 'utf-8')
    const stream = makeReadableByteFileStream(p) // webStreams.toWebReadableStream(wasm)
    const res = new NextResponse(stream)
    res.headers.set('content-type', 'application/wasm')
    return res
}
