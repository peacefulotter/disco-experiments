import { wandb } from '@wandb/sdk'

export async function POST(req: Request) {
    const payload = await req.json()
    wandb.log(payload)
    return Response.json('')
}
