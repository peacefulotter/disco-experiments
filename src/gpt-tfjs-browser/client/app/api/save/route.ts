import writeWandb from '~/wandb-node'
import { Config } from '~/tfjs-types'

export async function POST(req: Request) {
    const { save, config } = (await req.json()) as {
        save: any
        config: Config
    }
    await writeWandb(save, config)
    return Response.json('ok')
}
