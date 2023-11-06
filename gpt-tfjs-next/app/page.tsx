'use client'

// import Chart from "@/components/Chart";
// import Combobox from "@/components/Combobox";
import trainGPU from "@/ml/train-gpu";

// const profiles = [
//   {value: 'iter', text: 'Iteration'}, 
//   {value: 'loss', text: 'Loss'}, 
//   {value: 'time', text: 'Time'}, 
//   {value: 'mem', text: 'Memory'}
// ]

export default function Home() {
  // const res = await fetch('http://localhost:5000/api/', { cache: 'no-cache' })
  // const data = await res.json()

  return (
    <main className="flex p-12 gap-4">
      <button onClick={() => trainGPU('webgl')} className="px-8 py-2 bg-slate-300 rounded">Webgl</button>
      <button onClick={() => trainGPU('webgpu')} className="px-8 py-2 bg-slate-300 rounded">Webgpu</button>
      {/* <div className='flex gap-4'>
        <Combobox options={profiles} param={'x'} />
        <Combobox options={profiles} param={'y'} />
      </div>
      <Chart data={data.samples} /> */}
    </main>
  )
}
