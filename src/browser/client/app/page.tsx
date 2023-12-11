'use client'
import { ReactNode, useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'
import '@tensorflow/tfjs-backend-wasm'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'

import datasetTest from '@/ml/dataset-test'
import inferenceTest from '@/ml/inference-test'
import train from '@/ml/train'
import wandbTest from '@/ml/wandb-test'
import { BrowserBackendName, Config } from '~/tfjs-types'
import trainTest from '@/ml/train-test'
import getConfig from '@/ml/config'

setWasmPaths(
    '/api/wasm/' // https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.9.0/dist/
    // true
)

// import Chart from "@/components/Chart";
// import Combobox from "@/components/Combobox";
// const profiles = [
//   {value: 'iter', text: 'Iteration'},
//   {value: 'loss', text: 'Loss'},
//   {value: 'time', text: 'Time'},
//   {value: 'mem', text: 'Memory'}
// ]
//  <div className='flex gap-4'>
//     <Combobox options={profiles} param={'x'} />
//     <Combobox options={profiles} param={'y'} />
// </div>
// <Chart data={data.samples} />

const Btn = ({ callback, name }: { callback: () => void; name: ReactNode }) => {
    return (
        <button
            onClick={callback}
            className="flex-1 px-8 py-3 bg-neutral-800 rounded capitalize hover:bg-neutral-700 transition-colors"
        >
            {name}
        </button>
    )
}

export default function Home() {
    const backends = tf.engine().backendNames() as BrowserBackendName[]

    const [config, setConfig] = useState<Config | {}>({})
    useEffect(() => {
        getConfig().then(setConfig)
    }, [])

    return (
        <main className="flex flex-col p-12 gap-4">
            <div>
                Backend availables:&nbsp;
                {backends.join(', ')}
            </div>
            <div className="flex items-center gap-5">
                <p className="font-bold">Train: </p>
                <div className="flex gap-2 w-full">
                    {backends.map((backend) => (
                        <Btn
                            key={`train-${backend}`}
                            callback={() => train(backend)}
                            name={backend}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-5">
                <p className="font-bold">Inference: </p>
                <div className="flex gap-2 w-full">
                    {backends.map((backend) => (
                        <Btn
                            key={`inference-${backend}`}
                            callback={() => inferenceTest(backend)}
                            name={backend}
                        />
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-5">
                <p className="font-bold">Test: </p>
                <div className="flex gap-2 w-full">
                    <Btn callback={() => datasetTest()} name="Dataset" />
                    <Btn callback={() => wandbTest()} name="Wandb" />
                    <Btn callback={() => trainTest()} name="Train" />
                </div>
            </div>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </main>
    )
}
