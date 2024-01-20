import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const data = [
    {
        name: 'gpt-nano',
        webgl: 7.5,
        node: 16.9,
        webgpu: 22.9,
    },
    {
        name: 'gpt-micro',
        webgl: 9.2,
        node: 23.9,
        webgpu: 53.4,
    },
    {
        name: 'gpt-mini',
        webgl: 12.9,
        node: 38.6,
        webgpu: 87.5,
    },
]

export default function Charts() {
    return (
        <div className="bg-slate-50 p-8 flex justify-center items-center">
            <BarChart width={730} height={250} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    label={{
                        value: 'models',
                        position: 'insideBottomRight',
                        offset: 0,
                    }}
                />
                <YAxis
                    label={{
                        value: 'ms',
                        position: 'insideLeft',
                        offset: 0,
                    }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="webgl" fill="#7e29ce">
                    <LabelList dataKey="webgl" position="top" />
                </Bar>
                <Bar dataKey="node" fill="#4361ee">
                    <LabelList dataKey="node" position="top" />
                </Bar>
                <Bar dataKey="webgpu" fill="#4cc9f0">
                    <LabelList dataKey="webgpu" position="top" />
                </Bar>
            </BarChart>
        </div>
    )
}
