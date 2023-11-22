import fs from 'fs/promises'
import path from 'path'
import { Config } from '~/tfjs-types'

export async function POST(req: Request) {
    const { save, config } = (await req.json()) as { save: any; config: Config }
    const json = JSON.stringify(save, null, 4)
    const p = path.join(process.cwd(), config.wandbName + '.json')
    await fs.writeFile(p, json, 'utf-8')
    return Response.json('ok')
}
