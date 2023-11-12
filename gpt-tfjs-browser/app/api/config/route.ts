import fs from "fs/promises";
import path from "path";
import { Config, JSONConfig } from "@/ml/types";

const datasetsDir = {
  wikitext: "wikitext-103/preprocessed",
};

const getJSONConfig = async () => {
  const symlinkPath = path.join(process.cwd(), "public/config.json");
  const realPath = await fs.readlink(symlinkPath, "utf-8");
  const configPath = path.join(process.cwd(), realPath);
  const textConfig = await fs.readFile(configPath, "utf-8");
  return JSON.parse(textConfig) as JSONConfig;
};

export async function POST(req: Request) {
  const { split } = await req.json()
  const jsonConfig = await getJSONConfig();

  const dir = datasetsDir[jsonConfig.dataset as keyof typeof datasetsDir];
  const datasetDir = path.join(
    process.cwd(),
    "../gpt-tfjs-node/datasets/",
    dir,
    split
  );
  const files = await fs.readdir(datasetDir);
  console.log("Found", files.length, "files in dataset under", datasetDir);

  const config: Config = {
    debug: false,
    dir: datasetDir,
    split,
    files,

    modelType: jsonConfig.model,
    nHead: jsonConfig.n_head,
    nLayer: jsonConfig.n_layer,
    nEmbd: jsonConfig.n_embd,
    vocabSize: jsonConfig.vocab_size,
    dropout: jsonConfig.dropout,
    blockSize: jsonConfig.seq_length,
    verbose: false,

    maxIter: jsonConfig.max_iters,
    batchSize: jsonConfig.batch_size,
    lr: jsonConfig.lr,
    weightDecay: jsonConfig.weight_decay,

    wandbProject: jsonConfig.wandb_project,
    wandbName: jsonConfig.wandb_name,
    eval_freq: jsonConfig.eval_freq,
    eval_seq_prefix: jsonConfig.eval_seq_prefix,
    max_eval_batches: jsonConfig.max_eval_batches
  };

  return Response.json({ config });
}
