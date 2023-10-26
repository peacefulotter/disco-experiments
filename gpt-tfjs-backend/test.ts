import * as tf from "@tensorflow/tfjs-node";
import { model } from "gpt-tfjs";
import { getDataset, inference } from "./dataset.js";
import {
  DatasetConfig,
  ModelConfig,
  TrainingSample,
  Dataset,
} from "./types.js";

async function runModels(
  dir: string,
  dataset: Dataset,
  config: DatasetConfig & ModelConfig
) {
  const path = "file://./models/" + dir + "/model.json";
  const gpt = await tf.loadLayersModel(path);

  // const gpt = GPTLMHeadModel(config);
  // await gpt.load(path);
  // console.log("after loading");

  const start = Date.now();
  const iterator = await dataset.iterator();
  await iterator.next();
  for (let i = 0; i < 10; i++) {
    const { value } = await iterator.next();
    const { text } = value;
    console.log("==== text: ", text);
    const t = text.slice(0, 31);
    console.log(t);
    const res = await inference(gpt, t);
    console.log("==== res: ", res);
  }

  const end = Date.now();
  const performance = (end - start) / dataset.size;
}

const config: DatasetConfig & ModelConfig = {
  debug: false,

  vocabSize: 50257,
  chunkSize: 1024,
  blockSize: 32,
  verbose: false,
};

const dataset = await getDataset("wikitext-103/train", config);
// const config: DatasetConfig & Record<string, any> = {
// 	vocabSize: 1024,
// 	blockSize: 16,
// 	batchSize: 1
// }
// const dataset = await getDataset('openwebtext', config)
const dir = "2023-10-23T20:34:32.822Z-gpt-nano-60000";
const modelType = "gpt-nano";
await runModels(dir, dataset, { ...config, modelType });
