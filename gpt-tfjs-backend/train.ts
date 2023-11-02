import wandb from "@wandb/sdk";
import { model } from "gpt-tfjs";
import { getEncodedDataset } from "./dataset.js";
import { EncodedDataset } from "./types.js";
import { config, datasetName } from "./config.js";
const { GPTLMHeadModel } = model;

export default async function main(tf: any, prefix: string) {
  const date = new Date().toISOString();
  const dataset: EncodedDataset = await getEncodedDataset(
    tf,
    datasetName,
    config
  );

  console.log(config, prefix);

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
    console.log("here");

    wandb.log({
      "train/loss": loss,
      iter,
      mem: tf.memory().numBytes,
      dt_ms: Date.now() - time,
      time_s: (Date.now() - start) / 1000,
    });
    time = Date.now();
  };
  await gpt.train(dataset, { ...config, callbacks: [cb] });

  await wandb.finish();
}
