import { exportWandb } from '~/wandb-node'
import { WandbSave } from '~/wandb'

export async function POST(req: Request) {
    const { save } = (await req.json()) as {
        save: WandbSave
    }
    await exportWandb(save)
    return Response.json('ok')
}
