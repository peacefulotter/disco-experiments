import '@tensorflow/tfjs-backend-webgpu'
import '@tensorflow/tfjs-backend-webgl'
import main from './train'
import { BackendName } from '../../../shared/backend'

export default async function trainGPU(backendName: BackendName) {
    await main('cluster_browser', backendName)
}
