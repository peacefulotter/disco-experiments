import { fileURLToPath } from 'url'
import { GPTConfigWithWandb } from './train.js'
import path from 'path'

export type WandbSave = {
    init: {
        config: GPTConfigWithWandb
        date: string
    }
    logs: any[]
}

export const exportWandb = async (save: WandbSave) => {
    let fs
    try {
        fs = require('fs/promises')
    } catch (err) {
        console.error(err)
        throw err
    }

    const json = JSON.stringify(save, null, 4)

    const __filename = fileURLToPath(import.meta.url)
    const dir = path.join(path.dirname(__filename), 'wandb')
    await fs.mkdir(dir, { recursive: true }).catch(console.error)

    const { dataset, backend, gpu, platform, model } = save.init.config
    const p = path.join(
        dir,
        `exps_${dataset}_${platform}_${backend}_${gpu}_${model}.json`
    )
    await fs.writeFile(p, json, 'utf-8')
}

export default class Wandb {
    public save: WandbSave
    public config: GPTConfigWithWandb

    constructor(config: GPTConfigWithWandb) {
        const date = new Date().toISOString()
        this.save = {
            init: {
                config,
                date,
            },
            logs: [],
        }
        this.config = config
    }

    public async log(payload: any) {
        this.save.logs.push(payload)
    }

    public async finish() {
        try {
            await exportWandb(this.save)
        } catch {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    save: this.save,
                }),
            })
            console.log(res)
        }
    }
}
