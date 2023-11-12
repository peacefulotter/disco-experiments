import { Config } from "./types"


export const init = async (save: any[], config: Config, prefix: string, date: string) =>  {
    save.push({
        config, prefix, date
    })

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
}

export const log = async (save: any[], payload: any) => {
    save.push(payload)
    // await fetch("/api/wandb/log", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });
}

export const finish = async (save: any[]) => {
    // await fetch("/api/wandb/finish", {
    //   method: "POST",
    // });

    const res = await fetch("/api/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(save),
    });
    console.log(res);
}