import { writeFile } from "fs/promises";
import * as tf from "@tensorflow/tfjs-node";
import { model } from "gpt-tfjs";
import { getEncodedDataset } from "./dataset.js";
import {
  EncodedDataset,
  DatasetConfig,
  configs,
  ModelConfig,
  TrainingSample,
} from "./types.js";
const { GPTLMHeadModel } = model;

function pad(num: number, size: number) {
  let n = num.toString();
  while (n.length < size) n = "0" + n;
  return n;
}

const callback =
  (samples: TrainingSample[], start: number, date: string, modelType: any) =>
  async (model: any, loss: number, iter: number) => {
    samples.push({ loss, time: Date.now() - start, mem: tf.memory().numBytes });
    if (iter % 5000 === 0) {
      const path = `file://./models/${date}-${modelType}-${iter}`;
      console.log("Saving to", path);
      await model.save(path);
    }
  };

async function runModels(
  dataset: EncodedDataset,
  defaultConfig: DatasetConfig & ModelConfig
) {
  const date = new Date().toISOString();

  for (const modelType of configs) {
    console.log("Running", modelType);

    const config = { ...defaultConfig, modelType };
    const gpt = GPTLMHeadModel(config);

    const start = Date.now();
    const samples: TrainingSample[] = [];
    const cb = callback(samples, start, date, modelType);
    await gpt.train(dataset, {
      epochs: 1,
      verbose: true,
      callbacks: [cb],
    });
    const end = Date.now();
    const performance = (end - start) / dataset.size;

    // const path = "models/" + date + "-" + modelType;
    // await gpt.save(path);

    const benchmark = { samples, performance };
    await writeFile(
      `./benchmarks/benchmark-${date}-${modelType}.json`,
      JSON.stringify(benchmark, null, 2),
      "utf8"
    );
  }
}

const config: DatasetConfig & ModelConfig = {
  debug: false,

  vocabSize: 50257,
  chunkSize: 1024,
  blockSize: 32,
  verbose: false,
};

const dataset = await getEncodedDataset("wikitext-103/train", config);
// const config: DatasetConfig & Record<string, any> = {
// 	vocabSize: 1024,
// 	blockSize: 16,
// 	batchSize: 1
// }
// const dataset = await getDataset('openwebtext', config)
await runModels(dataset, config);
