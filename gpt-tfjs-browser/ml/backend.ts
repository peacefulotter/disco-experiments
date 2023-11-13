import *  as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'

export type BackendName = 'cpu' | 'webgl' | 'webgpu'

export default async function setBackend(backendName: BackendName) {
    await tf.setBackend(backendName);
    await tf.ready()

    console.log(tf.engine().backendNames());
    const tfBackend = tf.getBackend()
    if (tfBackend !== backendName) {
        throw new Error('backend not properly set, got:' + tfBackend)
    }
    console.log("Backend set to:", tfBackend);
}