import tf from '@tensorflow/tfjs-node'
import getDataset, { inference } from './dataset.js'
import { DatasetSample } from './types.js';
import { model }  from 'gpt-tfjs'
import { createDataset } from './sort.js';
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
    // , (file: string) => {
    //     const { rows } = JSON.parse(file) as DolphinFile
    //     return rows.reduce( (acc, { row }) => {
    //         acc.xs.push(row.instruction + row.input)
    //         acc.ys.push(row.output)
    //         return acc
    //     }, {xs: [], ys: []} as PreprocessedData )
    // }
    const config = { modelType: 'gpt-nano', vocabSize: 2048, blockSize: 16, debug: true }
    const test = await createDataset()
    const iter = await test.dataset.iterator()
    const { value }= await iter.next()
    // console.log(await value.x.array());
        
    const ds = await getDataset('dolphin', config)

    console.log(ds);
    // await ds.forEachAsync((a) => {
    //     console.log(typeof a + " => " + Object.keys(a) + ' -> ' + Object.values(a))
    // })

    const gpt = GPTLMHeadModel(config)
    await gpt.train(ds, {epochs: 1, verbose: true})

    const response = await inference(gpt, 'What is life?')
    console.log('response', response);
    
}

await test()