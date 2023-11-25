import fs from 'fs/promises'
import path from 'path'
import { Config, BackendName } from '~/tfjs-types'

export async function POST(req: Request) {
    const { save, config, backendName } = (await req.json()) as {
        save: any
        config: Config
        backendName: BackendName
    }
    const json = JSON.stringify(save, null, 4)
    const p = path.join(
        process.cwd(),
        'wandb',
        `${backendName}_${config.wandbName}.json`
    )
    await fs.writeFile(p, json, 'utf-8')
    return Response.json('ok')
}
