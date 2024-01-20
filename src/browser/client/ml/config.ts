'use client'
import * as tf from '@tensorflow/tfjs'
import { BackendName, Config } from '~/tfjs-types'

export default async function getConfig() {
    const res = await fetch('/api/config', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    })
    const config = (await res.json()) as Config
    config.platform = 'browser'
    config.backend = tf.getBackend() as BackendName
    return { ...config, shuffle: NaN }
}
