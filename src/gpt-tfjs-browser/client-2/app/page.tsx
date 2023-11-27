'use client'

import datasetTest from '@/ml/dataset-test'
import inferenceTest from '@/ml/inference-test'
import train from '@/ml/train'
import wandbTest from '@/ml/wandb-test'
import config from '~/config'
import { ReactNode } from 'react'

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
            className="px-8 py-3 bg-neutral-800 rounded capitalize hover:bg-neutral-700 transition-colors"
        >
            {name}
        </button>
    )
}

export default function Home() {
    return (
        <main className="grid grid-cols-2 grid-rows-3 p-12 gap-4">
            <Btn callback={() => train('webgpu')} name="Train webgpu" />
            <Btn callback={() => train('webgl')} name="train webgl" />
            <Btn callback={() => datasetTest()} name="Dataset test" />
            <Btn callback={() => wandbTest()} name="Wandb test" />
            <Btn
                callback={() => inferenceTest('webgl')}
                name="Inference webgl"
            />
            <Btn
                callback={() => inferenceTest('webgpu')}
                name="Inference webgpu"
            />
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </main>
    )
}
