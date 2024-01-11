import { wandb } from '@wandb/sdk'

export async function POST(req: Request) {
    const { config, prefix, date } = await req.json()
    const run = await wandb.init({
        project: config.wandbProject,
        name: prefix,
        config: { ...config, date },
    })
    console.log('WANDB INIT', run)
    return Response.json('')
}
