import * as gpt from '#/gpt-tfjs'

export async function POST(req: Request) {
    const { save } = await req.json()
    await gpt.exportWandb(save)
    return Response.json('ok')
}
