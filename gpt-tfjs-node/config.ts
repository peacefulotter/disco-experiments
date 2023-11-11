import { Config, JSONConfig } from "./types.js";
import _jsonConfig from "../config.json" assert { type: "json" };

const jsonConfig = _jsonConfig as JSONConfig;

export const config: Config = {
  debug: false,

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
  eval_seq_prefix: jsonConfig.eval_seq_prefix
};

const datasetsDir = {
  wikitext: "wikitext-103/preprocessed",
};

export const datasetDir = datasetsDir[jsonConfig.dataset];
