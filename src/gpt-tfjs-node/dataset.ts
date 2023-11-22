import fs from "fs";
import path from "path";
import { readdir } from "fs/promises";
import { encode } from "gpt-tokenizer/model/text-davinci-003";
import {
  Dataset,
  DatasetConfig,
  EncodedDataset,
} from "./types.js";

// For ts-node-esm
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TokenizedGenerator = () => AsyncGenerator<
  {
    x: number[];
    y: number[];
  },
  void,
  unknown
>;

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

export async function getDataset(tf: any, dir: string, config: DatasetConfig) {
  const getStreams = await getFileStreams(dir, config);
  async function* dataGenerator() {
    const streams = getStreams();
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        yield { text };
        await sleep(1);
      }
    }
  }
  return tf.data.generator(dataGenerator as any) as Dataset;
}

const tokenizedGenerator = (
  tf: any,
  generator: TokenizedGenerator,
  vocabSize: number
) => {
  return tf.data
    .generator(generator as any)
    .map((v: { x: number[]; y: number[] }) => ({
      x: tf.tensor1d(v.x, "int32"),
      y: tf.oneHot(v.y, vocabSize),
    })) as EncodedDataset;
};

export async function getPreprocessedDataset(
  tf: any,
  dir: string,
  split: string,
  config: DatasetConfig
) {
  const { vocabSize } = config;
  const split_dir = path.join(dir, split)
  const filesContentGetter = await getFilesContent(split_dir);

  const generator: TokenizedGenerator = async function* () {
    const files = filesContentGetter();
    for await (const file of files) {
      const tensors = JSON.parse(file);
      for (const tokens of tensors) {
        const x = tokens.slice(0, -1);
        const y = tokens.slice(1);
        yield { x, y };
        await sleep(1);
      }
    }
  };
  return tokenizedGenerator(tf, generator, vocabSize);
}

export async function getEncodedDataset(
  tf: any,
  dir: string,
  config: DatasetConfig
) {
  const { blockSize, vocabSize, verbose } = config;
  const getStreams = await getFileStreams(dir, config);

  const generator: TokenizedGenerator = async function* () {
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
  };
  return tokenizedGenerator(tf, generator, vocabSize);
}

const getFilesInDir = async (dir: string): Promise<[string, string[]]> => {
  const dirPath = path.join(__dirname, "datasets/", dir);
  const files = await readdir(dirPath);
  console.log("Found", files.length, "files in dataset");
  return [dirPath, files];
};

async function getFileStreams(dir: string, config: DatasetConfig) {
  const [dirPath, files] = await getFilesInDir(dir);
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

async function getFilesContent(dir: string) {
  const [dirPath, files] = await getFilesInDir(dir);
  return () =>
    files.map(
      async (file) =>
        await fs.promises.readFile(path.join(dirPath, file), {
          encoding: "utf8",
        })
    );
}