import wandb from "@wandb/sdk";
import { model } from "gpt-tfjs";
import { getEncodedDataset } from "./dataset.js";
import { EncodedDataset, Config } from "./types.js";
const { GPTLMHeadModel } = model;

const getName = (args: Config) => {
  return `js_${args.modelType}_lr${args.lr}_bs${args.batchSize}x1_1nodes`;
};

const defaultConfig: Config = {
  debug: false,

  vocabSize: 50257,
  chunkSize: 1024,
  blockSize: 32,
  verbose: false,

  epochs: 1,
  maxIter: 3600,
  batchSize: 16,
  lr: 0.0002,
  weightDecay: 1e-3,
};

// const dataset = await getDataset('openwebtext', config)

export default async function main(
  tf: any,
  datasetName: string,
  modelType: string
) {
  const date = new Date().toISOString();
  const config = { ...defaultConfig, modelType };
  const dataset: EncodedDataset = await getEncodedDataset(datasetName, config);

  await wandb.init({
    project: "my-project",
    name: getName(config),
    config: { ...config, date },
  });

  console.log("Running", modelType);
  const gpt = GPTLMHeadModel(config);

  let time = Date.now();
  const cb = async (_: any, loss: number, iter: number) => {
    wandb.log({
      "train/loss": loss,
      iter,
      mem: tf.memory().numBytes,
      dt_ms: Date.now() - time,
      time: Date.now(),
    });
    time = Date.now();
  };
  await gpt.train(dataset, { ...config, callbacks: [cb] });

  await wandb.finish();
}
