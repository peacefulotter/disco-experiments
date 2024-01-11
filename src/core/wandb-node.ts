// import wandb from '@wandb/sdk'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import Wandb from './wandb'
import { WandbSave } from './wandb'

export const exportWandb = async (save: WandbSave) => {
    const json = JSON.stringify(save, null, 4)

    const __filename = fileURLToPath(import.meta.url)
    const dir = path.join(path.dirname(__filename), 'wandb')
    await fs.mkdir(dir, { recursive: true }).catch(console.error)

    const p = path.join(
        dir,
        `exp_${save.init.config.platform}_${save.init.config.gpu}_${save.init.config.modelType}.json`
    )
    await fs.writeFile(p, json, 'utf-8')
}

export class WandbNode extends Wandb {
    public async finish() {
        await exportWandb(this.save)
    }
}
