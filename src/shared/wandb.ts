// import wandb from '@wandb/sdk'
import { Config, BackendName } from './tfjs-types.js'

export type WandbSave = {
    init: {
        config: Config
        prefix: string
        date: string
    }
    logs: any[]
}

export default class Wandb {
    public save: WandbSave
    public config: Config

    constructor(config: Config, prefix: string, backendName: BackendName) {
        const date = new Date().toISOString()
        this.save = {
            init: {
                config,
                prefix: `${prefix}_${backendName}`,
                date,
            },
            logs: [],
        }
        this.config = config
    }

    // await fetch("/api/wandb/init", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     config,
    //     prefix,
    //     date,
    //   }),
    // });

    public async log(payload: any) {
        console.log(payload)
        this.save.logs.push(payload)
        // await fetch("/api/wandb/log", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(payload),
        // });
    }

    public async finish() {
        console.log(this.save)

        // await fetch("/api/wandb/finish", {
        //   method: "POST",
        // });

        // const isBrowser: boolean =
        //     typeof window !== 'undefined' &&
        //     typeof window.document !== 'undefined'
        // console.log(isBrowser)

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
