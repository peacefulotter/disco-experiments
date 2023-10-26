import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import { readdir } from "fs/promises";
// import { decode, encode } from "gpt-tokenizer";
import { decode, encode } from "gpt-tokenizer/esm/model/text-davinci-003";
import { model } from "gpt-tfjs";
import {
  Dataset,
  DatasetConfig,
  EncodedDataset,
  TokenizedData,
} from "./types.js";
import { generate } from "gpt-tfjs/src/model.js";

const { GPTLMHeadModel } = model;
const tokenizer = GPTLMHeadModel.tokenizer;

// For ts-node-esm
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const loadFile = async (path: string, file: string, extractor: (file: string) => PreprocessedData) => {
//     const text: string = await readFile('datasets/' + path + '/' + file, {encoding: 'utf-8'})
//     const { xs, ys } = extractor(text)
//     if (xs.length !== ys.length)
//         throw new Error('xs and ys are not the same size after preprocessing the dataset')
//     return { xs, ys }
// }

// const preprocess = ({ xs, ys }: PreprocessedData): TokenizedData => {
//     const maxLength = xs
//         .map(x => tf.tensor(encode(x)))
//         .reduce((a, c) => Math.max(a, c.shape[0]), 0)

//     return {
//         xs: tf.tensor(xs.map(x => encode(x))).pad([[0, maxLength]]),
//         ys: tf.tensor(ys.map(y => encode(y)))
//     }
// }

// const preprocess = (
//   x: string,
//   { vocabSize, blockSize }: DatasetConfig
// ): TokenizedData => {
//   // TODO: use gpt-tfjs tokenizer
//   // const tokens = encode(x)
//   console.log(GPTLMHeadModel);

//   const encoded = tokenizer.encode(x);
//   console.log("encoded", encoded);

//   const { bpe: tokens } = encoded;
//   const over = tokens.reduce(
//     (acc, cur) =>
//       [Math.max(acc[0], cur), acc[1] || cur > vocabSize] as [number, boolean],
//     [0, false] as [number, boolean]
//   );
//   console.log("Token over vocabSize ?", over);
//   console.log(tokens.sort((a, b) => (a < b ? 1 : -1)).slice(0, 100));

//   const xs: number[][] = [];
//   const ys: number[][] = [];
//   for (let i = 0; i < tokens.length - 1 - blockSize; i++) {
//     xs.push(tokens.slice(i, i + blockSize));
//     ys.push(tokens.slice(i + 1, i + 1 + blockSize));
//   }
//   return {
//     xs: tf.cast(tf.tensor(xs), "int32"),
//     ys: tf.oneHot(tf.cast(ys, "int32"), vocabSize),
//   };
// };

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function createDatasetFromTextStreams(
  getStreams: () => fs.ReadStream[],
  config: DatasetConfig
) {
  const { blockSize, vocabSize, verbose } = config;
  let runs = 0;
  let steps = 0;
  async function* dataGenerator() {
    const streams = getStreams();
    if (verbose) console.log("Starting data generator:", runs++);
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

function createEncodedDatasetFromTextStreams(
  getStreams: () => fs.ReadStream[],
  config: DatasetConfig
) {
  const { blockSize, vocabSize, verbose } = config;
  let runs = 0;
  let steps = 0;
  async function* dataGenerator() {
    const streams = getStreams();
    if (verbose) console.log("Starting data generator:", runs++);
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        const tokens = encode(text);
        if (verbose)
          console.log(
            `Stream chunk: ${text.slice(0, 40)}... (${tokens.length} tokens)`
          );
        for (let i = 0; i < tokens.length - blockSize - 1; i += blockSize) {
          const x = tokens.slice(i, i + blockSize);
          const y = tokens.slice(i + 1, i + blockSize + 1);
          yield { x, y };
          steps++;
          await sleep(1);
        }
        await sleep(1);
      }
    }
  }

  return tf.data
    .generator(dataGenerator as any)
    .map((v: { x: number[]; y: number[] }) => ({
      x: tf.cast(v.x, "int32"),
      y: tf.oneHot(tf.cast(v.y, "int32"), vocabSize),
    })) as EncodedDataset;
}

async function createDataset(dir: string) {
  const dirPath = path.join(__dirname, "datasets/", dir);
  const files = await readdir(dirPath);
  console.log("Found", files.length, "files in dataset");
  const getStreams = () =>
    files.map((file) =>
      fs.createReadStream(path.join(dirPath, file), {
        encoding: "utf8",
        highWaterMark: 256,
      })
    );
  return getStreams;
}

export async function getEncodedDataset(dir: string, config: DatasetConfig) {
  const getStreams = await createDataset(dir);
  return createEncodedDatasetFromTextStreams(getStreams, config);
}

export async function getDataset(dir: string, config: DatasetConfig) {
  const getStreams = await createDataset(dir);
  return createDatasetFromTextStreams(getStreams, config);
}

// , extractor: (text: string) => PreprocessedData
// export default async function getDataset(
//   path: string,
//   config: DatasetConfig
// ): Promise<Dataset> {
//   const files = await readdir("datasets/" + path);
//   return tf.data.generator(async function* () {
//     let idx = 0;
//     let innerIdx = 0;
//     let preprocessed: TokenizedData | undefined = undefined;

//     while (idx < files.length) {
//       if (!preprocessed || innerIdx >= preprocessed.xs.shape[0]) {
//         const data = await readFile("datasets/" + path + "/" + files[idx], {
//           encoding: "utf-8",
//         });
//         preprocessed = preprocess(data, config);
//         console.log(preprocessed.xs.shape);
//         console.log(preprocessed.ys.shape);

//         if (innerIdx >= preprocessed.xs.shape[0]) {
//           innerIdx = 0;
//           idx++;
//         }
//       }

//       if (idx >= files.length) break;
//       // yield { value: {x: tf.tensor([]), y: tf.tensor([])}, done: true } as DatasetSample

//       const res: DatasetSample = {
//         value: {
//           x: preprocessed.xs[innerIdx],
//           y: preprocessed.ys[innerIdx],
//         },
//         done: false,
//       };
//       innerIdx++;
//       yield res;
//     }
//   } as any); // Forced as any because tfjs expects only Iterators in typescript....
// }

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
