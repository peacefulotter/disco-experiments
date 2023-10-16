import tf from '@tensorflow/tfjs-node'
import { readdir, readFile } from 'fs/promises'
import { encode } from 'gpt-tokenizer'

export default async function getDataset(path: string) {
    const files = await readdir(path)
    return tf.data.generator( async function*() {
        let idx = 0;
        while (idx++ < files.length) {
            const file = await readFile(path + '/' + files[idx], {encoding: 'utf-8'})
            yield tf.tensor(encode(file))
        }
    } as any ) // Forced as any because tfjs expects only Iterators in typescript....
}