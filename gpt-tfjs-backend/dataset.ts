import * as tf from '@tensorflow/tfjs-node'
import { readdir, readFile } from 'fs/promises'
import { decode, encode } from 'gpt-tokenizer'
import { Dataset, DatasetConfig, DatasetSample, TokenizedData } from './types.js'
import { generate } from 'gpt-tfjs/src/model.js';


// const loadFile = async (path: string, file: string, extractor: (file: string) => PreprocessedData) => {
//     const text: string = await readFile('datasets/' + path + '/' + file, {encoding: 'utf-8'})
//     const { xs, ys } = extractor(text)
//     if (xs.length !== ys.length)
//         throw new Error('xs and ys are not the same size after preprocessing the dataset')
//     return { xs, ys }
// }


// const preprocess = ({ xs, ys }: PreprocessedData): TokenizedData => {
//     const maxLength = xs
//         .map(x => tf.tensor(encode(x)))
//         .reduce((a, c) => Math.max(a, c.shape[0]), 0)
    
//     return { 
//         xs: tf.tensor(xs.map(x => encode(x))).pad([[0, maxLength]]), 
//         ys: tf.tensor(ys.map(y => encode(y))) 
//     }
// }


const preprocess = (x: string, { vocabSize, blockSize }: DatasetConfig): TokenizedData => {
    const tokens = encode(x)

    const over = tokens.reduce((acc, cur) => ([Math.max(acc[0], cur), acc[1] || (cur > vocabSize)]) as [number, boolean], [0, false] as [number, boolean])
    console.log('Token over vocabSize ?', over);
    console.log(tokens.sort((a, b) => a < b ? 1 : -1).slice(0, 100));
    
    const xs: number[][] = []
    const ys: number[][] = []
    for (let i = 0; i < tokens.length - 1 - blockSize; i++) {
        xs.push( tokens.slice(i, i + blockSize) )
        ys.push( tokens.slice(i + 1, i + 1 + blockSize) )
    } 

    return { 
        xs: tf.cast(tf.tensor(xs), 'int32'), ys:  
        tf.oneHot(tf.cast(ys, 'int32'), vocabSize) 
    }
} 

// , extractor: (text: string) => PreprocessedData
export default async function getDataset(path: string, config: DatasetConfig): Promise<Dataset> {
    const files = await readdir('datasets/' + path)
    return tf.data.generator( async function*() {
        let idx = 0;
        let innerIdx = 0;
        let preprocessed: TokenizedData | undefined = undefined;
        
        while (idx < files.length) 
        {    
            if (!preprocessed || innerIdx >= preprocessed.xs.shape[0]) {
                const data = await readFile('datasets/' + path + '/' + files[idx], {encoding: 'utf-8'})
                preprocessed = preprocess(data, config)
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


export async function inference(model: any, text: string) {
    const tokens = encode(text)
    const outputs = await generate(
        model,
        tokens, 
        { 'maxLength': 1024, 'temperature': 1, 'doSample': false },
        async (g: any) => {
            console.log('g', g);
            
            const i = await g.idxNext.array()
            const t = decode(i[0])
            console.log(`Token: ${t} (${i}), time: ${g.timePerToken}`)
            await new Promise(r => setTimeout(r, 30))
        }
    )
    const arr = await outputs.array()
    return decode(arr[0])
}
