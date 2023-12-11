import { BackendName } from './tfjs-types.js'

export default async function setBackend(tf: any, backendName: BackendName) {
    console.log('Backend availables:', tf.engine().backendNames())

    await tf.setBackend(backendName)
    await tf.ready()

    const tfBackend = tf.getBackend()
    if (tfBackend !== backendName) {
        throw new Error('backend not properly set, got: ' + tfBackend)
    }

    console.log('Backend set to:', tfBackend)
}
