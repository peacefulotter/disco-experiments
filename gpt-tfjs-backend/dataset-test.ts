import * as tf from "@tensorflow/tfjs-node";
import { getDataset, getEncodedDataset, inference } from "./dataset.js";
import { DatasetConfig, ModelConfig } from "./types.js";
import { model } from "gpt-tfjs";
const { GPTLMHeadModel } = model;

interface DolphinFeature {
  feature_idx: number;
  name: string;
  type: {
    dtype: string;
    _type: string;
  };
}

interface DolphinRow {
  row_idx: number;
  row: {
    instruction: string;
    input: string;
    output: string;
  };
  truncated_cells: unknown[];
}

interface DolphinFile {
  features: DolphinFeature[];
  rows: DolphinRow[];
}

async function test() {
  // , (file: string) => {
  //     const { rows } = JSON.parse(file) as DolphinFile
  //     return rows.reduce( (acc, { row }) => {
  //         acc.xs.push(row.instruction + row.input)
  //         acc.ys.push(row.output)
  //         return acc
  //     }, {xs: [], ys: []} as PreprocessedData )
  // }
  const config: DatasetConfig & ModelConfig = {
    modelType: "gpt-nano",
    debug: false,

    vocabSize: 50257,
    chunkSize: 256,
    blockSize: 16,
    verbose: false,
  };

  const ds = await getDataset(tf, "wikitext-103/train", config);
  console.log(ds);
  const iter = await ds.iterator();
  const next = await iter.next();
  console.log(next);

  const ds_encoded = await getEncodedDataset(tf, "wikitext-103/train", config);
  console.log(ds_encoded);
  const iter_encoded = await ds_encoded.iterator();
  const next_encoded = await iter_encoded.next();
  console.log(next_encoded);

  // await ds.forEachAsync((a) => {
  //     console.log(typeof a + " => " + Object.keys(a) + ' -> ' + Object.values(a))
  // })

  const gpt = GPTLMHeadModel(config);
  await gpt.train(ds_encoded, { epochs: 1, verbose: true });

  const response = await inference(gpt, "What is life?");
  console.log("response", response);
}

await test();
