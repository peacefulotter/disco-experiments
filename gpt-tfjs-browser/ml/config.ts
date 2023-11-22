import { Config } from '~/tfjs-types'

export default async function getConfig(split: string): Promise<Config> {
    console.log('Getting config on', split, 'split')

    const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ split }),
    })
    const { config } = await res.json()
    return config as Config
}
