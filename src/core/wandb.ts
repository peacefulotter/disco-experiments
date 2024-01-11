import { Config, BackendName } from './tfjs-types.js'

export type WandbSave = {
    init: {
        config: Config
        date: string
    }
    logs: any[]
}

export default class Wandb {
    public save: WandbSave
    public config: Config

    constructor(config: Config) {
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
        console.log(this.save)
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
