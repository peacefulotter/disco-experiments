import '@tensorflow/tfjs-backend-webgpu'
import '@tensorflow/tfjs-backend-webgl'
import main from './train'
import { BackendName } from './backend'

export default async function trainGPU(backendName: BackendName) {
    await main('cluster_browser', backendName)
}
