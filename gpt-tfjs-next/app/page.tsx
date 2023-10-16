import Chart from "@/components/Chart";
import Combobox from "@/components/Combobox";
import Link from "next/link";

const profiles = [
  {value: 'iter', text: 'Iteration'}, 
  {value: 'loss', text: 'Loss'}, 
  {value: 'time', text: 'Time'}, 
  {value: 'mem', text: 'Memory'}
]

export default async function Home() {
  
  const res = await fetch('http://localhost:5000/api/', { cache: 'no-cache' })
  const data = await res.json()


  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-screen h-screen p-12">
      <Combobox options={profiles} param={'x'} />
      <Combobox options={profiles} param={'y'} />
      <Chart data={data} />
    </main>
  )
}
