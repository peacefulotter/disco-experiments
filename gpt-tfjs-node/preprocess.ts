import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import { readdir } from "fs/promises";
import { encode } from "gpt-tokenizer/model/text-davinci-003";
import { Dataset, DatasetConfig, EncodedDataset } from "./types.js";

// For ts-node-esm
import { fileURLToPath } from "url";
import { config, datasetDir } from "./config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function createPreprocessDataset(
  tf: any,
  getStreams: () => fs.ReadStream[],
  config: DatasetConfig
) {
  const { blockSize, vocabSize, verbose } = config;
  async function* dataGenerator() {
    const streams = getStreams();
    if (verbose) console.log("Starting data generator");
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        const tokens = encode(text);

        if (blockSize >= tokens.length) {
          const x = tokens.slice(0, blockSize);
          x.push(...new Array(blockSize - x.length + 1).fill(vocabSize - 1));
          yield x;
          await sleep(1);
          continue;
        }

        for (let i = 0; i < tokens.length - blockSize - 1; i += blockSize) {
          const x = tokens.slice(i, i + blockSize + 1);
          yield x;
          await sleep(1);
        }
      }
    }
  }

  return tf.data
    .generator(dataGenerator as any)
    .map((x: number[]) =>
      tf.tidy(() => tf.cast(x, "int32"))
    ) as tf.data.Dataset<tf.Tensor<tf.Rank>>;
}

async function getFileStreams(dir: string, config: DatasetConfig) {
  const dirPath = path.join(__dirname, "datasets/", dir);
  const files = await readdir(dirPath);
  console.log("Found", files.length, "files in dataset");
  const getStreams = () =>
    files.map((file) =>
      fs.createReadStream(path.join(dirPath, file), {
        encoding: "utf8",
        highWaterMark: config.blockSize,
      })
    );
  return getStreams;
}

const getStreams = await getFileStreams("wikitext-103/train", config);
const dataset = createPreprocessDataset(tf, getStreams, config);

const maxLength = 4096;
let buffer = tf.buffer([maxLength, config.blockSize + 1], "int32"); //  tf.zeros([maxLength, config.blockSize + 1], "int32");
const idx = { pos: 0, save: 0 };
const dir = path.join(__dirname, "datasets/", "wikitext-103", "preprocessed");

const write = async (buffer: tf.TensorBuffer<tf.Rank, "int32">) => {
  const res = await fs.promises.writeFile(
    path.join(dir, `data-${idx.save}.pt`),
    JSON.stringify(buffer.toTensor().arraySync())
  );
  console.log("done", idx, res, tf.memory());
};

const iter = await dataset.iterator();
while (true) {
  const { value: v } = await iter.next();

  const data = v.dataSync();
  for (let i = 0; i < data.length; i++) {
    buffer.set(data[i], idx.pos, i);
  }
  idx.pos++;

  if (idx.pos >= maxLength) {
    await write(buffer);
    idx.save++;
    idx.pos = 0;
  }

  v.dispose();
}
