import * as tf from '@tensorflow/tfjs-node-gpu'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-wasm'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'

import { getDataset } from '~/dataset-node'
import config from '~/config'
import train from '~/train'
import { NodeBackendName } from '~/tfjs-types'
import { generateFromString } from '~/inference'

setWasmPaths('./node_modules/@tensorflow/tfjs-backend-wasm/dist/')

export default async function main(backendName: NodeBackendName) {
    const getTrainDataset = async () => ({
        dataset: await getDataset(config, 'train'),
    })
    const getEvalDataset = async () => ({
        dataset: await getDataset(config, 'valid'),
    })

    const callback = async (model: tf.LayersModel) => {
        generateFromString(
            model,
            'First Citizen: \n We are accounted poor citizens, the patricians good.',
            24
        )
    }

    await train(
        tf,
        config,
        backendName,
        getTrainDataset,
        getEvalDataset,
        callback
    )
}

const isBackendName = (name: string): name is NodeBackendName =>
    name === 'cpu' || name === 'wasm' || name === 'tensorflow'

if (process.argv.length < 3 || !isBackendName(process.argv[2])) {
    console.error(
        'Usage: bun train.ts <backend-name>, available backends: cpu, wasm, tensorflow'
    )
    process.exit(1)
}

const backendName = process.argv[2]
main(backendName as NodeBackendName)
