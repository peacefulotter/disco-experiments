import wandb from "@wandb/sdk";
import { model } from "gpt-tfjs";
import { getPreprocessedDataset } from "./dataset.js";
import { config, datasetDir } from "./config.js";
import evaluate from "./evaluate.js";
const { GPTLMHeadModel } = model;



export default async function main(tf: any, prefix: string) {
  const date = new Date().toISOString();
  const train_dataset = await getPreprocessedDataset(tf, datasetDir, 'train', config);
  let eval_dataset = await getPreprocessedDataset(tf, datasetDir, 'val', config);
  eval_dataset = eval_dataset.batch(config.batchSize)

  console.log(config, prefix);

  await wandb.init({
    project: config.wandbProject,
    name: `node_${prefix}_${config.wandbName}`,
    config: { ...config, date },
  });

  console.log("Running", config.modelType);
  const gpt = GPTLMHeadModel(config);

  const start = Date.now();
  let time = start;
  const cb = async (model: any, loss: number, iter: number) => {
    const payload = {
      "train/loss": loss,
      iter,
      mem: tf.memory().numBytes,
      dt_ms: Date.now() - time,
      time_s: (Date.now() - start) / 1000,
    }

    if (iter % config.eval_freq == 0) {
      const eval_res = await evaluate(tf, model, eval_dataset, config)
      Object.assign(payload, eval_res)
      // TODO: eval like in llm-baselines with table
    }

    wandb.log(payload);
    time = Date.now();
  };
  await gpt.train(train_dataset, {
    ...config,
    shuffle: "batch",
    callbacks: [cb],
  });

  await wandb.finish();
}
