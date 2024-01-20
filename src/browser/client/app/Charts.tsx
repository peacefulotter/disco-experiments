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

const inferenceData = [
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

const trainingMemoryData = [
    {
        name: 'gpt-nano',
        'py-nvidia-4070-ti': 47,
        'nvidia-4070-ti': 59.4,
        'nvidia-rtx-a5000': 59.4,
    },
    {
        name: 'gpt-micro',
        'py-nvidia-4070-ti': 104,
        'nvidia-4070-ti': 164.6,
        'nvidia-rtx-a5000': 164.6,
    },
    {
        name: 'gpt-mini',
        'py-nvidia-4070-ti': 165,
        'nvidia-4070-ti': 264.7,
        'nvidia-rtx-a5000': 264.7,
    },
]

const trainingDeltatimeData = [
    {
        name: 'gpt-nano',
        'py-nvidia-4070-ti': 4,
        'nvidia-4070-ti': 250,
        'nvidia-rtx-a5000': 175,
    },
    {
        name: 'gpt-micro',
        'py-nvidia-4070-ti': 5,
        'nvidia-4070-ti': 300,
        'nvidia-rtx-a5000': 235,
    },
    {
        name: 'gpt-mini',
        'py-nvidia-4070-ti': 6.3,
        'nvidia-4070-ti': 417,
        'nvidia-rtx-a5000': 359,
    },
]

export default function Charts() {
    return (
        <>
            <div className="bg-slate-50 p-8 flex flex-col justify-center items-center">
                <p className="text-lg mb-4 text-slate-900">Inference times</p>
                <BarChart width={730} height={250} data={inferenceData}>
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
                        dx={5}
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
            <div className="bg-slate-50 p-8 flex flex-col justify-center items-center">
                <p className="text-lg mb-4 text-slate-900">Training memory</p>
                <BarChart width={730} height={250} data={trainingMemoryData}>
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
                        dx={5}
                        label={{
                            value: 'MB',
                            position: 'insideLeft',
                            offset: 0,
                        }}
                        domain={[0, 300]}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="py-nvidia-4070-ti" fill="#7e29ce">
                        <LabelList dataKey="py-nvidia-4070-ti" position="top" />
                    </Bar>
                    <Bar dataKey="nvidia-rtx-a5000" fill="#4361ee">
                        <LabelList dataKey="nvidia-rtx-a5000" position="top" />
                    </Bar>
                    <Bar dataKey="nvidia-4070-ti" fill="#4cc9f0">
                        <LabelList dataKey="nvidia-4070-ti" position="top" />
                    </Bar>
                </BarChart>
            </div>
            <div className="bg-slate-50 p-8 flex flex-col justify-center items-center">
                <p className="text-lg mb-4 text-slate-900">
                    Training time per iteration
                </p>
                <BarChart width={730} height={250} data={trainingDeltatimeData}>
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
                        dx={5}
                        label={{
                            value: 'ms',
                            position: 'insideLeft',
                            offset: 0,
                        }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="py-nvidia-4070-ti" fill="#7e29ce">
                        <LabelList dataKey="py-nvidia-4070-ti" position="top" />
                    </Bar>
                    <Bar dataKey="nvidia-rtx-a5000" fill="#4361ee">
                        <LabelList dataKey="nvidia-rtx-a5000" position="top" />
                    </Bar>
                    <Bar dataKey="nvidia-4070-ti" fill="#4cc9f0">
                        <LabelList dataKey="nvidia-4070-ti" position="top" />
                    </Bar>
                </BarChart>
            </div>
        </>
    )
}
