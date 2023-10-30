import { Config, JSONConfig } from "./types.js";
import _jsonConfig from "../config.json";

const jsonConfig = _jsonConfig as JSONConfig;

export const config: Config = {
  debug: false,

  modelType: jsonConfig.model,
  nHead: jsonConfig.n_head,
  nLayer: jsonConfig.n_layer,
  nEmbd: jsonConfig.n_embd,
  vocabSize: jsonConfig.vocab_size,
  dropout: jsonConfig.dropout,
  chunkSize: 1024, // TODO: seq_length
  blockSize: 32, // TODO: seq_length
  verbose: false,

  maxIter: jsonConfig.max_iters,
  batchSize: jsonConfig.batch_size,
  lr: jsonConfig.lr,
  weightDecay: jsonConfig.weight_decay,

  wandbProject: jsonConfig.wandb_project,
  wandbName: jsonConfig.wandb_name,
};

const datasetNames = {
  wikitext: "wikitext-103/train",
};

export const datasetName = datasetNames[jsonConfig.dataset];
