import '@tensorflow/tfjs-backend-webgpu'
import main from './train'
import { BackendName } from '~/tfjs-types'

export default async function trainGPU(backendName: BackendName) {
    await main('cluster_browser', backendName)
}
