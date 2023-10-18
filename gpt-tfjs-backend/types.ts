
import * as tf from '@tensorflow/tfjs-node'

export type PreprocessedData = {
    xs: string[]; 
    ys: string[];
} 

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