// import wandb from '@wandb/sdk'
import fs from 'fs/promises'
import path from 'path'
import Wandb from './wandb'

import { fileURLToPath } from 'url'

export default class WandbNode extends Wandb {
    public async finish() {
        const json = JSON.stringify(this.save, null, 4)

        const __filename = fileURLToPath(import.meta.url)
        const dir = path.join(path.dirname(__filename), 'wandb')
        await fs.mkdir(dir, { recursive: true }).catch(console.error)

        const p = path.join(
            dir,
            `${this.save.init.prefix}_${this.config.wandbName}.json`
        )
        console.log(p)
        await fs.writeFile(p, json, 'utf-8')
    }
}
