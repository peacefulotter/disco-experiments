import * as tf from "@tensorflow/tfjs-node"
import { model } from "gpt-tfjs";
import { getPreprocessedDataset } from "./dataset.js";
import { config, datasetDir } from "./config.js";
import evaluate from "./evaluate.js";
const { GPTLMHeadModel } = model;

let eval_dataset = await getPreprocessedDataset(tf, datasetDir, 'val', config);
eval_dataset = eval_dataset.batch(128)
const gpt = GPTLMHeadModel(config);
const res = await evaluate(tf, gpt, eval_dataset, config)
console.log(res);
console.log(tf.memory());