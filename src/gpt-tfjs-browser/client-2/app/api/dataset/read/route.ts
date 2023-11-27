import { getPreprocessedDataset } from '@/ml/dataset'
import config from '~/train-config'

function iteratorToStream(iterator: any) {
    return new ReadableStream({
        async pull(controller) {
            for await (const value of iterator) {
                const text = JSON.stringify(value)
                controller.enqueue(text)
            }
            controller.close()
        },
    })
}

export async function POST(req: Request) {
    const { split } = await req.json()
    const iterator = await getPreprocessedDataset(config, split)
    const stream = iteratorToStream(iterator)
    return new Response(stream)
}
