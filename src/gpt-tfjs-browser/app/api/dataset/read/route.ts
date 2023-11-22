import { getPreprocessedDataset } from '@/ml/dataset'
import config from '~/train-config'

function iteratorToStream(iterator: any) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next()
            if (done) {
                controller.close()
            } else {
                controller.enqueue(value)
            }
        },
    })
}

export async function POST(req: Request) {
    const { split } = await req.json()
    const iterator = await getPreprocessedDataset(config, split)
    const stream = iteratorToStream(iterator)
    return new Response(stream)
}
