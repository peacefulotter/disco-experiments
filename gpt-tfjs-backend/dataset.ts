import tf from '@tensorflow/tfjs-node'
import { readdir, readFile } from 'fs/promises'
import { encode } from 'gpt-tokenizer'
import { Dataset, DatasetSample, PreprocessedData, TokenizedData } from './types'


const loadFile = async (path: string, file: string, extractor: (file: string) => PreprocessedData) => {
    const text: string = await readFile('datasets/' + path + '/' + file, {encoding: 'utf-8'})
    const { xs, ys } = extractor(text)
    if (xs.length !== ys.length)
        throw new Error('xs and ys are not the same size after preprocessing the dataset')
    return { xs, ys }
}

const preprocess = ({ xs, ys }: PreprocessedData): TokenizedData => {
    const maxLength = xs
        .map(x => tf.tensor(encode(x)))
        .reduce((a, c) => Math.max(a, c.shape[0]), 0)
    
    return { 
        xs: tf.tensor(xs.map(x => encode(x))).pad([[0, maxLength]]), 
        ys: tf.tensor(ys.map(y => encode(y))) 
    }
}

export default async function getDataset(path: string, extractor: (text: string) => PreprocessedData): Promise<Dataset> {
    const files = await readdir('datasets/' + path)
    return tf.data.generator( async function*() {
        let idx = 0;
        let innerIdx = 0;
        let preprocessed: TokenizedData | undefined = undefined;
        
        while (idx < files.length) 
        {    
            if (!preprocessed || innerIdx >= preprocessed.xs.shape[0]) {
                const data = await loadFile(path, files[idx], extractor)
                preprocessed = preprocess(data)
                console.log(preprocessed.xs.shape);
                console.log(preprocessed.ys.shape);
                

                if (innerIdx >= preprocessed.xs.shape[0]) {
                    innerIdx = 0                
                    idx++;
                }
            }

            if (idx >= files.length)
                break;
                // yield { value: {x: tf.tensor([]), y: tf.tensor([])}, done: true } as DatasetSample

            const res: DatasetSample = {
                value: {
                    x: preprocessed.xs[innerIdx],
                    y: preprocessed.ys[innerIdx],
                },
                done: false
            }
            innerIdx++
            yield res 
        }
    } as any ) // Forced as any because tfjs expects only Iterators in typescript....
}


// const tokens = encode(params.input)
// let outputs = await generate(
//     model,
//     tokens, 
//     { 'maxLength': params.maxLength, 'temperature': params.temperature, 'doSample': params.temperature < 1.0 },
//     async (g) => {
//         const i = await g.idxNext.array()
//         const t = decode(i[0])
//         log(`Token: ${t} (${i}), time: ${g.timePerToken}`)
//         stats.mst.panel.update(g.timePerToken, 500)
//         await new Promise(r => setTimeout(r, 30))
//     }
// )
// outputs = await outputs.array()
// return decode(outputs[0])