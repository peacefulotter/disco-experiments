import * as tf from "@tensorflow/tfjs";
import { model } from "gpt-tfjs";
import { getPreprocessedDataset } from "./dataset";
import { Config } from "./types";
import evaluate from "./evaluate";
import * as wandb from './wandb'
const { GPTLMHeadModel } = model;

export const getConfig = async (split: string) => {
  console.log('Getting config on', split, 'split');
  
  const res = await fetch("/api/config", {
     method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ split }),
    });
  const { config } = await res.json();
  return config as Config;
};

export default async function main(prefix: string) {
  const date = new Date().toISOString();
  const train_config = await getConfig('train');
  const eval_config = await getConfig('val');
  const dataset = await getPreprocessedDataset(train_config);

  console.log(train_config);

  const save: any = { init: undefined, logs: [] }
  await wandb.init(save, train_config, prefix, date)

  console.log("Running", train_config.modelType);
  const gpt = GPTLMHeadModel(train_config);

  const start = Date.now();
  let time = start;
  const cb = async (model: any, loss: number, iter: number) => {
    console.log(iter);
    
    const payload = {
      "train/loss": loss,
      iter,
      mem: tf.memory().numBytes,
      dt_ms: Date.now() - time,
      time_s: (Date.now() - start) / 1000,
    }

    if (iter % eval_config.eval_freq == 0) {
      const eval_res = await evaluate(tf, model, eval_config)
      Object.assign(payload, eval_res)
      // TODO: eval like in llm-baselines with table
    }

    await wandb.log(save, payload)
    time = Date.now();
  };

  await gpt.train(dataset, {
    ...train_config,
    shuffle: "batch",
    callbacks: [cb],
  });

  await wandb.finish(save)
}
