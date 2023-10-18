import tf from '@tensorflow/tfjs-node'
import getDataset, { PreprocessedData } from './dataset'
import { DatasetSample } from './types';
import { model }  from 'gpt-tfjs'
const { GPTLMHeadModel } = model

interface DolphinFeature {
    feature_idx: number;
    name: string;
    type: {
        dtype: string;
        _type: string;
    }
}

interface DolphinRow {
    row_idx: number;
    row: {
        instruction: string;
        input: string;
        output: string;
    }
    truncated_cells: unknown[]
}

interface DolphinFile {
    features: DolphinFeature[];
    rows: DolphinRow[]
}

async function test() {
    const ds = await getDataset('dolphin', (file: string) => {
        const { rows } = JSON.parse(file) as DolphinFile
        return rows.reduce( (acc, { row }) => {
            acc.xs.push(row.instruction + row.input)
            acc.ys.push(row.output)
            return acc
        }, {xs: [], ys: []} as PreprocessedData )
    })

    console.log(ds);
    await ds.forEachAsync((a) => {
        console.log(typeof a + " => " + Object.keys(a) + ' -> ' + Object.values(a))
    })

    const config = { modelType: 'gpt-nano', vocabSize: 50257, blockSize: 1024, debug: true }
    const gpt = GPTLMHeadModel(config)
    await gpt.train(ds, {epochs: 1, verbose: true})
}

await test()