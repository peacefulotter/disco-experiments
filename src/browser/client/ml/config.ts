import { Config } from '~/tfjs-types'

export default async function getConfig() {
    const res = await fetch('/api/config', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const config = (await res.json()) as Config
    return { ...config, shuffle: NaN }
}
