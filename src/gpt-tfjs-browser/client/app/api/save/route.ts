import WandbNode from '~/wandb-node'
import { Config } from '~/tfjs-types'

export async function POST(req: Request) {
    const { save, config } = (await req.json()) as {
        save: any
        config: Config
    }
    const wandb = new WandbNode(config)
    wandb.save = save
    wandb.finish()
    return Response.json('ok')
}
