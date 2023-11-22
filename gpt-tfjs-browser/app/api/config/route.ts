import fs from 'fs/promises'
import path from 'path'
import trainConfig from '~/train-config'
import { Config } from '~/tfjs-types'

const datasetsDir = {
    wikitext: 'wikitext-103/preprocessed',
}

export async function POST(req: Request) {
    const { split } = await req.json()

    const dir = datasetsDir[trainConfig.dataset as keyof typeof datasetsDir]
    const datasetDir = path.join(
        process.cwd(),
        '../gpt-tfjs-node/datasets/',
        dir,
        split
    )
    const files = await fs.readdir(datasetDir)
    console.log('Found', files.length, 'files in dataset under', datasetDir)

    const config: Config = {
        ...trainConfig,
        dir: datasetDir,
        split,
        files,
    }

    return Response.json({ config })
}
