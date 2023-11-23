'use client'

import datasetTest from '@/ml/dataset-test'
import inference from '@/ml/inference'
import trainGPU from '@/ml/train-gpu'
import wandbTest from '@/ml/wandb-test'
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
            className="px-8 py-2 bg-slate-300 rounded capitalize"
        >
            {name}
        </button>
    )
}

export default function Home() {
    return (
        <main className="grid grid-cols-2 grid-rows-3 p-12 gap-4">
            <Btn callback={() => trainGPU('webgpu')} name="Train webgpu" />
            <Btn callback={() => trainGPU('webgl')} name="train webgl" />
            <Btn callback={() => datasetTest()} name="Dataset test" />
            <Btn callback={() => wandbTest()} name="Wandb test" />
            <Btn callback={() => inference('webgl')} name="Inference webgl" />
            <Btn callback={() => inference('webgpu')} name="Inference webgpu" />
        </main>
    )
}
