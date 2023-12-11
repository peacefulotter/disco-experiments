import getConfig from './config'
import Wandb from '~/wandb'
// import wandb from '@wandb/sdk'

const log = async (v: number) => {
    await fetch('/api/wandb/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ v }),
    })
}

export default async function wandbTest() {
    // await wandb.init({config: {test: 1}});
    // wandb.log({acc: 0.9, loss: 0.1});
    // wandb.log({acc: 0.91, loss: 0.09});
    // await wandb.finish();
    // const prefix = "test"
    // const date = new Date().getDate()
    // const config = await getConfig();
    // console.log(typeof window);
    // // const run = await wandb.init({
    // //   project: config.wandbProject,
    // //   name: `${prefix}_${config.wandbName}`,
    // //   config: { ...config, date },
    // // });
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
    // console.log('WANDB INIT');
    // log(0)
    // log(1)
    // log(2)
    // await fetch("/api/wandb/finish", {
    //   method: "POST",
    // });
    const config = await getConfig()
    const wandb = new Wandb(config, 'test', 'cpu')
    wandb.log({ v: 0 })
    wandb.log({ v: 1 })
    try {
        wandb.finish()
    } catch (e) {
        console.log(e)
    }
}
