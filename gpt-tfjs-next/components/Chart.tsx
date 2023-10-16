'use client'

import { useSearchParams } from 'next/navigation';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface IChart {
    data: any[];
}

type Datapoint = {
    'gpt-nano': number, 
    'gpt-micro': number, 
    'gpt-mini': number
}

interface Datasample {
    iter: number,
    loss: Datapoint,
    time: Datapoint,
    mem: Datapoint
} 

const strokes = [
    "#f94144", '#f8963e', '#43aa8b', '#0496ff', '#00509d', '#bc00dd'
]

const timeTransform = (series: Datasample[], x: Exclude<keyof Datasample, 'iter'>, y: Exclude<keyof Datasample, 'iter'>) => {
    const data: (Datapoint & any)[] = [];
    for (let i = 0; i < series.length; i++) {
        const sample = series[i]
        data.push({ [x]: sample[x]['gpt-nano'], 'gpt-nano': sample[y]['gpt-nano'], 'gpt-mini': NaN, 'gpt-micro': NaN })
        data.push({ [x]: sample[x]['gpt-mini'], 'gpt-mini': sample[y]['gpt-mini'], 'gpt-micro': NaN, 'gpt-nano': NaN })
        data.push({ [x]: sample[x]['gpt-micro'], 'gpt-micro': sample[y]['gpt-micro'], 'gpt-mini': NaN, 'gpt-nano': NaN })
    }
    return data.sort((a, b) => (a[x] > b[x] ? 1 : -1));
} 

export default function Chart({ data }: IChart) {

    const searchParams = useSearchParams()
    const x = searchParams.get('x') || 'iter'
    const y = searchParams.get('y') || 'loss'

    const keys = Object.keys(data[0][y])
    console.log(data);
    
    const d = x !== 'iter' && y !== 'iter'
        ? timeTransform(data, x as any, y as any) : 
        data.map( ({iter, ...rest}) => ({ iter, ...rest[y] }) )

    return (
        <ResponsiveContainer width="90%" height="90%">
            <LineChart
                width={1400}
                height={900}
                data={d}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={x} />
                <YAxis />
                <Legend/>
                <Tooltip />
                { data && data.length > 0 && keys.filter(k => k !== 'iter').map( (k, i) => 
                    <Line key={`line-${i}`} type="monotone" dataKey={k} stroke={strokes[i]} />
                )}
            </LineChart>
        </ResponsiveContainer>
    )
}