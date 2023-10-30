import * as tf from "@tensorflow/tfjs-node";

export const configs = ["gpt-nano", "gpt-micro", "gpt-mini"] as const; //, 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']

type ModelDataPoint = Record<(typeof configs)[number], number>;

export type TrainingSample = {
  loss: number;
  time: number;
  mem: number;
};

export type BenchmarkSample = {
  iter: number;
  loss: Partial<ModelDataPoint>;
  time: Partial<ModelDataPoint>;
  mem: Partial<ModelDataPoint>;
};

export type Benchmark = {
  samples: BenchmarkSample[];
  performance: Partial<ModelDataPoint>;
};

// export type PreprocessedData = {
//     xs: string[];
//     ys: string[];
// }

export type TokenizedData = {
  xs: tf.Tensor<tf.Rank>;
  ys: tf.Tensor<tf.Rank>;
};

// export type DatasetSample = {
//   value: {
//     x: tf.Tensor<tf.Rank>;
//     y: tf.Tensor<tf.Rank>;
//   };
//   done: boolean;
// };

export type DatasetSample = {
  x: tf.Tensor<tf.Rank>;
  y: tf.Tensor<tf.Rank>;
};

export type EncodedDataset = tf.data.Dataset<DatasetSample>;
export type Dataset = tf.data.Dataset<{ text: string }>;

export interface DatasetConfig {
  vocabSize: number;
  blockSize: number;
  chunkSize: number; // 256
  verbose?: boolean;
}

export interface ModelConfig {
  modelType?: string;
  debug?: boolean;
  nLayer?: number;
  nHead?: number;
  nEmbd?: number;
  dropout?: number;
}

type Callback = (
  model: any,
  loss: number,
  iter: number
) => Promise<void> | void;

export interface TrainConfig {
  epochs?: number;
  maxIter?: number;
  batchSize?: number;
  shuffle?: boolean;
  lr?: number;
  weightDecay?: boolean | number;
  callbacks?: Callback[];
}

export type Config = DatasetConfig & ModelConfig & TrainConfig;
