// import wandb from '@wandb/sdk'
import fs from 'fs/promises'
import path from 'path'
import { WandbSave } from './wandb'
import { Config } from './tfjs-types'

export default async function wandbWrite(save: WandbSave, config: Config) {
    const json = JSON.stringify(save, null, 4)
    const p = path.join(
        process.cwd(),
        'wandb',
        `${save.init.prefix}_${config.wandbName}.json`
    )
    await fs.writeFile(p, json, 'utf-8')
}
