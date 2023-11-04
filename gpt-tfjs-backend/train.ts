import wandb from "@wandb/sdk";
import { model } from "gpt-tfjs";
import { getEncodedDataset, getPreprocessedDataset } from "./dataset.js";
import { config, datasetDir } from "./config.js";
const { GPTLMHeadModel } = model;

export default async function main(tf: any, prefix: string) {
  const date = new Date().toISOString();
  const dataset = await getPreprocessedDataset(tf, datasetDir, config);

  console.log(config, prefix, dataset);

  await wandb.init({
    project: config.wandbProject,
    name: `${prefix}_${config.wandbName}`,
    config: { ...config, date },
  });

  console.log("Running", config.modelType);
  const gpt = GPTLMHeadModel(config);

  const start = Date.now();
  let time = start;
  const cb = async (_: any, loss: number, iter: number) => {
    wandb.log({
      "train/loss": loss,
      iter,
      mem: tf.memory().numBytes,
      dt_ms: Date.now() - time,
      time_s: (Date.now() - start) / 1000,
    });
    time = Date.now();
  };
  await gpt.train(dataset, {
    ...config,
    /*shuffle: "batch", */ callbacks: [cb],
  });

  await wandb.finish();
}
