import { Config } from '~/tfjs-types'
import config from '~/train-config'

export default async function getConfig(): Promise<Config> {
    // console.log('Getting config on', split, 'split')

    // const res = await fetch('/api/config', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ split }),
    // })
    // const { config } = await res.json()
    // return config as Config
    return config
}
