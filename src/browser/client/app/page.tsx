'use client'
import * as tf from '@tensorflow/tfjs'
import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import * as gpt from '#/gpt-tfjs'
import { GPTConfigWithWandb } from '#/gpt-tfjs'
import getConfig from '@/ml/config'
import { datasetTest, datasetBenchmark } from '@/ml/dataset-test'
import main from '@/ml/train'

const DATASET_NAMES = ['wikitext-103', 'tiny-shakespeare'] as const
type DatasetName = (typeof DATASET_NAMES)[number]

export default function Home() {
    const [datasetName, setDatasetName] = useState<DatasetName>('wikitext-103')
    const [config, setConfig] = useState<GPTConfigWithWandb>()
    const [availableBackends, setAvailableBackends] = useState<string[]>([])
    const [backendName, setBackendName] = useState<string>('cpu')

    useEffect(() => {
        getConfig().then((c) => setConfig(gpt.getConfig(c)))
        setAvailableBackends(tf.engine().backendNames())
        setBackend(tf.getBackend())
    }, [])

    const startTraining = async () => {
        await main(backendName as any).catch(console.error)
    }

    // util function to properly set the backend
    // TODO: Move this to core as well?
    const setBackend = async (backendName: string) => {
        await tf.setBackend(backendName)
        await tf.ready()

        const tfBackend = tf.getBackend()
        if (tfBackend !== backendName) {
            throw new Error('backend not properly set, got: ' + tfBackend)
        }

        console.log('Backend set to:', tfBackend)
        setBackendName(tfBackend)
    }

    console.log(backendName, datasetName)

    return (
        <main className="flex p-24 gap-8">
            <pre className="bg-slate-800 rounded p-4 max-w-min">
                {JSON.stringify(config, undefined, 4)}
            </pre>
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center gap-4 bg-slate-800 rounded py-2 px-8 h-fit">
                    Backend:
                    <Tabs value={backendName} onValueChange={setBackend}>
                        <TabsList className="gap-4">
                            {availableBackends.map((backendName, i) => (
                                <TabsTrigger
                                    className="hover:!bg-slate-900"
                                    value={backendName}
                                    key={`btn-${i}`}
                                >
                                    {backendName}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex justify-between items-center gap-4 bg-slate-800 rounded py-2 px-8 h-fit">
                    Dataset:
                    <Tabs
                        value={datasetName}
                        onValueChange={(v) => setDatasetName(v as DatasetName)}
                    >
                        <TabsList className="gap-2">
                            <TabsTrigger
                                value="wikitext-103"
                                className="hover:!bg-slate-900"
                            >
                                wikitext-103
                            </TabsTrigger>
                            <TabsTrigger
                                value="tiny-shakespeare"
                                className="hover:!bg-slate-900"
                            >
                                tiny-shakespeare
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Separator orientation="vertical" />
                    <button
                        onClick={datasetTest}
                        className="bg-background rounded px-3 py-1.5 hover:bg-slate-900 text-sm font-medium"
                    >
                        test
                    </button>
                    <button
                        onClick={datasetBenchmark}
                        className="bg-background rounded px-3 py-1.5 hover:bg-slate-900 text-sm font-medium"
                    >
                        benchmark
                    </button>
                </div>
                <div className="flex justify-between items-center gap-4 bg-slate-800 rounded py-2 px-8 h-fit">
                    Training:
                    <button
                        onClick={startTraining}
                        className="bg-background rounded px-3 py-1.5 hover:bg-slate-900 text-sm font-medium"
                    >
                        run
                    </button>
                </div>
            </div>
        </main>
    )
}
