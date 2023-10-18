
import * as tf from '@tensorflow/tfjs-node'

export const configs = ['gpt-nano', 'gpt-micro', 'gpt-mini']  as const //, 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']
 
type DataPoint = Record<typeof configs[number], number>

export interface BenchmarkSample {
    iter: number,
    loss: Partial<DataPoint>,
    time: Partial<DataPoint>,
    mem: Partial<DataPoint>
  } 

export type Benchmark =  {
    samples: BenchmarkSample[]
    performance: Partial<DataPoint>
}

// export type PreprocessedData = {
//     xs: string[]; 
//     ys: string[];
// } 

export type TokenizedData = {
    xs: tf.Tensor<tf.Rank>
    ys: tf.Tensor<tf.Rank>
}

export type DatasetSample = {
    value: {
        x: tf.Tensor<tf.Rank>;
        y: tf.Tensor<tf.Rank>;

    }
    done: boolean
}

export type Dataset = tf.data.Dataset<DatasetSample>

export interface DatasetConfig {
    vocabSize: number;
    blockSize: number;
}