import * as tf from "@tensorflow/tfjs";
import { model } from "gpt-tfjs";
import { getPreprocessedDataset } from "./dataset";
import { Config } from "./types";
const { GPTLMHeadModel } = model;

const getConfig = async () => {
  const res = await fetch("/api/config");
  console.log(res);
  const { config } = await res.json();
  return config as Config;
};

export default async function main(prefix: string) {
  const date = new Date().toISOString();
  const config = await getConfig();
  const dataset = await getPreprocessedDataset(config);

  console.log(config);

  await fetch("/api/wandb/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      config,
      prefix,
      date,
    }),
  });

  console.log("Running", config.modelType);
  const gpt = GPTLMHeadModel(config);

  const start = Date.now();
  let time = start;
  const cb = async (_: any, loss: number, iter: number) => {
    console.log(iter);
    await fetch("/api/wandb/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "train/loss": loss,
        iter,
        mem: tf.memory().numBytes,
        dt_ms: Date.now() - time,
        time_s: (Date.now() - start) / 1000,
      }),
    });
    time = Date.now();
  };

  const iter = await dataset.iterator();
  const next = await iter.next();
  console.log(next);

  await gpt.train(dataset, {
    ...config,
    shuffle: "batch",
    callbacks: [cb],
  });

  await fetch("/api/wandb/finish", {
    method: "POST",
  });
}
