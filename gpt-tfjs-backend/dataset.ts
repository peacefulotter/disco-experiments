import fs from "fs";
import path from "path";
import { readdir } from "fs/promises";
// import { decode, encode } from "gpt-tokenizer";
import { decode, encode } from "gpt-tokenizer/esm/model/text-davinci-003";
import { model } from "gpt-tfjs";
import { Dataset, DatasetConfig, EncodedDataset } from "./types.js";
import { generate } from "gpt-tfjs/src/model.js";

const { GPTLMHeadModel } = model;

// For ts-node-esm
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function createDataset(
  tf: any,
  getStreams: () => fs.ReadStream[],
  config: DatasetConfig
) {
  let runs = 0;
  let steps = 0;
  async function* dataGenerator() {
    const streams = getStreams();
    if (config.verbose) console.log("Starting data generator:", runs++);
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        yield { text };
        steps++;
        await sleep(1);
      }
    }
  }

  return tf.data.generator(dataGenerator as any) as Dataset;
}

function createEncodedDataset(
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
        if (verbose)
          console.log(
            `Stream chunk: ${text.slice(0, 40)}... (${tokens.length} tokens)`
          );

        if (blockSize >= tokens.length) {
          const x = tokens.slice(0, blockSize);
          const y = tokens.slice(1, blockSize + 1);
          x.push(...new Array(blockSize - x.length).fill(vocabSize - 1));
          y.push(...new Array(blockSize - y.length).fill(vocabSize - 1));
          yield { x, y };
        }

        for (let i = 0; i < tokens.length - blockSize - 1; i += blockSize) {
          const x = tokens.slice(i, i + blockSize);
          const y = tokens.slice(i + 1, i + blockSize + 1);
          yield { x, y };
          await sleep(1);
        }

        await sleep(1);
      }
    }
  }

  return tf.data
    .generator(dataGenerator as any)
    .map((v: { x: number[]; y: number[] }) =>
      tf.tidy(() => ({
        x: tf.cast(v.x, "int32"),
        y: tf.oneHot(tf.cast(v.y, "int32"), vocabSize),
      }))
    ) as EncodedDataset;
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

export async function getEncodedDataset(
  tf: any,
  dir: string,
  config: DatasetConfig
) {
  const getStreams = await getFileStreams(dir, config);
  return createEncodedDataset(tf, getStreams, config);
}

export async function getDataset(tf: any, dir: string, config: DatasetConfig) {
  const getStreams = await getFileStreams(dir, config);
  return createDataset(tf, getStreams, config);
}

export async function inference(model: typeof GPTLMHeadModel, text: string) {
  const tokens = encode(text);
  const outputs = await generate(
    model,
    tokens,
    { maxLength: 32, temperature: 1, doSample: false },
    async (g: any) => {
      // const idx = g.idxNext;
      // const t = decode(idx[0]);
      console.log(` time: ${g.timePerToken}`);
      await new Promise((r) => setTimeout(r, 1));
    }
  );
  return decode(outputs[0]);
}
