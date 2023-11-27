import WandbNode from '~/wandb-node'
import { WandbSave } from '~/wandb'

export async function POST(req: Request) {
    const { save } = (await req.json()) as {
        save: WandbSave
    }
    const { config } = save.init
    const wandb = new WandbNode(config, '', 'cpu')
    wandb.save = save
    wandb.finish()
    return Response.json('ok')
}
